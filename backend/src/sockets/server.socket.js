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
                  origin: "http://localhost:5173",
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