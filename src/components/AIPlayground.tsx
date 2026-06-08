import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  BrainCircuit, 
  Clock, 
  ChevronRight, 
  Copy, 
  Save, 
  Terminal, 
  User,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { SavedNote } from '../types';

interface AIPlaygroundProps {
  onSaveCustomNote: (title: string, concept: string, explanation: string) => Promise<void>;
  savedNotes: SavedNote[];
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function AIPlayground({
  onSaveCustomNote,
  savedNotes,
}: AIPlaygroundProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hi! I'm **ByteTutor**, your private CS expert. You can ask me to explain any technology, algorithm, system design, or engineering puzzle.\n\nType your query below, or click any of the **Quick Prompt Cards** to try an instant study path!",
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [notesSavingMap, setNotesSavingMap] = useState<{ [msgId: string]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick interactive templates
  const SUGGESTIONS = [
    {
      label: "B+Tree vs Hash Indexes",
      prompt: "Compare database B+Tree indexes and Hash indexes. Under what circumstances does each perform best, and why?"
    },
    {
      label: "REST Statelessness Code",
      prompt: "Describe the concept of 'Statelessness' in REST API design. Show a quick express TypeScript snippet illustrating bad state management vs a corrected stateless version."
    },
    {
      label: "ACID Isolation Levels",
      prompt: "Deconstruct SQL ACID 'Isolation' levels from 'Read Uncommitted' to 'Serializable'. Use clear bullet points and specify the anomalies (like Dirty Reads) each prevents."
    },
    {
      label: "Explain CAP Theorem",
      prompt: "Explain the CAP theorem clearly with a simple analogy. If a developer uses PostgreSQL, is it CP or AP?"
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const aiMsgId = `ai-${Date.now()}`;

    const newMessages: Message[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text: textToSend,
        timestamp: new Date(),
      }
    ];

    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          history: [] // Standard conversational flow handled by the server
        })
      });

      if (!response.ok) {
        throw new Error("Tutor service is heavily requested. Please double check that you have updated GEMINI_API_KEY in secrets.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [
        ...prev,
        {
          id: aiMsgId,
          sender: 'ai',
          text: data.reply || "I didn't receive a valid diagnostic output. Try asking in a different structure.",
          timestamp: new Date(),
        }
      ]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ **Diagnostic Error:** ${error instanceof Error ? error.message : "Service connection timed out. Please configure your API secret keys."}`,
          timestamp: new Date(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    window.showNotification?.("Response copied to system clipboard!", "success");
  };

  const handleSaveToCheatSheet = async (msgId: string, fullText: string) => {
    setNotesSavingMap(prev => ({ ...prev, [msgId]: true }));
    try {
      // Find a reasonable title from the text (first line or short words)
      const lines = fullText.split('\n').filter(l => l.trim().length > 0);
      let title = "Saved AI Explanation";
      if (lines.length > 0) {
        const potentialTitle = lines[0].replace(/[#*`_]/g, '').trim();
        if (potentialTitle.length > 5 && potentialTitle.length < 50) {
          title = potentialTitle;
        }
      }

      // Extract high level topic concept
      const concept = "AI Playground Query";
      
      await onSaveCustomNote(title, concept, fullText);
      window.showNotification?.("Breakdown successfully saved to your Student Dashboard Cheat-Sheets!", "success");
    } catch (err) {
      console.error(err);
      window.showNotification?.("Failed to save note. Check authentication state.", "error");
    } finally {
      setNotesSavingMap(prev => ({ ...prev, [msgId]: false }));
    }
  };

  return (
    <div id="ai-playground" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100 flex flex-col md:flex-row gap-8 h-[calc(100vh-120px)] min-h-[550px]">
      
      {/* Suggestions and Info rail (Left) */}
      <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-6">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest flex items-center">
            <Cpu className="h-4 w-4 mr-1.5" /> Virtual CS Tutor
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">ByteTutor AI</h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            ByteTutor uses Google Gemini. It can evaluate any Computer Science concept, draw ASCII diagrams, provide explanations, or debug structured code.
          </p>
        </div>

        {/* Suggestions list wrapper */}
        <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-3xl flex-grow overflow-y-auto max-h-[300px] md:max-h-none">
          <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider mb-3">Quick Topic Prompts</h4>
          <div className="space-y-2.5">
            {SUGGESTIONS.map((item, index) => (
              <button
                key={index}
                disabled={loading}
                onClick={() => handleSendMessage(item.prompt)}
                className="w-full text-left p-3 rounded-xl bg-slate-950/30 border border-slate-800 hover:border-indigo-500/30 text-xs text-slate-300 hover:text-white transition-all duration-300 flex items-start gap-1.5 group disabled:opacity-50"
              >
                <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors mt-0.5" />
                <span className="leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Terminal Chat Space (Right) */}
      <div className="flex-grow flex flex-col bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Terminal Header */}
        <div className="bg-slate-900 border-b border-slate-850 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-slate-300">bytetutor_node_active // port_3000</span>
          </div>
          <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-indigo-400 border border-slate-800">GEMINI PRO LIVE</span>
        </div>

        {/* Messages Stream */}
        <div className="flex-grow overflow-y-auto p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSaveable = !isUser && msg.id !== 'welcome' && !msg.id.startsWith('err');

            return (
              <div 
                key={msg.id}
                className={`flex gap-3.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Visual sender badge */}
                <div className={`p-2 h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                  isUser ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-cyan-400'
                }`}>
                  {isUser ? <User className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
                </div>

                {/* Message body bubble */}
                <div className="space-y-1">
                  <div className={`p-4 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap font-sans transition-all duration-300 ${
                    isUser 
                      ? 'bg-indigo-950/35 border border-indigo-500/20 text-indigo-200 rounded-tr-none' 
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none pr-6'
                  }`}>
                    {msg.text}
                  </div>

                  {/* Actions under AI messages (Copy / Save Note) */}
                  {isSaveable && (
                    <div className="flex items-center space-x-2.5 pl-1.5 mt-1 text-[10px] text-slate-500 font-mono">
                      <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <button
                        onClick={() => handleCopyText(msg.text)}
                        className="hover:text-slate-200 flex items-center transition"
                      >
                        <Copy className="h-3 w-3 mr-1" /> Copy
                      </button>
                      <span>•</span>
                      <button
                        disabled={notesSavingMap[msg.id]}
                        onClick={() => handleSaveToCheatSheet(msg.id, msg.text)}
                        className="hover:text-slate-200 flex items-center transition disabled:opacity-50"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        {notesSavingMap[msg.id] ? 'Saving...' : 'Save to Board'}
                      </button>
                    </div>
                  )}

                  {isUser && (
                    <div className="text-right text-[10px] text-slate-500 mt-1 font-mono pr-1.5">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* AI Loader indicator */}
          {loading && (
            <div className="flex gap-3.5 max-w-[80%] mr-auto">
              <div className="p-2 h-8 w-8 rounded-xl bg-slate-800 text-cyan-400 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl rounded-tl-none font-sans text-sm text-slate-500 flex items-center space-x-2 animate-pulse">
                <span>Thinking... parsing syntax parameters</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input panel form */}
        <div className="bg-slate-900 border-t border-slate-850 p-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }} 
            className="flex items-center space-x-3.5"
          >
            <input
              type="text"
              id="ai-playground-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything (e.g. explain TCP handshakes, show Go mutex codes...)"
              disabled={loading}
              className="flex-grow bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition"
            />
            <button
              id="ai-playground-submit"
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-800 disabled:text-slate-600 transition"
              title="Send prompt to ByteTutor"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
