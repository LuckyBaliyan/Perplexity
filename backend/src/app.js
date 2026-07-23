import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import morgan from "morgan";
import cors from "cors";
import chatRouter from "./routes/chat.routes.js";

// Initialize the Express application
const app = express();

// ─── Middlewares ─────────────────────────────────────────────────────────────

/**
 * Parses incoming requests with JSON payloads.
 * Makes req.body available as a parsed JS object when Content-Type is application/json.
*/
app.use(express.json());

/**
 * Enables Cross-Origin Resource Sharing (CORS).
 * Allows the frontend (http://localhost:5173) to make requests to the backend.
*/
app.use(cors({
      origin: "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));

/**
 * Logs HTTP requests to the console in a developer-friendly format.
*/
app.use(morgan("dev"));

/**
 * Parses incoming requests with URL-encoded payloads (form submissions).
 * extended: true allows for rich objects and arrays to be encoded into the URL-encoded format.
*/
app.use(express.urlencoded({ extended: true }));

/**
 * Parses Cookie header and populates req.cookies with an object keyed by cookie names.
 * Used later for reading JWT tokens stored in cookies.
*/
app.use(cookieParser());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

// ─── Health Check Route ───────────────────────────────────────────────────────
/**
 * Basic health-check endpoint to verify the server is running.
 * Returns a 200 OK with a simple JSON message.
*/
app.get("/", (req, res) => {
      res.status(200).json({ success: true, message: "Server is up and running!" });
});

export default app;
