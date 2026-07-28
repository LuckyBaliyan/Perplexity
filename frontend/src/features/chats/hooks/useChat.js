import { initalizeSocketConnection } from "../services/chat.socket.js";
import { sendMessage, getChats, getMessages } from "../services/chat.api.js";
import { useDispatch } from "react-redux";
import { mergeChat, setChats, setCurrentChatId, setError, setIsLoading, removeChat } from "../slices/chat.slice.js";

/**
 * useChat — central hook that exposes all chat-related actions.
 * All side-effects dispatch into the Redux chat slice so that any
 * component subscribed to the store reacts automatically.
 */
export const useChat = () => {

      const dispatch = useDispatch();

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

                  // ── Optimistically render the user bubble immediately ──────────
                  const userMessage = { role: 'user', content: message, _id: `temp-${Date.now()}` };
                  const optimisticMessages = [...existingMessages, userMessage];

                  // If we already know the chatId, update that entry in the map;
                  // otherwise create a temporary placeholder so the UI shows the bubble
                  const tempId = chatId || `new-${Date.now()}`;
                  dispatch(mergeChat({
                        id: tempId,
                        chat: { _id: tempId, messages: optimisticMessages },
                  }));
                  if (!chatId) dispatch(setCurrentChatId(tempId));

                  // ── Send to backend — pass the real chatId (may be null for new) ─
                  const data = await sendMessage({ message, currentChatId: chatId });
                  const { chat, aiMessage } = data;

                  // ── Replace the optimistic entry with the authoritative one ──────
                  const finalMessages = [
                        ...optimisticMessages,
                        aiMessage,
                  ];
                  dispatch(mergeChat({ id: chat._id, chat: { ...chat, messages: finalMessages } }));
                  dispatch(setCurrentChatId(chat._id));

                  // Clean up the temp placeholder key if we created one
                  if (!chatId && tempId !== chat._id) {
                        // dispatch(mergeChat({ id: tempId, chat: null })); // null = will be filtered in UI
                        dispatch(removeChat(tempId));
                  }

            } catch (error) {

                  dispatch(setError(error?.message || "Unexpected error occurred."));

            } finally {

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

      return {
            initalizeSocketConnection,
            handleSendMessage,
            fetchAllChats,
            loadChat,
      };
};