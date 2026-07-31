import { generateResponse, generateChatTitle, generateRelatedQuestions, generateResponseStream } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { getIo } from "../sockets/server.socket.js";

/**
 * This is a API call for aiModel to get the response.
 * @param {*} req 
 * @param {*} res 
*/
export async function sendMessage(req, res) {

      const io = getIo();
      const userRoom = req.user.id.toString();

      const { message, chat: chatId } = req.body;

      let title = null, chat;

      try {

            if (!chatId) {

                  title = await generateChatTitle(message);
                  chat = await chatModel.create({
                        user: req.user.id,
                        title,
                  });

            }
            else {
                  chat = await chatModel.findById(chatId);

                  if (!chat) {
                        return res.status(400).json({
                              message: "Chat Dose't exsisit!",
                              sucess: false,
                              err: "Chat Not Found",
                        });
                  }
            }

            // Send the full chat doc so the client doesn't need to guess/merge
            // from its own local state.
            io.to(userRoom).emit("chat-created", {
                  chatId: chat._id,
                  chat,
            });

            const userMessage = await messageModel.create({
                  chat: chat._id,
                  content: message,
                  role: "user",
            });

            const messages = await messageModel.find({ chat: chat._id });

            //const result = await generateResponse(messages);
            const relatedQuestions = await generateRelatedQuestions(messages);
            //gives an async iterator in response 
            const stream = await generateResponseStream(messages);


            let result = "";

            //printing steram (asyc ietrator) response for refrence
            for await (const event of stream) {
                  if (event.event === "on_chat_model_stream") {

                        const token = event.data.chunk.content ?? "";

                        result += token;

                        console.log(token);

                        io.to(userRoom).emit("ai-token", {
                              token,
                              chatId: chat._id,
                        });
                  }
            }

            const aiMessage = await messageModel.create({
                  chat: chat._id,
                  content: result,
                  role: "ai",
                  relatedQuestions: relatedQuestions,
            })


            io.to(userRoom).emit("ai-end", {
                  chatId: chat._id,
                  aiMessage,
                  relatedQuestions,
            });

            res.status(201).json({
                  chat: chat,
                  userMessage: userMessage,
                  aiMessage: aiMessage,
                  message: "Sucessfully recived!",
                  sucess: true,
                  err: null,
            });

      } catch (error) {

            res.status(400).json({
                  message: "Error sendig Message!",
                  sucess: false,
                  err: error.message,
            });

      }
}

/**
 * @description Getting All Chats of User
 * @param {*} req
 * @param {*} res
*/

export async function getChats(req, res) {
      const user = req.user;

      try {

            const chats = await chatModel.find({ user: user.id });

            res.status(200).json({
                  message: "Sucessfully chats recived!",
                  chats: chats,
                  sucess: true,
                  err: null,
            });

      }
      catch (error) {
            res.status(400).json({
                  message: "Error Getting Chats!",
                  sucess: false,
                  err: error.message,
            });
      }
}


/**
 * @description Getting Messages of a Chat
 * @param {*} req
 * @param {*} res
*/

export async function getMessages(req, res) {

      const { chatId } = req.params;

      try {

            const chat = await chatModel.findOne({
                  _id: chatId,
                  user: req.user.id
            });

            if (!chat) {
                  return res.status(404).json({
                        message: "Chat not found!",
                        sucess: false,
                        err: "Chat not found",
                  })
            }

            const messages = await messageModel.find({
                  chat: chatId,
            });

            res.status(200).json({
                  message: "Messages recived Sucessfully!",
                  sucess: true,
                  messages: messages,
                  err: null,
            });

      } catch (error) {

            res.status(400).json({
                  message: "Error Fetching Messages!",
                  sucess: false,
                  err: error.message,
            });

      }

}


/**
 * @description Deleting a Chat
 * @param {*} req
 * @param {*} res
*/

export async function deleteChat(req, res) {

      const { chatId } = req.params;
      const user = req.user.id;

      try {

            const chat = await chatModel.findOneAndDelete({
                  _id: chatId,
                  user: user
            })

            if (!chat) {
                  return res.status(404).json({
                        message: "Chat not found!",
                        sucess: false,
                        err: "Chat not found",
                  })
            }

            await messageModel.deleteMany({
                  chat: chatId
            })

            res.status(200).json({
                  message: "Chat deleted Sucessfully!",
                  sucess: true,
                  err: null,
            });

      }
      catch (error) {

            res.status(400).json({
                  message: "Error Deleting Chat!",
                  sucess: false,
                  err: error.message,
            });
      }

}



/**
 * @description marks chat isPinned isArchive basec on params passed to it rather than having seprated controllers
 * letter functionalities like isColored or folder etc can also be implemented 
 * @param {*} req 
 * @param {*} res 
 */
export async function markChat(req, res) {
      try {

            const { chatId } = req.params;
            const { isPinned, isArchived } = req.body;

            const updateData = {};

            if (typeof isPinned === "boolean") {
                  updateData.isPinned = isPinned;
            }

            if (typeof isArchived === "boolean") {
                  updateData.isArchived = isArchived;
            }

            const chat = await chatModel.findByIdAndUpdate(
                  {
                        _id: chatId,
                        user: req.user.id, //only logged in user can mark chats!!
                  },
                  updateData,
                  {
                        new: true,
                  }
            );

            if (!chat) {
                  return res.status(404).json({
                        message: "Chat not found!",
                        sucess: false,
                        err: "Chat not found",
                  })
            }

            res.status(200).json({
                  message: "Chat marked Sucessfully!",
                  sucess: true,
                  chat: chat,
                  err: null,
            })

      } catch (error) {
            res.status(400).json({
                  message: "Error marking chat!",
                  sucess: false,
                  err: error.message,
            })
      }

}