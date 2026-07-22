import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/slices/auth.slice";

/**
 * Configured Redux Store for the application
*/
export const appStore = configureStore({
      reducer: {
            auth: authReducer,
      },
});

console.log(appStore);

