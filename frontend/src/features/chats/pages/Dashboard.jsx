import React, { useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/useChat';
import { useEffect } from 'react';
import {
      Plus,
      MessageSquare,
      Archive,
      Zap,
      Settings,
      HelpCircle,
      LogOut,
      User,
      Search,
      Bell,
      LayoutGrid,
      ArrowUp,
      Menu,
      X
} from 'lucide-react';
import useReveal from '../../animations/hooks/useReveal';

/**
 * @description Dashboard UI
 * @returns React Component
*/

function Dashboard() {

      const chat = useChat();

      const hRef = useRef(null);
      const inpRef = useRef(null);

      useReveal(hRef, { delay: 0.1, yfrom: 20, yto: 0, duration: 2, opacityFrom: 0, opacityTo: 1 });
      useReveal(inpRef, { delay: 0.8, yfrom: 20, yto: 0, duration: 1, opacityFrom: 0, opacityTo: 1 });

      const user = useSelector(state => state.auth.user);
      console.log(user);

      const [sidebarOpen, setSidebarOpen] = useState(false);

      useEffect(() => {

            chat.initalizeSocketConnection();

      }, [])

      return (
            <div className="flex h-screen w-full bg-[#121414] text-[#e2e2e2] overflow-hidden">

                  {/* Mobile overlay */}
                  {sidebarOpen && (
                        <div
                              onClick={() => setSidebarOpen(false)}
                              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        />
                  )}

                  {/* Sidebar */}
                  <aside
                        className={`
                              fixed md:static inset-y-0 left-0 z-50
                              w-[260px] md:w-[280px] shrink-0
                              bg-[#0c0f0f]/95 md:bg-[#0c0f0f] backdrop-blur-xl md:backdrop-blur-none
                              border-r border-[#282a2b]
                              flex flex-col
                              transform transition-transform duration-300 ease-in-out
                              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                              md:translate-x-0
                        `}
                  >

                        {/* Logo + close (mobile) */}
                        <div className="flex items-center justify-between px-5 py-5">
                              <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md bg-[#adc6ff] flex items-center justify-center text-[#002e69] font-bold text-sm">
                                          P
                                    </div>
                                    <div>
                                          <p className="text-sm font-semibold text-white leading-tight">Perplexor AI</p>
                                          <p className="text-[11px] text-[#8b90a0] leading-tight">Powering Intelligence</p>
                                    </div>
                              </div>
                              <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="md:hidden cursor-pointer text-[#8b90a0] hover:text-white transition-colors"
                              >
                                    <X size={20} />
                              </button>
                        </div>

                        {/* New Chat */}
                        <div className="px-4 mt-2">
                              <button className="w-full cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-md border border-[#8bdc00]/40 text-[#9ffb06] text-sm font-medium hover:bg-[#8bdc00]/5 transition-colors">
                                    <Plus size={16} />
                                    New Chat
                              </button>
                        </div>

                        {/* Nav */}
                        <nav className="flex flex-col gap-1 px-4 mt-6">
                              <button className="cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[#c1c6d7] hover:bg-[#1e2020] transition-colors">
                                    <MessageSquare size={16} />
                                    Recent Conversations
                              </button>
                              <button className="cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[#c1c6d7] hover:bg-[#1e2020] transition-colors">
                                    <Archive size={16} />
                                    Archives
                              </button>
                              <button className="cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[#c1c6d7] hover:bg-[#1e2020] transition-colors">
                                    <Zap size={16} />
                                    Capabilities
                              </button>
                              <button className="cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[#c1c6d7] hover:bg-[#1e2020] transition-colors">
                                    <Settings size={16} />
                                    Settings
                              </button>
                        </nav>

                        <div className="flex-1" />

                        {/* Upgrade */}
                        <div className="px-4">
                              <button className="w-full py-2.5  rounded-md bg-[#adc6ff] text-[#002e69] text-sm font-semibold hover:bg-[#c3d5ff] transition-colors">
                                    Upgrade to Pro
                              </button>
                        </div>

                        {/* Bottom links */}
                        <div className="flex flex-col gap-1 px-4 mt-4">
                              <button className="cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[#c1c6d7] hover:bg-[#1e2020] transition-colors">
                                    <HelpCircle size={16} />
                                    Help
                              </button>
                              <button className="cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[#c1c6d7] hover:bg-[#1e2020] transition-colors">
                                    <LogOut size={16} />
                                    Logout
                              </button>
                        </div>

                        {/* User */}
                        <div className="flex items-center gap-3 px-5 py-4 border-t border-[#282a2b] mt-2">
                              <div className="w-8 h-8 cursor-pointer rounded-full bg-[#333535] flex items-center justify-center">
                                    <User size={16} className="text-[#c1c6d7]" />
                              </div>
                              <p className="text-sm text-[#e2e2e2]">{user?.username || 'User Alpha'}</p>
                        </div>

                  </aside>

                  {/* Main */}
                  <div className="flex-1 flex flex-col min-w-0">

                        {/* Header */}
                        <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-[#282a2b]">

                              <div className="flex items-center gap-4">
                                    <button
                                          onClick={() => setSidebarOpen(true)}
                                          className="md:hidden cursor-pointer text-[#8b90a0] hover:text-white transition-colors"
                                    >
                                          <Menu size={22} />
                                    </button>

                                    <div className="hidden md:flex items-center gap-6 text-sm">
                                          <button className="text-white font-medium border-b-2 border-[#adc6ff] pb-1">Models</button>
                                          <button className="text-[#8b90a0] hover:text-white transition-colors">API</button>
                                          <button className="text-[#8b90a0] hover:text-white transition-colors">Enterprise</button>
                                    </div>
                              </div>

                              <div className="flex items-center gap-2 md:gap-4">
                                    <div className="hidden sm:flex items-center gap-2 bg-[#1a1c1c] border border-[#414755] rounded-md px-3 py-1.5 w-40 md:w-64">
                                          <Search size={14} className="text-[#8b90a0] shrink-0" />
                                          <input
                                                type="text"
                                                placeholder="Search archive..."
                                                className="bg-transparent outline-none text-sm text-[#e2e2e2] placeholder:text-[#8b90a0] w-full min-w-0"
                                                style={{ fontFamily: 'JetBrains Mono, monospace' }}
                                          />
                                    </div>
                                    <button className="sm:hidden cursor-pointer text-[#8b90a0] hover:text-white transition-colors">
                                          <Search size={18} />
                                    </button>
                                    <button className="hidden cursor-pointer sm:inline-flex text-[#8b90a0] hover:text-white transition-colors">
                                          <Bell size={18} />
                                    </button>
                                    <button className="hidden cursor-pointer sm:inline-flex text-[#8b90a0] hover:text-white transition-colors">
                                          <LayoutGrid size={18} />
                                    </button>
                                    <button className="cursor-pointer flex items-center gap-2 bg-[#adc6ff] text-[#002e69] text-sm font-medium px-3 md:px-4 py-2 rounded-md hover:bg-[#c3d5ff] transition-colors">
                                          <User size={16} className="sm:hidden" />
                                          <span className="hidden sm:inline">Profile Settings</span>
                                    </button>
                              </div>
                        </header>

                        {/* Hero */}
                        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6">

                              <h1 ref={hRef}
                                    className="text-center text-white font-semibold tracking-tight text-3xl sm:text-4xl md:text-5xl leading-tight max-w-3xl"
                                    style={{ fontFamily: 'Geist, sans-serif' }}
                              >
                                    How can I assist your{' '}
                                    <span className="text-[#adc6ff]">Intelligence</span> today?
                              </h1>

                              <div className="w-full max-w-2xl mt-8 sm:mt-12">
                                    <div ref={inpRef} className="flex items-center gap-2 sm:gap-3 bg-[#1a1c1c]/60 backdrop-blur-2xl border border-[#414755] rounded-lg px-4 sm:px-5 py-3 sm:py-4 shadow-[0_0_20px_rgba(173,198,255,0.05)] focus-within:border-[#adc6ff]/50 transition-colors">
                                          <input
                                                type="text"
                                                placeholder="Initialize prompt..."
                                                className="flex-1 bg-transparent outline-none text-[#e2e2e2] placeholder:text-[#8b90a0] text-sm min-w-0"
                                                style={{ fontFamily: 'JetBrains Mono, monospace' }}
                                          />
                                          <button
                                                type="button"
                                                className="shrink-0 cursor-pointer flex items-center justify-center w-9 h-9 rounded-md bg-[#adc6ff] text-[#002e69] hover:bg-[#c3d5ff] transition-colors"
                                          >
                                                <ArrowUp size={18} strokeWidth={2.5} className='hover:-translate-y-1 transition-all' />
                                          </button>
                                    </div>
                              </div>

                        </div>

                  </div>

            </div>
      )

}

export default Dashboard