import { ChatGroq } from "@langchain/groq"

const model = new ChatGroq({
      //model: "llama-3.3-70b-versatile", // used for precise answers in deployement
      model: "llama-3.1-8b-instant",
      apiKey: process.env.GROQ_API_KEY,
});

export async function testAi() {
      model.invoke("what is an Ai explain in not more than 50 words").then((response) => {
            console.log('server is running fine', response.content);
      }).catch((err) => {
            console.log('Error', err);
      })
}