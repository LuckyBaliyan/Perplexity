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
                  //searchDepth: "advanced",
            });

      console.log(JSON.stringify(results));

      return JSON.stringify(results);
}