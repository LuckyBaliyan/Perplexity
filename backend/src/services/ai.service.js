import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createAgent, tool } from "langchain";
import { ChatGroq } from "@langchain/groq"
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatOllama } from "@langchain/ollama"
import * as z from "zod";
import { scrapWeb } from "./web.service.js";

/**
 * @description Model instance of Grok model from langchain
*/
const grokModel = new ChatGroq({
      model: "llama-3.3-70b-versatile", // used for precise answers in deployement
      //model: "llama-3.1-8b-instant",
      apiKey: process.env.GROQ_API_KEY,
});

/**
 * @description Model instance of Mistral model from langchain
 * use this model for small tasks like generating the context heading of conversation
*/
const mistralModel = new ChatMistralAI({
      model: "mistral-small-latest",
      apiKey: process.env.MISTRAL_AI_KEY,
});

/**
 * @description Model instance of Ollama model from langchain
*/
const ollamaModel = new ChatOllama({
      model: "gemma3",
      apiKey: process.env.OLLAMA_API_KEY,
});

/**
 * @description Tool to search the internet for relevant information
 * @param {object} config 
 * @param {Function} config.func - The function to use for searching the internet
 * @param {object} config.toolConfig - The configuration for the tool
 * @param {string} config.toolConfig.name - The name of the tool
 * @param {string} config.toolConfig.description - The description of the tool
 * @param {object} config.toolConfig.schema - The schema for the tool
 * @returns {object} - The tool instance
*/
const searchWeb = tool(
      scrapWeb,
      {
            name: "searchInternet",
            description: `Use this tool to search the internet for relevant information from Internet`,
            schema: z.object({
                  query: z.string().describe("The search query to look up on the internet"),
            })
      }
)


const agent = createAgent({
      model: mistralModel,
      tools: [searchWeb],
      systemMessage: new SystemMessage(`You are a helpful assistant that answers user queries based on the 
            information you find on the internet`),
})



/**
 * Generates a response from the AI model based on the given message.
 * @param {*} message 
 * @returns 
*/

export async function generateResponse(messages) {

      const response = await agent.invoke({
            messages: messages.map(msg => {
                  if (msg.role === "user") return new HumanMessage(msg.content);
                  else if (msg.role === "ai") return new AIMessage(msg.content);
            })
      });

      console.log(response);

      return response.messages[response.messages.length - 1].text;
}

/**
 * @description Generates a title for the chat based on the given message.
 * @param {*} message 
 * @returns 
*/

export async function generateChatTitle(message) {

      const response = await mistralModel.invoke([
            new SystemMessage(`You are a helpful assistant that generates concise and descriptive titles
                  for chat conversations.
                  
                  User will provide you with the first message of a chat conversation, and you will
                  generate a title that captures the essence of the conversation in 2-4 words. The title
                  should be clear, relevant and engaging, giving users a quick understanding of chat's topic.
            `),

            new HumanMessage(`Generate a title for a chat conversation based on the 
                  following first message:${message}`),
      ]);

      return response.text;
}


/**
 * @description Generates related follow-up questions for a user's query.
 * @param {string} message - User's original query
 * @returns {Promise<string[]>} Array of related questions
*/

export async function generateRelatedQuestions(messages) {
      try {

            const prompt = [
                  ...messages.map((msg) => {
                        if (msg.role === "user") {
                              return new HumanMessage(msg.content);
                        }

                        if (msg.role === "ai") {
                              return new AIMessage(msg.content);
                        }
                  }),

                  new SystemMessage(`
                        Based on the entire conversation above, generate exactly 4
                        short, relevant follow-up questions that the user might ask next.

                        Return ONLY valid JSON in this format:

                        {
                              "questions": [
                                    "Question 1",
                                    "Question 2",
                                    "Question 3",
                                    "Question 4"
                              ]
                        }

                        Do not include markdown, explanations, or any extra text.
                  `),
            ];

            const response = await mistralModel.invoke(prompt);

            const parsed = JSON.parse(response.text);

            return parsed.questions ?? [];

      } catch (error) {

            console.error("Error generating related questions:", error);

            return [];
      }
}