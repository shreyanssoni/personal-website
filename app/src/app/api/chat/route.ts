import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "@/lib/supabase";

const Resume = `Shreyans Soni 982-706-7491 • sonishreyans01@gmail.com • Website • LinkedIn • GitHub. My socials: Github: https://github.com/shreyanssoni, Linkedin: linkedin.com/in/shreyans-soni X: x.com/abitofsoni, Hometown: Indore, MP, Current City: Bengaluru, KA. Education Birla Institute of Technology & Science Pilani, Hyderabad Campus Nov 2020 – Jul 2024 Bachelor of Engineering in Electronics and Instrumentation Hyderabad, Telangana Relevant Coursework: Artificial Intelligence, Computer Programming, Operating Systems, Digital Design, Object Oriented Programming, Cryptography, Internet of Things, Microprocessors, Probability & Statistics Skills Languages: Python, Java, C, C++, HTML/CSS, JavaScript, SQL Developer Tools: VS Code, AWS SageMaker, Docker, Autotrain, Redis, CUDA Technologies/Frameworks: React, Next, Node, MongoDB, Linux, Neural Networks, GitHub, Deep Learning, Machine Learning, Transformers, NLP, Computer Vision, Parallel Processing, Fine tuning, LangChain, Llama Index, RAG systems, WebSockets, HTTP, OpenCV, PyTorch, Keras, TensorFlow Experience ArgenBright Innovation Labs Jan 2024 - Present AI Intern Bengaluru, Karnataka • Worked on a security platform, implementing real time face recognition and pose estimation along with model training • Improved the output frame rate by approx. 7 times through implementation of parallel processing and batching • Worked on projects such as multi-lingual speech enabled conversational AI using LLMs and frameworks Arbunize Digital Media May 2022 - Jul 2022 Web Development Intern Remote • Worked on the VideoWiki Class website to update UI elements in React and NodeJS • Fixed over 14 issues over the course of a month for the website, fixed multiple bugs and enhanced the React UI Projects Crop Stage Regressor | Random Forest, Machine Learning May 2023 - May 2023 • Developed and engineered a model using Random Forest Regressor, to predict the optimal parameter levels for various crops at different growth stages, achieving over 83% accuracy • Performed feature engineering, and data preprocessing for the model and achieved an MAE of under 10% VS Code Extension for Test Case Generation | Web Development, Artificial Intelligence Feb 2024 - Mar 2024 • Fine-tuned an LLM for test case generation using transformer Libraries, which resulted in increased accuracy by 20% • Implemented a 4-bit PEFT-quantized model on low computational CPU device as the backend model Automated Task Scheduler using LLMs | Generative AI, Web Development Mar 2024 - May 2024 • Developed a smart task scheduler using Llama Index agents integrated with Gemini, to organize user tasks • Implemented Redis Cache for faster access and updating tasks improving response time • Built the backend with Flask and integrated a MongoDB database for data storage Multilingual Speech Integrated RAG Conversational AI | Server Optimization, Full Stack Apr 2024 - May 2024 • Deployed a ReAct Agent using Llama Index for the conversational engine and reduced server latency and average inference time by 85% • Implemented multilingual speech abilities (TTS & STT), in 53 languages, to a LangChain RAG system, using Whisper • Developed a backend in Python and implemented real-time communication using Socket.IO Distributed Graph Database System Simulation | Operating Systems, Databases Nov 2023 - Dec 2023 • POSIX based multithreaded program written in C, simulating a load balancer, clients and servers • Implemented inter-process communication mechanisms, including message queues and shared memory with semaphores, with multi threaded algorithms for Depth-First Search (DFS) and Breadth-First Search (BFS) traversals Leadership / Extracurricular Entrepreneurship Cell, BPHC Jun 2022 - Jun 2023 Vice Chairman Launchpad • Headed one of the largest Entrepreneurial Summit in South India, involving over 500 participants from various cities, renowned speakers, internship drive, and national level competitions.`;

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const userMessage: string = data.message;
    const sessionId: string = data.session;

    // Easter eggs
    if (userMessage.includes("/download")) {
      return NextResponse.json({
        updatedData:
          "Here is the link to download my resume!\n<<Link>>https://drive.google.com/drive/folders/17RtGQ9Tqm9nzuPXj8FvE3aGkoUS2Knq6",
        success: true,
      });
    }

    if (userMessage.includes("/queenriri")) {
      return NextResponse.json({
        updatedData: "Cutu people like you are princesss\u{1F451}\u{2764}\uFE0F",
        success: true,
      });
    }

    if (userMessage.includes("/7wingies")) {
      return NextResponse.json({
        updatedData: "a bunch of misfits craving for sauce\u{1F90C}\u{1F3FC}",
        success: true,
      });
    }

    // Gemini call
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: `You are Shreyans. \n\nUse the data: ${Resume} and reformat it to answer the question. If the data is not present or not appropriate, tell acc. to what is available. Donot make up information on your own. Answer in first person as Shreyans, in a friendly manner. But if the query is general - like greetings, etc. answer based generally. Dont answer in hate or incorrect things. be general and try to avoid controversies. be aesthetic in your answers. be aesthetic as a writer. Respond in SHORT.`,
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "Understood! I'm Shreyans and I'll answer questions about myself based on my resume and background. I'll keep it short and aesthetic.",
            },
          ],
        },
      ],
    });

    const result = await chat.sendMessage(
      `Query: ${userMessage}. Make the response concise. If data not there, answer generically with a response based on query and data reformatting it.`
    );
    const response = result.response.text();

    // Store in Supabase
    try {
      const supabase = createServerClient();

      // Ensure session exists
      await supabase
        .from("chat_sessions")
        .upsert({ session_id: sessionId }, { onConflict: "session_id" });

      // Store both messages
      await supabase.from("chat_messages").insert([
        {
          session_id: sessionId,
          role: "user",
          content: userMessage,
        },
        {
          session_id: sessionId,
          role: "bot",
          content: response,
        },
      ]);
    } catch (dbError) {
      // Don't fail the response if DB write fails
      console.error("Failed to store chat message:", dbError);
    }

    return NextResponse.json({ updatedData: response, success: true });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { updatedData: "Something went wrong.", success: false },
      { status: 500 }
    );
  }
}
