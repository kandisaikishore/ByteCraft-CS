import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User as UserIcon, 
  Loader2, 
  Minus, 
  Maximize2,
  Trash2,
  ExternalLink,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export default function FloatingBot() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested starting questions
  const quickPills = [
    "Explain Big O notation simply",
    "How do Hash Maps resolve collisions?",
    "Compare SQL vs NoSQL structures",
    "Describe the 3-Way TCP Handshake"
  ];

  // Local storage integration to persist the conversation across tabs/views
  useEffect(() => {
    const saved = localStorage.getItem('cs_academy_chat_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        initializeGreeting();
      }
    } else {
      initializeGreeting();
    }
  }, []);

  const initializeGreeting = () => {
    const greeting: Message = {
      id: 'greet-1',
      sender: 'bot',
      text: "Hello! I'm **ByteBot**, your advanced CS study companion. 🤖✨\n\nAsk me anything! I can explain complex data structures, analyze code complexities, describe system architectures, or generate quick coding study prompts.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([greeting]);
    localStorage.setItem('cs_academy_chat_history', JSON.stringify([greeting]));
  };

  const saveHistory = (newMessages: Message[]) => {
    setMessages(newMessages);
    localStorage.setItem('cs_academy_chat_history', JSON.stringify(newMessages));
  };

  // Scroll to bottom helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `m-user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...messages, userMsg];
    saveHistory(updated);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: textToSend })
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      const botMsg: Message = {
        id: `m-bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || "Let me analyze that concept details further.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      saveHistory([...updated, botMsg]);
    } catch (e) {
      const errorMsg: Message = {
        id: `m-bot-err-${Date.now()}`,
        sender: 'bot',
        text: "I encountered a minor network parsing exception. Please check your Gemini connection secret key or ask again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      saveHistory([...updated, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Clear all active chat logs with ByteBot?")) {
      localStorage.removeItem('cs_academy_chat_history');
      initializeGreeting();
    }
  };

  // Custom text formatter to render paragraphs, inline code, bolding, lists and major backtick block chunks cleanly
  const renderFormattedText = (rawText: string) => {
    const parts = rawText.split('\n');
    let insideCodeBlock = false;
    let codeContent: string[] = [];

    return parts.map((line, idx) => {
      // Check for code blocks
      if (line.trim().startsWith('```')) {
        if (insideCodeBlock) {
          insideCodeBlock = false;
          const mergedCode = codeContent.join('\n');
          codeContent = [];
          return (
            <div key={`code-block-${idx}`} className="my-2 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[10px] text-teal-300 relative group overflow-x-auto text-left leading-relaxed">
              <div className="absolute right-2 top-2 select-none text-[9px] text-slate-500 font-mono tracking-wider">
                CODE CONTEXT
              </div>
              <pre className="whitespace-pre">{mergedCode}</pre>
            </div>
          );
        } else {
          insideCodeBlock = true;
          return null;
        }
      }

      if (insideCodeBlock) {
        codeContent.push(line);
        return null;
      }

      // Check for lists
      const isList = line.trim().startsWith('- ') || line.trim().startsWith('* ') || /^\d+\.\s/.test(line.trim());

      // Replace inline backticks `code` or bolding **bold**
      let elements: React.ReactNode[] = [];
      let tempText = line;
      let elementKey = 0;

      // Simplistic parser for basic bold/inline formats
      while (tempText.length > 0) {
        const firstBoldIdx = tempText.indexOf('**');
        const firstCodeIdx = tempText.indexOf('`');

        if (firstBoldIdx === -1 && firstCodeIdx === -1) {
          elements.push(<span key={elementKey++}>{tempText}</span>);
          break;
        }

        // Determine which format comes next
        if (firstBoldIdx !== -1 && (firstCodeIdx === -1 || firstBoldIdx < firstCodeIdx)) {
          // Process bold text
          if (firstBoldIdx > 0) {
            elements.push(<span key={elementKey++}>{tempText.substring(0, firstBoldIdx)}</span>);
          }
          const closeBoldIdx = tempText.indexOf('**', firstBoldIdx + 2);
          if (closeBoldIdx !== -1) {
            elements.push(
              <strong key={elementKey++} className="text-white font-semibold">
                {tempText.substring(firstBoldIdx + 2, closeBoldIdx)}
              </strong>
            );
            tempText = tempText.substring(closeBoldIdx + 2);
          } else {
            elements.push(<span key={elementKey++}>{tempText.substring(firstBoldIdx)}</span>);
            break;
          }
        } else {
          // Process inline code
          if (firstCodeIdx > 0) {
            elements.push(<span key={elementKey++}>{tempText.substring(0, firstCodeIdx)}</span>);
          }
          const closeCodeIdx = tempText.indexOf('`', firstCodeIdx + 1);
          if (closeCodeIdx !== -1) {
            elements.push(
              <code key={elementKey++} className="bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-[10px] px-1 py-0.5 rounded leading-none">
                {tempText.substring(firstCodeIdx + 1, closeCodeIdx)}
              </code>
            );
            tempText = tempText.substring(closeCodeIdx + 1);
          } else {
            elements.push(<span key={elementKey++}>{tempText.substring(firstCodeIdx)}</span>);
            break;
          }
        }
      }

      // Return line wrapper
      if (isList) {
        return (
          <div key={`line-${idx}`} className="flex items-start space-x-2.5 my-1.5 pl-2 text-slate-300 text-xs">
            <span className="text-indigo-400 mt-1 shrink-0 text-[10px]">•</span>
            <span className="flex-1 text-left leading-relaxed">{elements}</span>
          </div>
        );
      }

      // Empty line check
      if (!line.trim()) {
        return <div key={`empty-${idx}`} className="h-2" />;
      }

      return (
        <p key={`line-${idx}`} className="my-1.5 text-left leading-relaxed text-slate-300 text-xs">
          {elements}
        </p>
      );
    });
  };

  return (
    <div id="bytebot-container" className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Expanded chat window popup panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="bytebot-chatbox"
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.2 }}
            className="w-80 sm:w-96 h-[500px] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col mb-4 overflow-hidden relative"
          >
            {/* Top glass banner header */}
            <div className="px-4 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between select-none">
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-md">
                  <Bot className="h-4.5 w-4.5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-xs text-white">ByteBot Chat</span>
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full uppercase tracking-widest">
                      Live
                    </span>
                  </div>
                  <span className="block text-[9px] text-slate-500 font-mono">Expert CS Study AI Assistant</span>
                </div>
              </div>

              {/* Header interactions */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleClearChat}
                  title="Clear study chat history"
                  className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Scroll messages context screen */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-950 flex flex-col space-y-4">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 max-w-[85%] ${
                      isBot ? 'self-start' : 'self-end flex-row-reverse'
                    }`}
                  >
                    {/* Role avatar badge */}
                    <div className={`h-6 w-6 rounded-lg shrink-0 flex items-center justify-center border ${
                      isBot 
                        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                        : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                    }`}>
                      {isBot ? <Bot className="h-3.5 w-3.5" /> : <UserIcon className="h-3.5 w-3.5" />}
                    </div>

                    {/* Speech message block */}
                    <div className="flex flex-col space-y-1">
                      <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed border ${
                        isBot
                          ? 'bg-slate-900 border-slate-800/80 text-slate-200 rounded-tl-none'
                          : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-100 rounded-tr-none'
                      }`}>
                        {renderFormattedText(msg.text)}
                      </div>
                      <span className={`text-[8px] font-mono text-slate-500 px-1 ${
                        isBot ? 'text-left' : 'text-right'
                      }`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* "Thinking..." typing bubble block loader */}
              {isLoading && (
                <div className="flex items-start gap-2.5 max-w-[80%] self-start">
                  <div className="h-6 w-6 rounded-lg shrink-0 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  </div>
                  <div className="px-3.5 py-2.5 bg-slate-900 border border-slate-850 text-xs text-slate-400 rounded-2xl rounded-tl-none flex items-center space-x-1.5 animate-pulse">
                    <span>ByteBot is parsing logic...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggested study pills */}
            {messages.length <= 1 && !isLoading && (
              <div className="px-4 pb-2 pt-1 border-t border-slate-900 bg-slate-950/80">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5 text-left font-bold">Suggested Concepts:</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickPills.map((pill) => (
                    <button
                      key={pill}
                      onClick={() => handleSendMessage(pill)}
                      className="text-[10px] bg-slate-900 hover:bg-indigo-600/10 text-slate-300 hover:text-indigo-300 border border-slate-850 hover:border-indigo-500/20 px-2 py-1 rounded-lg transition text-left cursor-pointer duration-200"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom text typing input bar footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="p-3 bg-slate-900/90 border-t border-slate-850 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="Ask ByteBot about algorithms, complexity..."
                className="flex-1 bg-slate-950 border border-slate-800 text-[11px] text-slate-100 placeholder-slate-500 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 hover:border-slate-750"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition duration-300 shadow disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Launch Button */}
      <button
        id="bytebot-launcher"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl border cursor-pointer hover:scale-105 active:scale-95 ${
          isOpen
            ? 'bg-rose-600 border-rose-500/50 text-white shadow-rose-600/20'
            : 'bg-indigo-600 border-indigo-500/40 text-white shadow-indigo-600/20 hover:shadow-indigo-600/40'
        }`}
        title="Chat with ByteBot AI Assistant"
      >
        {isOpen ? (
          <X className="h-6 w-6 font-bold" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-cyan-400 border-2 border-indigo-600 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-cyan-400 border-2 border-indigo-600 rounded-full" />
          </div>
        )}
      </button>

    </div>
  );
}
