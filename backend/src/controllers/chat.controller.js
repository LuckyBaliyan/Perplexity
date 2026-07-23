import { generateResponse, generateChatTitle, generateRelatedQuestions } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

/**
 * This is a API call for aiModel to get the response.
 * @param {*} req 
 * @param {*} res 
*/
export async function sendMessage(req, res) {

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

            const userMessage = await messageModel.create({
                  chat: chat._id,
                  content: message,
                  role: "user",
            });

            const messages = await messageModel.find({ chat: chat._id });

            const result = await generateResponse(messages);
            const relatedQuestions = await generateRelatedQuestions(messages);


            const aiMessage = await messageModel.create({
                  chat: chat._id,
                  content: result,
                  role: "ai",
                  relatedQuestions: relatedQuestions,
            })

            res.status(201).json({
                  chat: chat,
                  userMessage: userMessage,
                  aiMessage: aiMessage,
                  message: "Sucessfully recived!",
                  sucess: true,
                  err: null,
            });

            console.log(messages);

      } catch (error) {

            res.status(400).json({
                  message: "Error sendig Message!",
                  sucess: false,
                  err: error.message,
            });

      }
}