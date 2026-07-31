import React, { useRef, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useChat } from '../hooks/useChat';
import { useNavigate } from 'react-router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import {
      Plus,
      Archive,
      Settings,
      HelpCircle,
      LogOut,
      User,
      Search,
      LayoutGrid,
      ArrowUp,
      Menu,
      X,
      RefreshCw,
      Bot,
      Sun,
      Moon,
      MessageCircle,
      Pin,
      Trash2,
      MoreHorizontal,
      CircleUser,
      PinOffIcon,
} from 'lucide-react';
import useReveal from '../../animations/hooks/useReveal';
import { setCurrentChatId, setError } from
      '../slices/chat.slice';
import { toggleTheme as toggleThemeAction } from '../../shared/themes/theme.slice';
import { Archives as ArchivesView } from './Archives';
import { Chats as AllChatsView } from './Chats';
import { useAuth } from '../../auth/hooks/useAuth';

/**
 * @description Renders code elements in Markdown, applying block styling for multiline code blocks and badge styling for inline code snippets.
 * @param {Object} props - Props containing children content and CSS class name.
 * @returns {React.ReactElement} Formatted code element.
 */
const RenderCode = ({ children, className }) => {
      const isCodeBlock = className?.includes('language-') || (typeof children === 'string' && children.includes('\n'));
      if (isCodeBlock) {
            return <code className={className}>{children}</code>;
      }
      return (
            <code className="bg-[var(--bg-surface-active)] text-[var(--accent-primary)] px-1.5 py-0.5 rounded text-xs font-mono">
                  {children}
            </code>
      );
};

/**
 * @description Renders message content, formatting AI responses with ReactMarkdown and user responses in plain text.
 * @param {Object} props - Component props containing content string and isUser boolean flag.
 * @returns {React.ReactElement} Rendered message element.
 */
const RenderMessageContent = ({ content, isUser }) => {
      if (isUser) {
            return (
                  <p className="whitespace-pre-wrap break-words pl-3">
                        {content}
                  </p>
            );
      }

      return (
            <div className="text-sm leading-relaxed break-words">
                  <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                              h1: ({ children }) => <h1 className="text-lg font-bold text-[var(--text-primary)] mt-3 mb-2">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-base font-bold text-[var(--text-primary)] mt-3 mb-2">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-sm font-bold text-[var(--text-primary)] mt-2 mb-1">{children}</h3>,
                              ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1 text-sm">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1 text-sm">{children}</ol>,
                              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                              pre: ({ children }) => (
                                    <pre className="bg-[var(--bg-inset)] border border-[var(--border-subtle)] rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono text-[var(--text-primary)]">
                                          {children}
                                    </pre>
                              ),
                              code: RenderCode,
                              a: ({ href, children }) => (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] underline hover:text-[var(--text-primary)] transition-colors">
                                          {children}
                                    </a>
                              ),
                              blockquote: ({ children }) => (
                                    <blockquote className="border-l-2 border-[var(--accent-primary)]/50 pl-3 my-2 text-[var(--text-muted)] italic">
                                          {children}
                                    </blockquote>
                              ),
                              table: ({ children }) => (
                                    <div className="my-4 overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
                                          <table className="min-w-full border-collapse text-sm">
                                                {children}
                                          </table>
                                    </div>
                              ),

                              thead: ({ children }) => (
                                    <thead className="bg-[var(--bg-card)]">
                                          {children}
                                    </thead>
                              ),

                              tbody: ({ children }) => (
                                    <tbody className="divide-y divide-[var(--border-subtle)]">
                                          {children}
                                    </tbody>
                              ),

                              tr: ({ children }) => (
                                    <tr className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                                          {children}
                                    </tr>
                              ),

                              th: ({ children }) => (
                                    <th className="border border-[var(--border-subtle)] px-4 py-3 text-left font-semibold text-[var(--text-primary)] whitespace-nowrap">
                                          {children}
                                    </th>
                              ),

                              td: ({ children }) => (
                                    <td className="border border-[var(--border-subtle)] px-4 py-3 text-[var(--text-secondary)] align-top">
                                          {children}
                                    </td>
                              ),
                        }}
                  >
                        {content}
                  </ReactMarkdown>
            </div>
      );
};


/**
 * @description Dashboard — full chat UI wired to Redux + useChat hook.
 * Handles: sending messages, showing AI responses, loading/error states,
 * sidebar chat list, new-chat reset, clicking past chats to restore them,
 * and switching between the live chat view, All Chats view, and Archives view.
 * @returns React Component
 */
