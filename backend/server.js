import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initSocket } from "./src/sockets/server.socket.js";
import http from "http";


/**
 * Reads the PORT from the .env file via dotenv.
 * Falls back to 3000 if PORT is not defined in the environment.
*/
const PORT = process.env.PORT || 3000;


/**
 * Creates an HTTP server and initializes the socket.io server.
*/
const httpServer = http.createServer(app);
initSocket(httpServer);


/**
 * Connects to MongoDB first, then starts the HTTP server.
 * This ensures the server never accepts requests before the DB is ready.
 * If the DB connection fails, connectDB() calls process.exit(1) internally.
*/
connectDB().then(() => {
      app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
      });
});

