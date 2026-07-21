import { createBrowserRouter } from "react-router";
import Login from "../features/auth/pages/Loign";
import Register from "../features/auth/pages/Register";
import Dashboard from "../features/chats/pages/Dashboard";
import Protected from "../features/auth/components/Protected";

export const router = createBrowserRouter([
      {
            path: "/",
            element: <h1 className="text-4xl text-white">Welcome User</h1>
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
            path: "/Dashboard",
            element: <Protected><Dashboard /></Protected>
      },
]);