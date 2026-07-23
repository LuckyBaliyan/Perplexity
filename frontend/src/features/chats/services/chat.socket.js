import { io } from "socket.io-client";

/**
 * Initializes the socket connection to the backend.
 * @returns {SocketIO.Socket} The socket instance.
*/
export const initalizeSocketConnection = () => {

      const socket = io("http://localhost:3000", {
            withCredentials: true
      });

      socket.on("connect", () => {
            console.log("connected to socket.io server");
      })
}