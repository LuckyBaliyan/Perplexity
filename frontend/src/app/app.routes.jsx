import { createBrowserRouter } from "react-router";
import Login from "../features/auth/pages/Loign";
import Register from "../features/auth/pages/Register";
import Dashboard from "../features/chats/pages/Dashboard";
import Protected from "../features/auth/components/Protected";
import Error from "../features/shared/pages/Error";
import Home from "../features/ui/pages/Home";

export const router = createBrowserRouter([
      {
            path: "/",
            element: <Home />
      },
      {
            path: "/login",
            element: <Login />
      },
      {
            path: "/register",
            element: <Register />
      },
      {
            path: "/dashboard",
            element: <Protected><Dashboard /></Protected>
      },
      {
            path: "*",
            element: <Error />
      }
]);