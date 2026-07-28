import axios from "axios";

const api = axios.create({
      baseURL: "http://localhost:3000",
      withCredentials: true,
});

/**
 * Sends the given message to the backend API and returns the response
 * @param {string} message Message to be sent
 * @param {string} currentChatId ID of the current chat
 * @returns Promise<AxiosResponse>
*/

export async function sendMessage({ message, currentChatId = null }) {

      const response = await api.post('/api/chats/message', {
            message,
            chat: currentChatId,
      });
      return response.data;

}

/**
 * @description Fetches all chats of the current user from the backend API
 * @returns Promise<AxiosResponse>
*/

export async function getChats() {

      const response = await api.get('/api/chats/');
      return response.data;

}

/**
 * @description Fetches all messages of a particular chat from the backend API
 * @param {string} chatId ID of the chat
 * @returns Promise<AxiosResponse>
*/

export async function getMessages(chatId) {

      const response = await api.get(`/api/chats/${chatId}/messages`);
      return response.data;

}

/**
 * @description Delete the specific chat identified by an Id from backend
 * @param {*} chatId Id of selected chat
 * @returns 
*/

export async function deleteChat(chatId) {

      const response = await api.delete(`/api/chats/delete/${chatId}`);
      return response.data;

}