function Dashboard() {

      const dispatch = useDispatch();
      const { initializeSocketConnection, handleSendMessage, fetchAllChats, loadChat, deleteCurrChat, handleMarkChat } = useChat();
      const { handleLogOut } = useAuth();

      // ── Refs ────────────────────────────────────────────────────────────────
      const hRef = useRef(null);
      const chatBottomRef = useRef(null); // auto-scroll anchor
      const textareaRef = useRef(null);   // reset height after submit

      const navigate = useNavigate();

      // ── Reveal animation on the hero heading only ────────────────────────────
      useReveal(hRef, { delay: 0.1, yfrom: 40, yto: 0, duration: 2, opacityFrom: 0, opacityTo: 1 });

      // ── Redux state ──────────────────────────────────────────────────────────
      const user = useSelector(state => state.auth.user);
      const chats = useSelector(state => state.chat.chats);         // { [id]: chatObj }
      const currentChatId = useSelector(state => state.chat.currentChatId);
      const isLoading = useSelector(state => state.chat.isLoading);
      const error = useSelector(state => state.chat.error);

      // ── Local UI state ────────────────────────────────────────────────────────
      const [sidebarOpen, setSidebarOpen] = useState(false);
      const [inputValue, setInputValue] = useState('');
      const [openMenu, setOpenMenu] = useState(null);
      /** activeView — controls what's shown in the main pane: 'chat' | 'archives' | 'allchats' */
      const [activeView, setActiveView] = useState('chat');

      // ── Derive current messages from Redux ────────────────────────────────────
      /**
       * Extracts the message list for the active chat.
       * Falls back to an empty array when no chat is selected.
       */
      const currentMessages = currentChatId
            ? (chats[currentChatId]?.messages || [])
            : [];

      // ── Sorted sidebar list (newest first, nulls filtered out) ──────────────
      const chatList = Object.values(chats)
            .filter(Boolean)  // remove any null placeholders from temp-key cleanup
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      /** seprate both type of chats */
      const pinnedChats = chatList.filter(c => c.isPinned).slice(0, 3);
      const recentChats = chatList.filter(c => !c.isPinned);
      const archivedChats = chatList.filter(c => c.isArchived);

      // ── Effects ───────────────────────────────────────────────────────────────
      /** Initialize socket + load all user chats on mount */
      useEffect(() => {

            const socket = initializeSocketConnection(user?._id || user?.id);

            fetchAllChats();

      }, []);

      /** Auto-scroll to latest message whenever the list grows or loading changes */
      useEffect(() => {
            if (chatBottomRef.current) {
                  chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
            }
      }, [currentMessages.length, isLoading]);

      /**
       * Toggle Theme between light and dark.
      */
      const theme = useSelector(state => state.theme.value);
      const handleToggleTheme = () => dispatch(toggleThemeAction());


      /**
       * Format message time
       * @param {Date} dateValue
       * @returns {string}
      */
      const formatMessageTime = (dateValue) => {
            if (!dateValue) return '';
            const d = new Date(dateValue);
            return d.toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
            });
      };

      // ── Handlers ──────────────────────────────────────────────────────────────
      /**
       * handleSubmit — validates input, calls the hook with the live chatId
       * and currentMessages so the hook never reads a stale closure value.
       * Does nothing while a request is already in-flight or if input is blank.
       */
      const handleSubmit = async () => {
            const text = inputValue.trim();
            if (!text || isLoading) return;

            setInputValue('');
            if (textareaRef.current) {
                  textareaRef.current.style.height = 'auto';
                  textareaRef.current.style.overflowY = 'hidden';
            }

            // Pass the live currentChatId and currentMessages so the hook
            // never reads a stale closure value.
            await handleSendMessage(text, currentChatId, currentMessages);
      };

      /**
       * handleKeyDown — Enter submits, Shift+Enter inserts a newline.
       */
      const handleKeyDown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
            }
      };

      /**
       * handleNewChat — resets the active chat so the hero screen is shown again.
       * Existing chats remain in the sidebar. Also returns to the chat view
       * if we were on Archives / All Chats.
       */
      const handleNewChat = () => {
            dispatch(setCurrentChatId(null));
            dispatch(setError(null));
            setInputValue('');
            setSidebarOpen(false);
            setActiveView('chat');
      };


      const handleDeleteChat = async (chatId) => {
            await deleteCurrChat(chatId);
      }

      /**
       * @description Handles related questions click - Sets the message in the input field and focuses on it
       * @param {*} question 
      */
      const handleRelatedQuestion = (question) => {

            setInputValue(question);

            requestAnimationFrame(() => {

                  if (!textareaRef.current) return;

                  textareaRef.current.style.height = "auto";
                  textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";

                  textareaRef.current.focus();

            });

      };

      /**
       * handleSelectChat — loads a past chat by id and sets it as active.
       * If messages are already in Redux state, just switches — no network call.
       * Also brings the main pane back to the chat view (e.g. after picking
       * a chat from Archives or All Chats).
       * @param {string} chatId
       */
      const handleSelectChat = async (chatId) => {
            setSidebarOpen(false);
            setActiveView('chat');
            if (chats[chatId]?.messages?.length > 0) {
                  dispatch(setCurrentChatId(chatId));
            } else {
                  await loadChat(chatId);
            }
      };


      /**
       * @description Handles pin and archive chat action.
       * @param {*} chatId 
       * @param {*} payload 
       */
      const handlePinAndArchiveChat = async (chatId, payload) => {
            await handleMarkChat(chatId, payload);
      }


      /**
       * handleRetry — clears the error and re-sends the last user message.
       */
      const handleRetry = () => {
            dispatch(setError(null));
            const lastUserMsg = [...currentMessages].reverse().find(m => m.role === 'user');
            if (lastUserMsg) {
                  handleSendMessage(lastUserMsg.content, currentChatId, currentMessages);
            }
      };

      // ── Helpers ───────────────────────────────────────────────────────────────
      /**
       * Returns a short display title for a chat sidebar entry.
       * Uses the first user message truncated to 40 chars.
       */
      const getChatTitle = (chat) => {
            const firstUserMsg = (chat.messages || []).find(m => m.role === 'user');
            const raw = chat.title || firstUserMsg?.content || 'New conversation';
            const clean = raw.trim()
                  // strip markdown bold/italic markers anywhere (e.g. **xyz**, *xyz*)
                  .replace(/\*\*/g, '')
                  .replace(/\*/g, '')
                  // strip wrapping quotes (straight or curly) if they wrap the whole string
                  .replace(/^["'“‘]+|["'”’]+$/g, '')
                  .trim();
            return clean.length > 40 ? clean.slice(0, 40) + '…' : clean;
      };


      const logOutUser = async () => {
            try {
                  await handleLogOut();
            } catch (error) {
                  console.log(error);
            }
      }

      return (
            <div className="flex h-screen w-full bg-[var(--bg-surface)] text-[var(--text-primary)] overflow-hidden">

                  {/* ── Mobile overlay ── */}
                  {sidebarOpen && (
                        <div
                              onClick={() => setSidebarOpen(false)}
                              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        />
                  )}

                  {/* ── Sidebar ── */}
                  <aside
                        className={`
                              fixed md:static inset-y-0 left-0 z-50
                              w-[260px] md:w-[280px] shrink-0
                              h-full
                              bg-[var(--bg-inset)]/95 md:bg-[var(--bg-inset)] backdrop-blur-xl md:backdrop-blur-none
                              border-r border-[var(--border-subtle)]
                              flex flex-col
                              transform transition-transform duration-300 ease-in-out
                              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                              md:translate-x-0
                        `}
                  >

                        {/* Logo + mobile close */}
                        <div className="flex items-center justify-between px-5 py-5">
                              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
                                    <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-[var(--text-inverse)] font-bold text-sm">
                                          P
                                    </div>
                                    <div>
                                          <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">Perplexor AI</p>
                                          <p className="text-[11px] text-[var(--text-muted)] leading-tight">Powering Intelligence</p>
                                    </div>
                              </div>
                              <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="md:hidden cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                              >
                                    <X size={20} />
                              </button>
                        </div>

                        {/* New Chat button */}
                        <div className="px-4 mt-2">
                              <button
                                    onClick={handleNewChat}
                                    className="w-full cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-md border border-[var(--accent-secondary)]/40 text-[var(--accent-secondary)] text-sm font-medium hover:bg-[var(--accent-secondary)]/5 transition-colors"
                              >
                                    <Plus size={16} />
                                    New Chat
                              </button>
                        </div>

                        {/* Nav links */}
                        <nav className="flex flex-col gap-1 px-4 mt-2">
                              <button
                                    onClick={() => setActiveView('allchats')}
                                    className={`cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${activeView === 'allchats'
                                          ? 'bg-[var(--bg-card)] text-[var(--text-primary)]'
                                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
                                          }`}
                              >
                                    <MessageCircle size={16} />
                                    Chats
                              </button>
                              <button
                                    onClick={() => setActiveView('archives')}
                                    className={`cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${activeView === 'archives'
                                          ? 'bg-[var(--bg-card)] text-[var(--text-primary)]'
                                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
                                          }`}
                              >
                                    <Archive size={16} />
                                    Archives
                              </button>
                              <button className="cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors">
                                    <Settings size={16} />
                                    Settings
                              </button>
                        </nav>

                        {/* pinned chat section */}
                        {pinnedChats.length > 0 && (
                              <>
                                    <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] px-3 pt-2 pb-1">
                                          Pinned
                                    </p>

                                    {pinnedChats.map((pinnedChat) => (
                                          <div className="relative px-2" key={pinnedChat._id}>
                                                <button
                                                      onClick={() => handleSelectChat(pinnedChat._id)}
                                                      className={`
                                                             w-full
                                                             flex
                                                             relative
                                                             items-center
                                                             gap-2
                                                             px-3
                                                             py-2
                                                             pr-10
                                                             rounded-lg
                                                             transition-colors
                                                             ${currentChatId === pinnedChat._id
                                                                  ? "bg-[var(--bg-card)]"
                                                                  : "hover:bg-[var(--bg-surface-hover)]"
                                                            }
                                                     `}
                                                >
                                                      <MessageCircle
                                                            size={14}
                                                            className="shrink-0 text-[var(--text-muted)]"
                                                      />

                                                      <span className="flex-1 truncate text-left">
                                                            {getChatTitle(pinnedChat)}
                                                      </span>
                                                </button>
                                                <button
                                                      onClick={() =>
                                                            setOpenMenu(
                                                                  openMenu === pinnedChat._id
                                                                        ? null
                                                                        : pinnedChat._id
                                                            )
                                                      }
                                                      className="
                                          absolute
                                          right-4
                                          top-1/2
                                          -translate-y-1/2
                                          opacity-100
                                          group-hover:opacity-100
                                          z-[50]
                                          p-1
                                          rounded
                                          hover:bg-[var(--bg-surface-hover)]
                                          "
                                                >
                                                      <MoreHorizontal size={16} />
                                                </button>

                                                {
                                                      openMenu === pinnedChat._id && (

                                                            <div
                                                                  className="
                                          absolute
                                          right-2
                                          top-[calc(100%+4px)]
                                          w-44
                                          rounded-lg
                                          border
                                          border-[var(--border-subtle)]
                                          bg-[var(--bg-card)]
                                          shadow-2xl
                                          z-80
                                          "
                                                            >
                                                                  <button
                                                                        onClick={() => {
                                                                              handlePinAndArchiveChat(pinnedChat._id, {
                                                                                    isPinned: false,
                                                                                    isArchived: pinnedChat.isArchived,
                                                                              });
                                                                              setOpenMenu(null);
                                                                        }}
                                                                        className="flex w-full items-center gap-2 px-3 py-2 hover:bg-[var(--bg-surface-hover)]"
                                                                  >
                                                                        <PinOffIcon size={15} />
                                                                        Remove Pin
                                                                  </button>

                                                                  <button
                                                                        onClick={() => {
                                                                              handlePinAndArchiveChat(pinnedChat._id, {
                                                                                    isPinned: pinnedChat.isPinned,
                                                                                    isArchived: pinnedChat.isArchived ? false : true,
                                                                              });
                                                                              setOpenMenu(null);
                                                                        }}
                                                                        className="flex w-full items-center gap-2 px-3 py-2 hover:bg-[var(--bg-surface-hover)]"
                                                                  >
                                                                        <Archive size={15} />
                                                                        {pinnedChat.isArchived ? "Unarchive" : "Archive"}
                                                                  </button>

                                                                  <button
                                                                        onClick={() => {
                                                                              handleDeleteChat(pinnedChat._id);
                                                                              setOpenMenu(null);
                                                                        }}
                                                                        className="flex w-full items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10"
                                                                  >
                                                                        <Trash2 size={15} />
                                                                        Delete
                                                                  </button>

                                                            </div>
                                                      )}
                                          </div>
                                    ))}
                              </>
                        )}

                        {/* ── Past chats list ── */}
                        <div className="flex-1 overflow-y-auto mt-4 px-2 flex flex-col gap-0.5">
                              {recentChats.length > 0 && (
                                    <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] px-3 pb-1 pt-2">
                                          Recent
                                    </p>
                              )}
                              {recentChats.map(chat => (
                                    <div key={chat._id}>
                                          <div className="relative">
                                                <button
                                                      onClick={() => handleSelectChat(chat._id)}
                                                      className={`
                                                w-full
                                                flex
                                                relative
                                                items-center
                                                gap-2
                                                px-3
                                                py-2
                                                pr-10
                                                rounded-lg
                                                transition-colors
                                                ${currentChatId === chat._id
                                                                  ? "bg-[var(--bg-card)]"
                                                                  : "hover:bg-[var(--bg-surface-hover)]"
                                                            }
    `}
                                                >
                                                      <MessageCircle
                                                            size={14}
                                                            className="shrink-0 text-[var(--text-muted)]"
                                                      />

                                                      <span className="flex-1 truncate text-left">
                                                            {getChatTitle(chat)}
                                                      </span>
                                                </button>
                                                <button
                                                      onClick={() =>
                                                            setOpenMenu(
                                                                  openMenu === chat._id
                                                                        ? null
                                                                        : chat._id
                                                            )
                                                      }
                                                      className="
                                                            absolute
                                                            right-2
                                                            top-1/2
                                                            -translate-y-1/2
                                                            opacity-100
                                                            group-hover:opacity-100
                                                            z-[50]
                                                            p-1
                                                            rounded
                                                            hover:bg-[var(--bg-surface-hover)]
                                                            "
                                                >
                                                      <MoreHorizontal size={16} />
                                                </button>

                                                {
                                                      openMenu === chat._id && (

                                                            <div
                                                                  className="
                                                            absolute
                                                            right-2
                                                            top-[calc(100%+4px)]
                                                            w-44
                                                            rounded-lg
                                                            border
                                                            border-[var(--border-subtle)]
                                                            bg-[var(--bg-card)]
                                                            shadow-2xl
                                                            z-80
                                                            "
                                                            >
                                                                  <button
                                                                        onClick={() => {
                                                                              handlePinAndArchiveChat(chat._id, {
                                                                                    isPinned: true,
                                                                                    isArchived: chat.isArchived,
                                                                              });
                                                                              setOpenMenu(null);
                                                                        }}
                                                                        className="flex w-full items-center gap-2 px-3 py-2 hover:bg-[var(--bg-surface-hover)]"
                                                                  >
                                                                        <Pin size={15} />
                                                                        Pin
                                                                  </button>

                                                                  <button
                                                                        onClick={() => {
                                                                              handlePinAndArchiveChat(chat._id, {
                                                                                    isPinned: chat.isPinned,
                                                                                    isArchived: chat.isArchived ? false : true
                                                                              });
                                                                              setOpenMenu(null);
                                                                        }}
                                                                        className="flex w-full items-center gap-2 px-3 py-2 hover:bg-[var(--bg-surface-hover)]"
                                                                  >
                                                                        <Archive size={15} />
                                                                        {chat.isArchived ? "Unarchive" : "Archive"}
                                                                  </button>

                                                                  <button
                                                                        onClick={() => {
                                                                              handleDeleteChat(chat._id);
                                                                              setOpenMenu(null);
                                                                        }}
                                                                        className="flex w-full items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10"
                                                                  >
                                                                        <Trash2 size={15} />
                                                                        Delete
                                                                  </button>

                                                            </div>
                                                      )}
                                          </div>
                                    </div>
                              ))}
                        </div>

                        {/* Help / Logout */}
                        <div className="flex flex-col gap-1 px-4 mt-4">
                              {/*<button className="cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors">
                                    <HelpCircle size={16} />
                                    Help
                              </button>*/}
                              <button onClick={() => logOutUser()} className="cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors">
                                    <LogOut size={16} />
                                    Logout
                              </button>
                        </div>

                        {/* User strip */}
                        <div className="flex items-center gap-3 px-5 py-4 border-t border-[var(--border-subtle)] mt-2">
                              <div className="w-8 h-8 cursor-pointer rounded-full bg-[var(--border-default)] flex items-center justify-center">
                                    <User size={16} className="text-[var(--text-secondary)]" />
                              </div>
                              <p className="text-sm text-[var(--text-primary)]">{user?.username || 'User Alpha'}</p>
                        </div>

                  </aside>

                  {/* ── Main area ── */}
                  <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

                        {/* Header */}
                        <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-[var(--border-subtle)] shrink-0">

                              <div className="flex items-center gap-4">
                                    <button
                                          onClick={() => setSidebarOpen(true)}
                                          className="md:hidden cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                    >
                                          <Menu size={22} />
                                    </button>

                                    {/*<div className="hidden md:flex items-center gap-6 text-sm">
                                          <button className="text-[var(--text-primary)] font-medium border-b-2 border-[var(--accent-primary)] pb-1">Models</button>
                                          <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">API</button>
                                          <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Enterprise</button>
                                    </div>
                                    */}
                              </div>

                              <div className="flex items-center gap-2 md:gap-4">
                                    <div className="hidden sm:flex items-center gap-2 bg-[var(--bg-surface-hover)] border border-[#8080806c]  rounded-md px-3 py-1.5 w-40 md:w-64">
                                          <Search size={14} className="text-[var(--text-muted)] shrink-0" />
                                          <input
                                                type="text"
                                                placeholder="Search keywords.."
                                                className="bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-full min-w-0"
                                                style={{ fontFamily: 'JetBrains Mono, monospace' }}
                                          />
                                    </div>
                                    <button className="sm:hidden cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                                          <Search size={18} />
                                    </button>
                                    <button
                                          onClick={handleToggleTheme}
                                          className="hidden sm:inline-flex cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                    >
                                          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                                    </button>
                                    <button className="hidden cursor-pointer sm:inline-flex text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                                          <LayoutGrid size={18} />
                                    </button>
                                    <button className="cursor-pointer w-9 h-9 flex items-center justify-center gap-2 bg-[var(--accent-primary)] text-[var(--text-inverse)] text-sm font-medium  py-2 rounded-full hover:bg-[var(--accent-primary-hover)] transition-colors">
                                          <User size={18} />
                                    </button>
                              </div>
                        </header>

                        {/* ── Scrollable main pane — switches between Chat / All Chats / Archives ── */}
                        <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6">

                              {activeView === 'archives' ? (

                                    <ArchivesView
                                          chats={archivedChats}
                                          getChatTitle={getChatTitle}
                                          onSelectChat={handleSelectChat}
                                    />

                              ) : activeView === 'allchats' ? (

                                    <AllChatsView
                                          chats={chatList}
                                          getChatTitle={getChatTitle}
                                          onSelectChat={handleSelectChat}
                                    />

                              ) : currentMessages.length === 0 && !isLoading ? (

                                    /* ── Hero (no messages yet) ── */
                                    <div className="min-h-full flex flex-col items-center justify-center py-8">
                                          <div className="relative flex justify-center items-center">
                                                {/* Background glow */}
                                                <div
                                                      className="absolute inset-0 flex justify-center items-center pointer-events-none"
                                                      aria-hidden="true"
                                                >
                                                      <div className="h-32 w-[90%] rounded-full bg-gradient-to-r from-[var(--accent-primary)]/0 via-[var(--accent-primary)]/35 to-[var(--accent-primary)]/0 blur-3xl" />
                                                </div>

                                                <h1
                                                      ref={hRef}
                                                      className="relative z-10 text-center text-[var(--text-primary)] font-semibold tracking-tight text-3xl sm:text-4xl md:text-5xl leading-tight max-w-3xl"
                                                      style={{ fontFamily: "Geist, sans-serif" }}
                                                >
                                                      How can I assist your{" "}
                                                      <span className="text-[var(--accent-primary)] uppercase">
                                                            <em>Intelligence</em>
                                                      </span>{" "}
                                                      today?
                                                </h1>
                                          </div>

                                          {/* Input — lives here while no chat has started, no border/box, just floats under the heading */}
                                          <div className="w-full max-w-2xl mt-8 sm:mt-10">
                                                <div className="flex items-center gap-2 sm:gap-3 bg-[var(--bg-surface-hover)]/60 backdrop-blur-2xl border border-[var(--border-subtle)] focus-within:border-[var(--accent-primary)]/40 rounded-xl px-4 sm:px-5 py-3 transition-colors duration-200">
                                                      <textarea
                                                            ref={textareaRef}
                                                            value={inputValue}
                                                            onChange={(e) => setInputValue(e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                            placeholder="Initialize prompt..."
                                                            rows={1}
                                                            disabled={isLoading}
                                                            className="flex-1 bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm min-w-0 resize-none max-h-[200px] overflow-y-auto disabled:opacity-50"
                                                            style={{ fontFamily: "JetBrains Mono, monospace" }}
                                                            onInput={(e) => {
                                                                  e.target.style.height = "auto";
                                                                  const maxHeight = 200;
                                                                  const newHeight = Math.min(e.target.scrollHeight, maxHeight);
                                                                  e.target.style.height = `${newHeight}px`;
                                                                  e.target.style.overflowY = e.target.scrollHeight > maxHeight ? "auto" : "hidden";
                                                            }}
                                                      />
                                                      <button
                                                            type="button"
                                                            onClick={handleSubmit}
                                                            disabled={!inputValue.trim() || isLoading}
                                                            className="shrink-0 self-end cursor-pointer flex items-center justify-center w-9 h-9 rounded-full bg-[var(--accent-primary)] text-[var(--text-inverse)] hover:bg-[var(--accent-primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                      >
                                                            <ArrowUp size={18} strokeWidth={2.5} className="hover:-translate-y-1 transition-all" />
                                                      </button>
                                                </div>
                                                <p className="text-center text-[10px] text-[var(--text-muted)] mt-2">
                                                      Press <kbd className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded px-1 py-0.5 text-[var(--text-secondary)]">Enter</kbd> to send &nbsp;·&nbsp; <kbd className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded px-1 py-0.5 text-[var(--text-secondary)]">Shift + Enter</kbd> for newline
                                                </p>
                                          </div>
                                    </div>

                              ) : (

                                    /* ── Chat message list ── */
                                    <div className="flex flex-col gap-6 py-8 max-w-3xl mx-auto w-full">

                                          {currentMessages.map((msg, idx) => {
                                                const isUser = msg.role === 'user';
                                                return (
                                                      <React.Fragment key={msg._id || idx}>
                                                            <div
                                                                  className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                                                            >

                                                                  {/* AI avatar — left side */}
                                                                  {!isUser && (
                                                                        <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)]">
                                                                              <Bot size={16} />
                                                                        </div>
                                                                  )}

                                                                  {/* Bubble */}
                                                                  <div
                                                                        className={`
                                                                        group flex flex-col gap-2
                                                                        relative max-w-[84%] sm:max-w-[88%]
                                                                        text-sm leading-relaxed px-4 py-3
                                                                        animate-[fadeSlideIn_0.25s_ease-out_both]
                                                                        ${isUser
                                                                                    ? 'bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl rounded-tr-sm'
                                                                                    : 'bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-2xl rounded-tl-sm'
                                                                              }
                                                                  `}
                                                                        style={{ fontFamily: isUser ? 'JetBrains Mono, monospace' : 'inherit' }}
                                                                  >
                                                                        {/* Accent bar on user bubbles */}
                                                                        {isUser && (
                                                                              <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-[var(--accent-primary)]/60" />
                                                                        )}
                                                                        <RenderMessageContent content={msg.content} isUser={isUser} />
                                                                        {/* Timestamp tooltip — hidden by default, fades in on bubble hover */}
                                                                        <span
                                                                              className={`
                                                                              pointer-events-none absolute top-[100%]  mt-2 whitespace-nowrap
                                                                              text-[10px] text-[var(--text-muted)]
                                                                              opacity-0 group-hover:opacity-100
                                                                              transition-opacity duration-150
                                                                              ${isUser ? 'right-2' : 'left-2'}
                                                                        `}
                                                                              style={{ fontFamily: 'JetBrains Mono, monospace' }}
                                                                        >
                                                                              {formatMessageTime(msg.createdAt)}
                                                                        </span>
                                                                  </div>

                                                                  {/* User avatar — right side */}
                                                                  {isUser && (
                                                                        <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-[var(--text-inverse)] text-xs font-bold uppercase select-none">
                                                                              {user?.username?.[0] ?? 'U'}
                                                                        </div>
                                                                  )}

                                                            </div>

                                                            {/*follow-up Questions*/}
                                                            {
                                                                  msg.role === "ai" &&
                                                                  msg.relatedQuestions?.length > 0 && (
                                                                        <div className="mt-3 pl-11 flex flex-wrap gap-2">

                                                                              {msg.relatedQuestions.map((question, index) => (

                                                                                    <button
                                                                                          key={index}
                                                                                          onClick={() => handleRelatedQuestion(question)}
                                                                                          className="
                                                                                          rounded-lg
                                                                                          border
                                                                                          border-[var(--border-subtle)]
                                                                                          bg-[var(--bg-surface-elevated)]
                                                                                          px-3.5
                                                                                          py-1.5
                                                                                          text-xs
                                                                                          text-[var(--text-muted)]
                                                                                          transition-colors
                                                                                          duration-200
                                                                                          cursor-pointer
                                                                                          hover:border-[var(--accent-primary)]/40
                                                                                          hover:bg-[var(--bg-card)]
                                                                                          hover:text-[var(--text-primary)]"
                                                                                    >
                                                                                          {question}
                                                                                    </button>

                                                                              ))}

                                                                        </div>
                                                                  )
                                                            }
                                                      </React.Fragment>
                                                );
                                          })}



                                          {isLoading && (
                                                <div className="flex items-end gap-3 justify-start">
                                                      <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)]">
                                                            <Bot size={16} />
                                                      </div>
                                                      <div className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-2xl rounded-tl-sm px-5 py-3.5">
                                                            {/* Three-dot pulse loader */}
                                                            <div className="flex gap-1.5 items-center h-4">
                                                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]/70 animate-bounce [animation-delay:0ms]" />
                                                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]/70 animate-bounce [animation-delay:150ms]" />
                                                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]/70 animate-bounce [animation-delay:300ms]" />
                                                            </div>
                                                      </div>
                                                </div>
                                          )}


                                          {/* ── Error with retry ── */}
                                          {error && !isLoading && (
                                                <div className="flex items-center gap-3 justify-start pl-11">
                                                      <p className="text-xs text-[var(--color-error)]/80">{error}</p>
                                                      <button
                                                            onClick={handleRetry}
                                                            className="flex items-center gap-1 text-xs text-[var(--accent-primary)] hover:text-[var(--text-primary)] border border-[var(--accent-primary)]/30 hover:border-[var(--accent-primary)]/60 rounded-md px-2 py-1 transition-colors cursor-pointer"
                                                      >
                                                            <RefreshCw size={11} />
                                                            Retry
                                                      </button>
                                                </div>
                                          )}

                                          {/* Auto-scroll anchor */}
                                          <div ref={chatBottomRef} />
                                    </div>
                              )}

                        </div>

                        {/* ── Input bar — only appears in the chat view once a chat has started. ── */}
                        {activeView === 'chat' && (currentMessages.length > 0 || isLoading) && (
                              <div className="shrink-0 px-4 sm:px-6 pb-4 sm:pb-5">
                                    <div className="max-w-3xl mx-auto">
                                          <div className="flex select-none items-center gap-2 sm:gap-3 bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] focus-within:border-[var(--accent-primary)]/40 rounded-xl px-4 sm:px-5 py-2.5 transition-colors duration-200">
                                                <textarea
                                                      ref={textareaRef}
                                                      value={inputValue}
                                                      onChange={(e) => setInputValue(e.target.value)}
                                                      onKeyDown={handleKeyDown}
                                                      placeholder="Initialize prompt..."
                                                      rows={1}
                                                      disabled={isLoading}
                                                      className="flex-1 bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm min-w-0 resize-none max-h-[200px] overflow-y-auto disabled:opacity-50"
                                                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                                                      onInput={(e) => {
                                                            e.target.style.height = "auto";
                                                            const maxHeight = 200;
                                                            const newHeight = Math.min(e.target.scrollHeight, maxHeight);
                                                            e.target.style.height = `${newHeight}px`;
                                                            e.target.style.overflowY = e.target.scrollHeight > maxHeight ? "auto" : "hidden";
                                                      }}
                                                />
                                                <button
                                                      type="button"
                                                      onClick={handleSubmit}
                                                      disabled={!inputValue.trim() || isLoading}
                                                      className="shrink-0 self-end cursor-pointer flex items-center justify-center w-9 h-9 rounded-full bg-[var(--accent-primary)] text-[var(--text-inverse)] hover:bg-[var(--accent-primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                      <ArrowUp size={18} strokeWidth={2.5} className="hover:-translate-y-1 transition-all" />
                                                </button>
                                          </div>
                                          <p className="text-center text-[10px] text-[var(--text-muted)] mt-1.5">
                                                Press <kbd className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded px-1 py-0.5 text-[var(--text-secondary)]">Enter</kbd> to send &nbsp;·&nbsp; <kbd className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded px-1 py-0.5 text-[var(--text-secondary)]">Shift + Enter</kbd> for newline
                                          </p>
                                    </div>
                              </div>
                        )}

                  </div>

            </div>
      );

}

export default Dashboard