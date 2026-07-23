import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import { sendMessage, getChats, getMessages, deleteChat } from "../controllers/chat.controller.js";

const chatRouter = Router();


/**
 * @route POST /api/chat/message
 * @description Send a message
 * @access Private
*/
chatRouter.post("/message", authUser, sendMessage);


/**
 * @route GET /api/chat/chats
 * @description Get all chats
 * @access Private
*/
chatRouter.get("/", authUser, getChats);


/**
 * @route GET /api/chat/:chatId/messages
 * @description Get all messages of a particular chat
 * @access Private
*/
chatRouter.get("/:chatId/messages", authUser, getMessages);


/**
 * @route DELETE /api/chat/delete/:chatId
 * @description Delete a chat
 * @access Private
*/
chatRouter.delete("/delete/:chatId", authUser, deleteChat);

export default chatRouter;