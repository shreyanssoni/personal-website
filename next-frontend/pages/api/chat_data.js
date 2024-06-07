// pages/api/data.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
import { Gemini, QueryEngineTool } from "llamaindex";
// import fs from "node:fs/promises";
import run from "../../mongoDbConfig";

import {
    Document,
    GeminiEmbedding,
    Settings,
    VectorStoreIndex,
    storageContextFromDefaults,
    ContextChatEngine
  } from "llamaindex";
import { Timestamp } from "mongodb";

Settings.llm = new Gemini({
    model: "gemini-pro"
    // apiKey: "<YOUR_API_KEY>",
});

Settings.embedModel = new GeminiEmbedding();

// const allMessages = [];

const Resume = "Shreyans Soni 982-706-7491 • sonishreyans01@gmail.com • Website • LinkedIn • GitHub Education Birla Institute of Technology & Science Pilani, Hyderabad Campus Nov 2020 – Jul 2024 Bachelor of Engineering in Electronics and Instrumentation Hyderabad, Telangana Relevant Coursework: Artificial Intelligence, Computer Programming, Operating Systems, Digital Design, Object Oriented Programming, Cryptography, Internet of Things, Microprocessors, Probability & Statistics Skills Languages: Python, Java, C, C++, HTML/CSS, JavaScript, SQL Developer Tools: VS Code, AWS SageMaker, Docker, Autotrain, Redis, CUDA Technologies/Frameworks: React, Next, Node, MongoDB, Linux, Neural Networks, GitHub, Deep Learning, Machine Learning, Transformers, NLP, Computer Vision, Parallel Processing, Fine tuning, LangChain, Llama Index, RAG systems, WebSockets, HTTP, OpenCV, PyTorch, Keras, TensorFlow Experience ArgenBright Innovation Labs Jan 2024 - Present AI Intern Bengaluru, Karnataka • Worked on a security platform, implementing real time face recognition and pose estimation along with model training • Improved the output frame rate by approx. 7 times through implementation of parallel processing and batching • Worked on projects such as multi-lingual speech enabled conversational AI using LLMs and frameworks Arbunize Digital Media May 2022 - Jul 2022 Web Development Intern Remote • Worked on the VideoWiki Class website to update UI elements in React and NodeJS • Fixed over 14 issues over the course of a month for the website, fixed multiple bugs and enhanced the React UI Projects Crop Stage Regressor | Random Forest, Machine Learning May 2023 - May 2023 • Developed and engineered a model using Random Forest Regressor, to predict the optimal parameter levels for various crops at different growth stages, achieving over 83% accuracy • Performed feature engineering, and data preprocessing for the model and achieved an MAE of under 10% VS Code Extension for Test Case Generation | Web Development, Artificial Intelligence Feb 2024 - Mar 2024 • Fine-tuned an LLM for test case generation using transformer Libraries, which resulted in increased accuracy by 20% • Implemented a 4-bit PEFT-quantized model on low computational CPU device as the backend model Automated Task Scheduler using LLMs | Generative AI, Web Development Mar 2024 - May 2024 • Developed a smart task scheduler using Llama Index agents integrated with Gemini, to organize user tasks • Implemented Redis Cache for faster access and updating tasks improving response time • Built the backend with Flask and integrated a MongoDB database for data storage Multilingual Speech Integrated RAG Conversational AI | Server Optimization, Full Stack Apr 2024 - May 2024 • Deployed a ReAct Agent using Llama Index for the conversational engine and reduced server latency and average inference time by 85% • Implemented multilingual speech abilities (TTS & STT), in 53 languages, to a LangChain RAG system, using Whisper • Developed a backend in Python and implemented real-time communication using Socket.IO Distributed Graph Database System Simulation | Operating Systems, Databases Nov 2023 - Dec 2023 • POSIX based multithreaded program written in C, simulating a load balancer, clients and servers • Implemented inter-process communication mechanisms, including message queues and shared memory with semaphores, with multi threaded algorithms for Depth-First Search (DFS) and Breadth-First Search (BFS) traversals Leadership / Extracurricular Entrepreneurship Cell, BPHC Jun 2022 - Jun 2023 Vice Chairman Launchpad • Headed one of the largest Entrepreneurial Summit in South India, involving over 500 participants from various cities, renowned speakers, internship drive, and national level competitions."

async function llama_run(data){
    // const persistDir = "storage/";
    let index; 
  // Function to check if the storage directory exists
    // if(fs.existsSync(persistDir)){
    //   console.log('storage persists!')
    //     const secondStorageContext = await storageContextFromDefaults({
    //         persistDir: persistDir,
    //     });
    //     index = await VectorStoreIndex.init({
    //         storageContext: secondStorageContext,
    //     });

    // } else {
    const path = "public/resume.txt";

    const essay = Resume; 

    // Create Document object with essay
    const document = new Document({ text: essay, id_: path });
    // const storageContext = await storageContextFromDefaults({
    //     persistDir: persistDir,
    //   });
    
    index = await VectorStoreIndex.fromDocuments([document]);
    // }

    const retriever = index.asRetriever();
    const chatEngine = new ContextChatEngine({ retriever });
    const response = await chatEngine.chat({ message: `You are Shreyans Soni. Based on the query answer: ${data}. If not data is present.` });

    return response['response']
  // }
}


export default async function handler (req, res) {
    if (req.method === 'POST') {
      // Get data from the request body
        const data = req.body;
        // console.log(data)
        // const model = genAI.getGenerativeModel({ model: "gemini-pro"});
        const llm = new Gemini({
            model: "gemini-pro",
            // additionalChatOptions: { response_format: { type: "json_object" } },
          });
        
        // if(data.includes("status code 999 exit.")){
        //   const new_data = data.split('status code 999 exit.')
        //   // console.log(allMedassages)
        //   await run({
        //     session_id : new_data[0],
        //     recorded_messages : new_data[1]
        //   })
        //   res.status(200).json({message: 'success'})
        //   return 
        // }
    
        // const prompt = data;
        const response = await llama_run(data['message'])
        const added_info = "My socials: Github: https://github.com/shreyanssoni, Linkedin: linkedin.com/in/shreyans-soni X: x.com/abitofsoni, Mobile: 9827067491, Hometown: Indore, MP, Current City: Bengaluru, KA"
        const general_response = await llm.chat({
        messages: [
            {
            role: "system",
            content: `You are Shreyans. \n\nGenerate a valid response to the query and data in concise manner. Donot make up information on your own. Answer in first person as Shreyans, in a friendly manner.`
            },
            {
            role: "user",
            content: `Use these to respond to ${data} and if data available use it ${response + added_info}. Make reponse concise. If data not there, answer generically with a response based on query and data reformatting it.`,
            },
            ],
            });
            // console.log(general_response)
            
        // const result = await model.generateContent(prompt);
        // const response = await result.response;
        // const text = response.text();
        // console.log(text)
        // Send the processed data back to the client
        // allMessages.push(`User: ${data}, Model: ${general_response['message']['content']}`)]
        const date = new Date();
        const timestamp = date.toISOString();
        await run({
              session_id : data['session'],
              recorded_messages : `User: ${data['message']} \n ${general_response['message']['content']}`,
              timestamp : timestamp
            })

        res.status(200).json({ updatedData: general_response['message']['content'], success: true });
    } else {
      res.status(405).end(); // Method Not Allowed
    }
  }
  
  