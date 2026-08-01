import { io as ioClient } from "socket.io-client";

let socket = null;

/**
 * @description Initializes the socket connection to the backend and joins
 * the current user's private room so server-side `io.to(userId).emit(...)`
 * calls (ai-token, ai-end, chat-created) actually reach this client.
 *
 * @param {string} userId - The logged-in user's id (must match req.user.id
 *                          used server-side, as a string).
 * @returns {SocketIO.Socket} The socket instance.
 */
export const initializeSocketConnection = (userId) => {

      if (socket) return socket;

      socket = ioClient(import.meta.env.VITE_BACKEND_URL, {
            withCredentials: true,
      });

      socket.on("connect", () => {
            console.log("Socket Connected:", socket.id);

            // Join our own room so io.to(userId).emit(...) reaches us.
            if (userId) {
                  socket.emit("join", userId.toString());
            }
      });

      socket.on("disconnect", () => {
            console.log("Socket Disconnected");
      });

      return socket;
};

export const getSocket = () => socket;

/**
 * Call this if the socket is already connected but you learn/relearn the
 * user id afterwards (e.g. user loads after socket connects). Safe no-op if
 * socket isn't ready yet.
 */
export const joinUserRoom = (userId) => {
      if (socket && userId) {
            socket.emit("join", userId.toString());
      }
};