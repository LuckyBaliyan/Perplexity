import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/slices/auth.slice";
import chatReducer from "../features/chats/slices/chat.slice"

/**
 * Configured Redux Store for the application
*/
export const appStore = configureStore({
      reducer: {
            auth: authReducer,
            chat: chatReducer,
      },
});
