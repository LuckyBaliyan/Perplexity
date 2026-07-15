import express from "express";
import cookieParser from "cookie-parser";

// Initialize the Express application
const app = express();

// ─── Middlewares ─────────────────────────────────────────────────────────────

/**
 * Parses incoming requests with JSON payloads.
 * Makes req.body available as a parsed JS object when Content-Type is application/json.
*/
app.use(express.json());

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
// TODO: Import and mount your route modules here
// Example: app.use("/api/v1/users", userRouter);

// ─── Health Check Route ───────────────────────────────────────────────────────
/**
 * Basic health-check endpoint to verify the server is running.
 * Returns a 200 OK with a simple JSON message.
*/
app.get("/", (req, res) => {
      res.status(200).json({ success: true, message: "Server is up and running!" });
});

export default app;
