import { sendMessage, getChats, getMessages, deleteChat, markChat } from "../services/chat.api.js";
import { useDispatch } from "react-redux";
import {
      mergeChat,
      setChats,
      setCurrentChatId,
      setError,
      setIsLoading,
      removeChat,
      appendAiToken,
      finishAiMessage,
} from "../slices/chat.slice.js";
import { getSocket, initializeSocketConnection } from "../services/chat.socket.js";


/**
 * useChat — central hook that exposes all chat-related actions.
 * All side-effects dispatch into the Redux chat slice so that any
 * component subscribed to the store reacts automatically.
 */
export const useChat = () => {

      const dispatch = useDispatch();

      // NOTE: In Dashboard.jsx, update the mount effect to pass the user id:
      //
      //   useEffect(() => {
      //         const socket = initializeSocketConnection(user?._id || user?.id);
      //         fetchAllChats();
      //   }, [user]);
      //
      // This makes the client emit `join` with the correct room id right
      // after connecting, which the server needs to route ai-token / ai-end /
      // chat-created events back to this user.

      /**
       * handleSendMessage — optimistically adds the user bubble, then posts
       * to the backend and merges the AI reply into Redux state.
       *
       * IMPORTANT: chatId is passed as a parameter (not read from a closure)
       * to avoid stale-closure bugs — the caller always has the latest value.
       *
       * @param {string} message   - The text the user typed
       * @param {string|null} chatId - The current chat id (null = new chat)
       * @param {object[]} existingMessages - Already-rendered messages for this chat
       */
      async function handleSendMessage(message, chatId, existingMessages = []) {

            try {

                  dispatch(setIsLoading(true));
                  dispatch(setError(null));

                  const socket = getSocket();

                  if (!socket) {
                        throw new Error("Socket not connected");
                  }

                  // Prevent duplicate listeners
                  socket.off("ai-token");
                  socket.off("ai-end");
                  socket.off("chat-created");

                  // Optimistic user message
                  const userMessage = {
                        role: "user",
                        content: message,
                        _id: `temp-${Date.now()}`,
                  };

                  const optimisticMessages = [
                        ...existingMessages,
                        userMessage,
                  ];

                  const tempId = chatId || `new-${Date.now()}`;

                  dispatch(
                        mergeChat({
                              id: tempId,
                              chat: {
                                    _id: tempId,
                                    messages: optimisticMessages,
                              },
                        })
                  );

                  if (!chatId) {
                        dispatch(setCurrentChatId(tempId));
                  }

                  // ── Streaming token handler ──────────────────────────────
                  socket.on("ai-token", ({ chatId: streamChatId, token }) => {

                        dispatch(
                              appendAiToken({
                                    chatId: streamChatId,
                                    token,
                              })
                        );

                  });

                  // ── Stream finished — server sends the final saved message ──
                  socket.on("ai-end", ({ chatId: streamChatId, aiMessage }) => {

                        dispatch(
                              finishAiMessage({
                                    chatId: streamChatId,
                                    aiMessage,
                              })
                        );

                        dispatch(setIsLoading(false));

                  });

                  // ── New chat created server-side — server must send the chat itself ──
                  socket.on("chat-created", ({ chatId: newChatId, chat: newChat }) => {

                        // `newChat` is just the chat metadata doc (no `messages`
                        // field — messages live in a separate collection).
                        // When we're moving from a temp client-side id to the
                        // real server id, carry the optimistic messages over
                        // explicitly, or they'd be lost the moment we remove
                        // the temp entry below.
                        dispatch(
                              mergeChat({
                                    id: newChatId,
                                    chat: {
                                          ...newChat,
                                          _id: newChatId,
                                          messages: optimisticMessages,
                                    },
                              })
                        );

                        if (tempId !== newChatId) {
                              dispatch(removeChat(tempId));
                        }

                        dispatch(setCurrentChatId(newChatId));

                  });

                  // Send request
                  const data = await sendMessage({
                        message,
                        currentChatId: chatId,
                  });

                  const { chat } = data;

                  const realChatId = chat._id;

                  // IMPORTANT: `chat` here is just the chat metadata document
                  // (title, isPinned, isArchived, timestamps, etc.) — it does
                  // NOT include `messages` (those live in a separate
                  // collection and are never attached to this object).
                  //
                  // By the time this HTTP response resolves, the `ai-token` /
                  // `ai-end` socket events have ALREADY built up the correct
                  // message list in Redux (including the final AI message).
                  // `mergeChat` does a shallow merge (`{ ...old, ...chat }`),
                  // so as long as we do NOT include a `messages` key here at
                  // all, the existing (socket-updated) messages in the store
                  // are left untouched. Do not spread `chat` blindly if the
                  // API ever starts including a `messages` field — only pull
                  // the metadata fields you actually want to update.
                  dispatch(
                        mergeChat({
                              id: realChatId,
                              chat: {
                                    _id: chat._id,
                                    title: chat.title,
                                    isPinned: chat.isPinned,
                                    isArchived: chat.isArchived,
                                    createdAt: chat.createdAt,
                                    updatedAt: chat.updatedAt,
                              },
                        })
                  );

                  dispatch(setCurrentChatId(realChatId));

                  if (!chatId && tempId !== realChatId) {
                        dispatch(removeChat(tempId));
                  }

            } catch (error) {

                  dispatch(
                        setError(
                              error?.message ||
                              "Unexpected error occurred."
                        )
                  );

                  dispatch(setIsLoading(false));

            }
      }

      /**
       * fetchAllChats — loads every chat belonging to the user from the
       * backend and stores them as a keyed map { [chatId]: chat } in Redux.
       */
      async function fetchAllChats() {
            try {

                  const data = await getChats();
                  // data is expected to be an array of chat documents
                  const chatsMap = {};
                  (data.chats || data || []).forEach(chat => {
                        chatsMap[chat._id] = chat;
                  });
                  dispatch(setChats(chatsMap));

            } catch (error) {

                  dispatch(setError(error?.message || "Failed to load chats."));

            }
      }

      /**
       * loadChat — fetches the full message history for a given chatId
       * and sets it as the currently active chat.
       * @param {string} chatId - The chat to load and display
       */
      async function loadChat(chatId) {
            try {

                  dispatch(setIsLoading(true));
                  dispatch(setError(null));

                  const data = await getMessages(chatId);
                  // data.messages expected from backend
                  dispatch(mergeChat({
                        id: chatId,
                        chat: { _id: chatId, messages: data.messages || data || [] }
                  }));
                  dispatch(setCurrentChatId(chatId));

            } catch (error) {

                  dispatch(setError(error?.message || "Failed to load chat."));

            } finally {

                  dispatch(setIsLoading(false));

            }
      }


      /**
       * @description Deletes a chat from the database
       * @param {string} chatId - The chat to delete
      */
      async function deleteCurrChat(chatId) {
            try {
                  dispatch(setIsLoading(true));
                  dispatch(setError(null));

                  const data = await deleteChat(chatId);
                  dispatch(removeChat(chatId));

                  console.log(data);
            } catch (error) {
                  dispatch(setError(error?.message || "Failed to delete chat."));
            } finally {
                  dispatch(setIsLoading(false));
            }
      }

      async function handleMarkChat(chatId, payload) {
            try {
                  dispatch(setIsLoading(true));
                  dispatch(setError(null));

                  const data = await markChat(chatId, payload);
                  dispatch(mergeChat({ id: data.chat._id, chat: data.chat }));

            } catch (error) {
                  dispatch(setError(error?.message || "Failed To Mark changes!"));
            }
            finally {
                  dispatch(setIsLoading(false));
            }
      }

      return {
            initializeSocketConnection,
            handleSendMessage,
            fetchAllChats,
            loadChat,
            deleteCurrChat,
            handleMarkChat,
      };
};