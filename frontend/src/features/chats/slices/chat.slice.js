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
            }
      }
});

export const { setChats, setCurrentChatId, setIsLoading, setError, mergeChat, removeChat } = chatSlice.actions;
export default chatSlice.reducer;
