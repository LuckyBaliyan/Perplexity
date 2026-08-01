import { Server } from "socket.io";

let io;

/**
 * Initializes the socket.io server and returns the io instance.
 * @param {import("http").Server} httpServer - The HTTP server to attach the socket.io server to.
 * @returns {SocketIO.Server} The socket.io server instance.
 */

export function initSocket(httpServer) {
      io = new Server(httpServer, {
            cors: {
                  origin: `${process.env.FRONTEND_URL}`,
                  methods: ["GET", "POST"],
                  credentials: true,
            }
      });

      console.log("Socket.io server is running!");

      /**
       * The socket id will be regenrated unique for each user on each connection.
       */
      io.on("connection", (socket) => {
            console.log(`User Connected: ${socket.id}`);

            socket.on("test-stream", async () => {

                  console.log("Streaming started...");

                  const text =
                        "Hello Lucky! This message is being streamed one character at a time using Socket.IO.";

                  for (const char of text) {

                        socket.emit("ai-token", char);

                        await new Promise(resolve => setTimeout(resolve, 40));
                  }

                  socket.emit("ai-end");

                  console.log("Streaming finished.");

            });


            // frontend joins its own room
            socket.on("join", (userId) => {
                  socket.join(userId);
                  console.log(`${socket.id} joined room ${userId}`);
            });


            socket.on("disconnect", () => {
                  console.log(`User Disconnected: ${socket.id}`);
            });
      });
}


/**
 * Returns the socket.io server instance.
 * @returns {SocketIO.Server} The socket.io server instance.
 */
export function getIo() {
      if (!io) {
            throw new Error("Socket.io not initialized");
      }

      return io;
}