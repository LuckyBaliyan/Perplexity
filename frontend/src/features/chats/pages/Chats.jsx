import React, { useState } from 'react';
import { LayoutGrid, List, MessageCircle, Search, Pin, Archive } from 'lucide-react';

function formatShortDate(dateValue) {
      if (!dateValue) return '—';
      const d = new Date(dateValue);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusBadge({ chat }) {
      if (chat.isPinned) {
            return (
                  <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center">
                        <Pin size={11} />
                  </span>
            );
      }
      if (chat.isArchived) {
            return (
                  <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--bg-card)] text-[var(--text-muted)] flex items-center justify-center">
                        <Archive size={11} />
                  </span>
            );
      }
      return null;
}

function FolderCard({ chat, viewMode, title, onClick }) {
      if (viewMode === 'list') {
            return (
                  <button
                        onClick={onClick}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:border-[var(--accent-primary)]/40 hover:bg-[var(--bg-card)] transition-colors text-left cursor-pointer"
                  >
                        <div className="shrink-0 w-9 h-9 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)]">
                              <MessageCircle size={16} />
                        </div>
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{title}</p>
                              <StatusBadge chat={chat} />
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-0.5 text-right">
                              <span className="text-[11px] text-[var(--text-muted)]">Created {formatShortDate(chat.createdAt)}</span>
                              <span className="text-[11px] text-[var(--text-muted)]">Updated {formatShortDate(chat.updatedAt)}</span>
                        </div>
                  </button>
            );
      }

      return (
            <button
                  onClick={onClick}
                  className="group relative flex flex-col items-start gap-3 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:border-[var(--accent-primary)]/40 hover:bg-[var(--bg-card)] transition-colors text-left overflow-hidden cursor-pointer"
            >
                  <span className="absolute top-0 left-4 w-8 h-1.5 rounded-b-full bg-[var(--accent-primary)]/50 group-hover:bg-[var(--accent-primary)] transition-colors" />
                  <div className="flex items-center justify-between w-full">
                        <div className="w-9 h-9 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)]">
                              <MessageCircle size={16} />
                        </div>
                        <StatusBadge chat={chat} />
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)] leading-snug line-clamp-2 w-full">
                        {title}
                  </p>
                  <div className="flex flex-col gap-0.5 mt-auto pt-1 w-full">
                        <span className="text-[10px] text-[var(--text-muted)]">Created {formatShortDate(chat.createdAt)}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">Updated {formatShortDate(chat.updatedAt)}</span>
                  </div>
            </button>
      );
}

/**
 * AllChatsView — renders every chat (pinned, recent, archived) as folder cards.
 */
export function Chats({ chats, getChatTitle, onSelectChat }) {
      const [viewMode, setViewMode] = useState('grid');
      const [query, setQuery] = useState('');

      const filtered = chats.filter(chat =>
            getChatTitle(chat).toLowerCase().includes(query.trim().toLowerCase())
      );

      return (
            <div className="max-w-5xl mx-auto w-full py-8 px-1">

                  <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                        <div>
                              <h2 className="text-lg font-semibold text-[var(--text-primary)]">All Chats</h2>
                              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                    {chats.length} total {chats.length === 1 ? 'chat' : 'chats'}
                              </p>
                        </div>

                        <div className="flex items-center gap-2">
                              <div className="hidden sm:flex items-center gap-2 bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-md px-3 py-1.5 w-56">
                                    <Search size={14} className="text-[var(--text-muted)] shrink-0" />
                                    <input
                                          type="text"
                                          value={query}
                                          onChange={(e) => setQuery(e.target.value)}
                                          placeholder="Search chats.."
                                          className="bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-full min-w-0"
                                    />
                              </div>

                              <div className="flex items-center gap-1 bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-md p-1">
                                    <button
                                          onClick={() => setViewMode('grid')}
                                          className={`p-1.5 rounded cursor-pointer ${viewMode === 'grid' ? 'bg-[var(--bg-card)] text-[var(--accent-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                                    >
                                          <LayoutGrid size={15} />
                                    </button>
                                    <button
                                          onClick={() => setViewMode('list')}
                                          className={`p-1.5 rounded cursor-pointer ${viewMode === 'list' ? 'bg-[var(--bg-card)] text-[var(--accent-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                                    >
                                          <List size={15} />
                                    </button>
                              </div>
                        </div>
                  </div>

                  {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-20 gap-2">
                              <div className="w-12 h-12 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] mb-2">
                                    <MessageCircle size={20} />
                              </div>
                              <p className="text-sm text-[var(--text-primary)] font-medium">No chats found</p>
                              <p className="text-xs text-[var(--text-muted)]">Start a new conversation to see it here.</p>
                        </div>
                  ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                              {filtered.map(chat => (
                                    <FolderCard
                                          key={chat._id}
                                          chat={chat}
                                          viewMode="grid"
                                          title={getChatTitle(chat)}
                                          onClick={() => onSelectChat(chat._id)}
                                    />
                              ))}
                        </div>
                  ) : (
                        <div className="flex flex-col gap-2">
                              {filtered.map(chat => (
                                    <FolderCard
                                          key={chat._id}
                                          chat={chat}
                                          viewMode="list"
                                          title={getChatTitle(chat)}
                                          onClick={() => onSelectChat(chat._id)}
                                    />
                              ))}
                        </div>
                  )}
            </div>
      );
}