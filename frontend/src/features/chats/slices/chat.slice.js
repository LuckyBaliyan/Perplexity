import { createSlice } from '@reduxjs/toolkit';

/**
 * * Chat Slice - For managing Chat State
*/
const chatSlice = createSlice({
      name: 'chat',
      initialState: {
            chats: {},
            currentChatId: null,
            isLoading: false,
            error: null,
      },
      reducers: {
            setChats: (state, action) => {
                  state.chats = action.payload;
            },
            setIsLoading: (state, action) => {
                  state.isLoading = action.payload;
            },
            setError: (state, action) => {
                  state.error = action.payload;
            },
            setCurrentChatId: (state, action) => {
                  state.currentChatId = action.payload;
            },
            mergeChat: (state, action) => {
                  const { id, chat } = action.payload;

                  state.chats[id] = {
                        ...state.chats[id],
                        ...chat,
                  };
            },
            removeChat: (state, action) => {
                  delete state.chats[action.payload];
            },
            appendAiToken: (state, action) => {

                  const { chatId, token } = action.payload;

                  const chat = state.chats[chatId];

                  if (!chat) return;

                  if (!chat.messages) {
                        chat.messages = [];
                  }

                  const lastMessage = chat.messages[chat.messages.length - 1];

                  // First token → create AI message
                  if (!lastMessage || lastMessage.role !== "ai") {

                        chat.messages.push({
                              _id: "streaming",
                              role: "ai",
                              content: token,
                        });

                        return;
                  }

                  // Remaining tokens
                  lastMessage.content += token;
            },
            finishAiMessage: (state, action) => {

                  const { chatId, aiMessage } = action.payload;

                  const chat = state.chats[chatId];

                  if (!chat) return;

                  const index = chat.messages.findIndex(
                        m => m._id === "streaming"
                  );

                  if (index !== -1) {
                        chat.messages[index] = aiMessage;
                  }
            }
      }
});

export const { setChats, setCurrentChatId, setIsLoading, setError, mergeChat, removeChat, appendAiToken, finishAiMessage } = chatSlice.actions;
export default chatSlice.reducer;
