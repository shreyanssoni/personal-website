// pages/api/data.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
import { Gemini, QueryEngineTool } from "llamaindex";
// import fs from "node:fs/promises";
const fs = require('fs');


import {
    Document,
    GeminiEmbedding,
    Settings,
    VectorStoreIndex,
    storageContextFromDefaults,
    ContextChatEngine, 
    ReActAgent, 
    FunctionTool
  } from "llamaindex";

Settings.llm = new Gemini({
    model: "gemini-pro"
});

Settings.embedModel = new GeminiEmbedding();

const info = "Shreyans, 22 years old, banglore."

async function llama_run(data){
    const persistDir = "./storage";
    let index; 
  // Function to check if the storage directory exists
    if(fs.existsSync(persistDir)){
        const secondStorageContext = await storageContextFromDefaults({
            persistDir: "./storage",
        });
        index = await VectorStoreIndex.init({
            storageContext: secondStorageContext,
        });

    } else {
        const path = "public/resume.txt";

        const essay = await fs.readFile(path, "utf-8");
    
        // Create Document object with essay
        const document = new Document({ text: essay, id_: path });
        const storageContext = await storageContextFromDefaults({
            persistDir: "./storage",
          });
        index = await VectorStoreIndex.fromDocuments([document], {
            storageContext,
        });
    }

    const queryEngine = index.asQueryEngine();
    const { response } = await queryEngine.query({
        query: `You are shreyans soni. Based on the query and given resume answer: ${data}.`
    });
    console.log(response)
    return response 
}


export default async function  handler (req, res) {
    if (req.method === 'POST') {
        const data = req.body;
        const llm = new Gemini({
            model: "gemini-pro",
            // additionalChatOptions: { response_format: { type: "json_object" } },
          });

        const chatwithResume = FunctionTool.from(
            llama_run,
            {
                name: "ChatWithResume",
                description: 'any query that requires the resume, for example skills, experience, education, technical questions, projects, work, extra curriculars, etc. use this tool',
                parameters: {
                    type: 'string',
                    properties: {
                        data: {
                            type: 'string',
                            description: "the user query that asks the specific question.",
                        }
                    }
                }
            }
        )

        const generalQueries = FunctionTool.from(
            () => `return the answer to this question either based on the data: ${info} or generally for ex. queries like greetings or general questions.`,
            {
                name: "general_tool",
                description: "used to answer general queries not related to resume or work or academics, the general queries like greetings only.",
                return_direct: true 
            }
        )

        const agent = new ReActAgent({
            tools: [chatwithResume],
            verbose: true 
          });
        
        const response = await agent.chat({
            message: data
        });
    
        console.log(response.response['message']['content'].split('Answer:')[1])
        // const prompt = data;
        // const response = await llama_run(data)
        res.status(200).json({ updatedData: response.response['message']['content'].split('Answer:')[1] });
    } else {
      res.status(405).end(); // Method Not Allowed
    }
  }
  
  