import { tavily as Tavily } from '@tavily/core';

const tavily = Tavily({
      apiKey: process.env.TAVILY_API_KEY,
});

/**
 * @description Web scrapping service using Tavily API.
 * @param {string} query - 
 */
export const scrapWeb = async ({ query }) => {
      const results = await tavily.search(
            query
            , {
                  maxResults: 5,
                  //searchDepth: "advanced", //krke dekh liya bhai bs extra credit fuk ra!!
            }
      );

      //instead of JSON.stringify use this to give ai a proper respose istead of a blob of string data.

      return results.results
            .map((item, index) => `
                  Result ${index + 1}
                  
                  Title: ${item.title}
                  
                  Content:
                  ${item.content}
                  
                  Source:
                  ${item.url}
                  `)
            .join("\n\n--------------------\n\n");
}