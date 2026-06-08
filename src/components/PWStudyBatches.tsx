import React, { useState, useEffect, useRef } from 'react';
import { 
  Tv, 
  BookOpen, 
  HelpCircle, 
  Sparkles, 
  Send, 
  Layers, 
  MessageSquare, 
  Award, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  User as UserIcon, 
  Video, 
  Play, 
  Check, 
  X, 
  Flame, 
  Plus, 
  ArrowLeft,
  FileText,
  BadgeAlert,
  Search,
  MessageCircle,
  ThumbsUp,
  ListOrdered,
  BookOpenCheck,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../db/firebase';

interface PWStudyBatchesProps {
  user: User | null;
  profile: UserProfile | null;
  onAddXP: (amount: number) => void;
  onSyncProfile: () => void;
}

interface DPPQuestion {
  id: string;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

interface Lecture {
  id: string;
  title: string;
  trainer: string;
  duration: string;
  videoUrlPlaceholder: string; // Thematic thumbnail or title card
  description: string;
  notes: string;
  dpp: DPPQuestion[];
}

interface Batch {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  rating: number;
  enrolledStudents: string;
  accent: string;
  lectures: Lecture[];
}

// Simulated real-time study chats that loop when video is active
const SIMULATED_CHAT_POOL = [
  { user: "Rohan K.", text: "PW OP! Excellent explanation of hash tables." },
  { user: "Aarav Sharma", text: "Is the worst-case complexity O(N) when multiple values hash to the same bucket?" },
  { user: "Priya V.", text: "Yes Priya, index collisions are resolved using chaining!" },
  { user: "Tushar Jha", text: "Today's lecture is crystal clear! Thanks teacher." },
  { user: "Neha Sinha", text: "Are DPP solutions available in the dashboard after taking quizzes?" },
  { user: "Kabir Singh", text: "Wow, the ASCII pointer diagrams made recursion so simple." },
  { user: "Suresh Gupta", text: "This batch is exactly what I needed for my coding round next week." },
  { user: "Vipul Dev", text: "Best teacher in CS! Explained isolation levels in 2 minutes." },
  { user: "Ananya Roy", text: "Completed the theory notes. Moving to Daily Practice Problems (DPP)!" }
];

const BATCHES_DATA: Batch[] = [
  {
    id: "lakshya-dsa",
    title: "Lakshya CS Batch (Data Structures & Algorithms)",
    subtitle: "Complete DSA Mastery for Placement rounds",
    description: "Our premier comprehensive batch covering arrays, linked list structures, advanced recursive programming, hash columns, dynamic programming, and binary search spaces.",
    tag: "IIT-Placement Pro",
    rating: 4.9,
    enrolledStudents: "42,800+",
    accent: "from-indigo-600 to-indigo-800",
    lectures: [
      {
        id: "dsa-lec-1",
        title: "Lecture 01: Hash Maps & Collision Resolution",
        trainer: "Vikas Sir",
        duration: "45 mins",
        videoUrlPlaceholder: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60",
        description: "Deconstruct how Buckets, Hash Codes, and Hashing functions map key-value elements. Deep-dive into collision algorithms (Chaining vs Open Addressing).",
        notes: "Hash Maps represent O(1) average lookup times. Hash keys are evaluated using compression formulas. Chaining uses linked arrays inside buckets to chain multiple items that hash identically.",
        dpp: [
          {
            id: "dsa-dpp-1-1",
            question: "What is the worst-case time complexity of inserting a key in a hash map with chaining implementation?",
            options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
            correctIdx: 2,
            explanation: "In the absolute worst case, all N keys could map to the identical bucket, which is linked-chained, demanding O(N) linear time search or traversal."
          },
          {
            id: "dsa-dpp-1-2",
            question: "Which collision resolution method stores all elements directly in the hash map table index space itself?",
            options: ["Separate Chaining", "Open Addressing", "Double Merging", "Linked Backtrack"],
            correctIdx: 1,
            explanation: "Open Addressing (e.g. Linear Probing, Quadratic Probing) stores all elements directly in the bucket table, seeking empty slots iteratively."
          },
          {
            id: "dsa-dpp-1-3",
            question: "What happens to a Hash Map when its size scales past its designated 'Load Factor' threshold?",
            options: ["It returns compile-time overflows", "It resizes/rehashes into a larger capacity table", "It switches to binary search tree modes", "It automatically truncates old keys"],
            correctIdx: 1,
            explanation: "When entries count exceeds capacity * load factor, rehashing scales up capacity (typically doubling it) and re-allocates keys to maintain reliable lookup speeds."
          }
        ]
      },
      {
        id: "dsa-lec-2",
        title: "Lecture 02: Advanced Tree Traversals (Inorder, Preorder, Postorder)",
        trainer: "Vikas Sir",
        duration: "38 mins",
        videoUrlPlaceholder: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
        description: "Master recursive depth-first tree traversals. Contrast space complexities and trace runtime execution flows on search structures.",
        notes: "Inorder: Left -> Root -> Right (returns sorted items for BST). Preorder: Root -> Left -> Right. Postorder: Left -> Right -> Root.",
        dpp: [
          {
            id: "dsa-dpp-2-1",
            question: "Which tree traversal returns node values in sorted ascending order when executed on a Binary Search Tree (BST)?",
            options: ["Preorder Traversal", "Postorder Traversal", "Inorder Traversal", "Level-order Traversal"],
            correctIdx: 2,
            explanation: "By definition, Inorder traversal (Left, Root, Right) yields values in sorted order on a valid Binary Search Tree."
          }
        ]
      }
    ]
  },
  {
    id: "arjuna-fullstack",
    title: "Arjuna Systems Batch (Full Stack Engineering)",
    subtitle: "Professional Web Dev & Cloud Architectures",
    description: "Learn Node, Express, Databases, Caching strategies, horizontal scalability, and production pipeline deployment with complete industry standards.",
    tag: "High-Caliber Web Dev",
    rating: 4.8,
    enrolledStudents: "31,200+",
    accent: "from-cyan-600 to-teal-800",
    lectures: [
      {
        id: "web-lec-1",
        title: "Lecture 01: High-Performance Database Caching with Redis",
        trainer: "Sandip Sir",
        duration: "52 mins",
        videoUrlPlaceholder: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60",
        description: "Review read-through & write-through cache patterns. Analyze memory eviction strategies (LRU, LFU, TTL) to bypass heavy SQL round-trips.",
        notes: "Redis operates completely in-memory yielding sub-millisecond query responses. Use TTL (Time to Live) to auto-invalidate stale API or database responses.",
        dpp: [
          {
            id: "web-dpp-1-1",
            question: "What cache eviction policy drops the least-recently used elements when memory capacity limits are reached?",
            options: ["LFU", "LRU", "FIFO", "Random Invalidate"],
            correctIdx: 1,
            explanation: "LRU (Least Recently Used) tracks the age of lookups and discards the item that has rested un-accessed the longest."
          },
          {
            id: "web-dpp-1-2",
            question: "Which caching strategy updates BOTH the cache repository and the underlying SQL database synchronously?",
            options: ["Cache-Aside", "Write-Through", "Write-Behind (Write-Back)", "Read-Through"],
            correctIdx: 1,
            explanation: "With Write-Through caching, write operations edit both the cache index and the durable database synchronously before returning status."
          }
        ]
      }
    ]
  }
];

export default function PWStudyBatches({ user, profile, onAddXP, onSyncProfile }: PWStudyBatchesProps) {
  // Navigation tabs
  const [activePWTab, setActivePWTab] = useState<'batches' | 'doubts' | 'dpp-stats'>('batches');
  
  // Selected state
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);

  // Classroom chat states
  const [chatMessages, setChatMessages] = useState<{user: string, text: string}[]>([]);
  const [userChatInput, setUserChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // DPP study quiz states
  const [dppActive, setDppActive] = useState<boolean>(false);
  const [currentDppIdx, setCurrentDppIdx] = useState<number>(0);
  const [selectedDppAns, setSelectedDppAns] = useState<number | null>(null);
  const [dppSubmitted, setDppSubmitted] = useState<boolean>(false);
  const [dppCorrectCount, setDppCorrectCount] = useState<number>(0);
  const [dppCompleted, setDppCompleted] = useState<boolean>(false);

  // Doubt desk states
  const [doubtQuery, setDoubtQuery] = useState('');
  const [isSolvingDoubt, setIsSolvingDoubt] = useState(false);
  const [userDoubts, setUserDoubts] = useState<{question: string, answer: string, timestamp: string}[]>([]);

  // Simulation parameters (adding random class chats when lecture plays)
  useEffect(() => {
    if (selectedLecture) {
      // Start with initial 4 chats
      setChatMessages([
        { user: "Moderator Shreya", text: "Welcome to Vikas Sir's live classroom! Support study decorum & post any queries." },
        { user: "Amiya S.", text: "Ready with notebooks! This batch is amazing." },
        { user: "Rahul K.", text: "Lecture 01 was fantastic, let's learn search structures." },
        { user: "Sumit", text: "PW CS Academy is awesome! 🔥" }
      ]);

      const interval = setInterval(() => {
        const randomItem = SIMULATED_CHAT_POOL[Math.floor(Math.random() * SIMULATED_CHAT_POOL.length)];
        setChatMessages(prev => [...prev, randomItem].slice(-25)); // Cap at 25 items
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [selectedLecture]);

  // Scroll live class chats to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Retrieve user doubt query history from local storage
  useEffect(() => {
    const savedDoubts = localStorage.getItem('pw_academia_doubt_history');
    if (savedDoubts) {
      try {
        setUserDoubts(JSON.parse(savedDoubts));
      } catch (err) {}
    }
  }, []);

  const saveDoubtToHistory = (newDoubts: typeof userDoubts) => {
    setUserDoubts(newDoubts);
    localStorage.setItem('pw_academia_doubt_history', JSON.stringify(newDoubts));
  };

  const handlePostClassChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChatInput.trim()) return;
    const newChat = {
      user: user?.displayName || "Me (Student)",
      text: userChatInput
    };
    setChatMessages(prev => [...prev, newChat]);
    setUserChatInput('');
  };

  // Submit Doubt Query to backend Gemini AI model
  const handleAskDoubtEngine = async () => {
    if (!doubtQuery.trim() || isSolvingDoubt) return;
    setIsSolvingDoubt(true);

    try {
      const prompt = `You are the highly motivating, expert Doubt Solving Instructor on PhysicsWallah's platform.
Solve the student's COMPUTER SCIENCE or PROGRAMMING query:
"${doubtQuery}"

Deliver your response in clean classroom format:
1. **Quick Simplified Explanation**: (Explain the core concept in clear human terms, matching Vikas Sir's inspiring energy)
2. **Step-by-Step Resolution**: (Deconstruct the math, code context, or design process)
3. **Interactive Study Tip**: (Suggest how to practice or avoid standard bugs). Use nice ASCII structure grids or bullet items in markdown if helpful.`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: prompt })
      });

      if (!response.ok) {
        throw new Error("Doubt system heavily loaded. Re-try in a bit!");
      }

      const data = await response.json();
      const answer = data.reply || "Hash chaining allocates a linked list to solve indices duplicates.";

      const newDoubt = {
        question: doubtQuery,
        answer,
        timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };

      const updated = [newDoubt, ...userDoubts];
      saveDoubtToHistory(updated);
      setDoubtQuery('');
    } catch (e: any) {
      window.showNotification?.("Error: " + e.message, "error");
    } finally {
      setIsSolvingDoubt(false);
    }
  };

  // Handle individual DPP answers
  const handleSelectDppOption = (optIdx: number) => {
    if (dppSubmitted) return;
    setSelectedDppAns(optIdx);
  };

  const handleSubmitDppQuestion = () => {
    if (selectedDppAns === null || !selectedLecture) return;

    const currentQuestion = selectedLecture.dpp[currentDppIdx];
    const isCorrect = selectedDppAns === currentQuestion.correctIdx;

    if (isCorrect) {
      setDppCorrectCount(prev => prev + 1);
    }

    setDppSubmitted(true);
  };

  const handleNextDppQuestion = () => {
    if (!selectedLecture) return;

    setSelectedDppAns(null);
    setDppSubmitted(false);

    if (currentDppIdx + 1 < selectedLecture.dpp.length) {
      setCurrentDppIdx(prev => prev + 1);
    } else {
      // Completed current DPP!
      setDppCompleted(true);
      // Reward client with dynamic educational XP based on scores
      const earnedXP = dppCorrectCount * 25 + 50; 
      onAddXP(earnedXP);
      
      // Update completeness in Firebase metadata if authenticated
      if (user) {
        syncDPPCompleteness(selectedLecture.id);
      }
    }
  };

  const syncDPPCompleteness = async (lecId: string) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        completedDPPs: arrayUnion(lecId),
        updatedAt: new Date().toISOString()
      });
      onSyncProfile();
    } catch (err) {}
  };

  const handleResetDpp = () => {
    setCurrentDppIdx(0);
    setSelectedDppAns(null);
    setDppSubmitted(false);
    setDppCorrectCount(0);
    setDppCompleted(false);
  };

  return (
    <div id="pw-curriculum-scope" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white animate-fade-in">
      
      {/* Upper header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              PW Style Academic System
            </span>
            <span className="text-slate-500 font-mono text-xs">•</span>
            <span className="text-slate-400 font-mono text-xs">BATCHES, LECTURES & DAILY QUZZES</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            PW Cohort Classrooms
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access intense study batches, stream video lectures alongside peer mock chats, test your logical acuity with **DPP Quizzes**, and ask the Doubt Engine.
          </p>
        </div>

        {/* Tab Switch buttons */}
        <div className="flex space-x-1.5 bg-slate-950 border border-slate-850 p-1 rounded-xl">
          <button
            onClick={() => {
              setActivePWTab('batches');
              setSelectedBatch(null);
              setSelectedLecture(null);
              setDppActive(false);
            }}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all ${
              activePWTab === 'batches'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5 inline mr-1.5" />
            Study Batches
          </button>

          <button
            onClick={() => {
              setActivePWTab('doubts');
              setDppActive(false);
            }}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all ${
              activePWTab === 'doubts'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5 inline mr-1.5" />
            24/7 Doubt Engine
          </button>

          <button
            onClick={() => {
              setActivePWTab('dpp-stats');
              setDppActive(false);
            }}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all ${
              activePWTab === 'dpp-stats'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpenCheck className="h-3.5 w-3.5 inline mr-1.5" />
            DPP Records
          </button>
        </div>
      </div>

      {/* Main Tab displays */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: BATCHES & LECTURE VIEWS */}
        {activePWTab === 'batches' && (
          <motion.div
            key="pw-batches-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Case A: Show all listed Batches */}
            {!selectedBatch && !selectedLecture && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {BATCHES_DATA.map((batch) => (
                  <div
                    key={batch.id}
                    onClick={() => setSelectedBatch(batch)}
                    className="bg-slate-900 border border-slate-800/80 hover:border-slate-700/60 rounded-3xl p-6 shadow-xl relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
                  >
                    {/* Glowing highlight sphere */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 pointer-events-none transition" />

                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-slate-950 text-amber-400 border border-amber-500/20`}>
                          {batch.tag}
                        </span>
                        
                        {/* Rating stars */}
                        <div className="flex items-center space-x-1 font-mono text-[10px] text-amber-500 font-bold">
                          <Star className="h-3.5 w-3.5 fill-amber-500" />
                          <span>{batch.rating}</span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-400 transition mb-1 text-left">
                        {batch.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono text-left mb-3">
                        {batch.subtitle}
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed text-left mb-6">
                        {batch.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-2">
                      <div className="text-[10px] text-slate-500 font-mono">
                        Enrolled Students: <span className="text-indigo-400 font-bold">{batch.enrolledStudents}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-amber-400 group-hover:translate-x-1.5 transition font-bold">
                        <span>Enroll & Learn</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Case B: Inside a Selected Batch (Lectures Index) */}
            {selectedBatch && !selectedLecture && (
              <div className="space-y-6">
                {/* Back Link */}
                <button
                  onClick={() => setSelectedBatch(null)}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-amber-400 font-mono text-xs text-slate-400 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to Batches</span>
                </button>

                {/* Batch overview panel */}
                <div className={`p-6 md:p-8 rounded-3xl bg-gradient-to-r ${selectedBatch.accent} border border-slate-800 relative z-10 overflow-hidden text-left shadow-2xl`}>
                  <div className="absolute right-0 top-0 opacity-10 font-mono text-9xl uppercase font-extrabold select-none pointer-events-none translate-x-8 translate-y-4">
                    PW
                  </div>
                  
                  <span className="bg-slate-950/60 text-amber-400 border border-slate-900 px-3 py-1 rounded-md text-[9px] font-mono font-bold tracking-widest uppercase">
                    OFFICIAL COHORT RUNNING
                  </span>
                  
                  <h2 className="text-2xl font-bold mt-3 text-white leading-tight">
                    {selectedBatch.title}
                  </h2>
                  <p className="text-xs text-slate-200 font-mono mt-1 mb-4 leading-relaxed">
                    {selectedBatch.subtitle}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-slate-100">
                    <div>
                      <span className="block text-[10px] text-slate-300 font-mono">LECTURES DELIVERED</span>
                      <span className="text-sm font-bold font-mono">{selectedBatch.lectures.length} Total Lessons</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-300 font-mono">RATING</span>
                      <span className="text-sm font-bold font-mono text-amber-300">★ 4.9 out of 5</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-300 font-mono">DOUBT CLEARANCE</span>
                      <span className="text-sm font-bold font-mono">24/7 Unlimited Checks</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-300 font-mono">DPP MODULES</span>
                      <span className="text-sm font-bold font-mono">Practice Questions Included</span>
                    </div>
                  </div>
                </div>

                {/* Lectures List */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-200 text-left uppercase font-mono tracking-wider">
                    Lecture Index ({selectedBatch.lectures.length} classes available)
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {selectedBatch.lectures.map((lec, idx) => (
                      <div
                        key={lec.id}
                        onClick={() => setSelectedLecture(lec)}
                        className="bg-slate-900/80 border border-slate-800 hover:border-slate-750 p-5 rounded-2xl flex flex-col md:flex-row gap-5 items-start justify-between cursor-pointer group transition hover:bg-slate-900"
                      >
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center text-left">
                          {/* Simulated Play/Icon box */}
                          <div className="h-12 w-12 rounded-xl bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 flex items-center justify-center shrink-0 border border-orange-500/20 group-hover:scale-105 active:scale-95 transition">
                            <Play className="h-5 w-5 fill-current" />
                          </div>

                          <div>
                            <span className="text-[10px] font-mono text-amber-500 font-bold block uppercase">
                              Class {idx + 1} • Trainer: {lec.trainer}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-0.5 group-hover:text-amber-400 transition">
                              {lec.title}
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed mt-1 line-clamp-2 max-w-2xl">
                              {lec.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 self-end md:self-center shrink-0">
                          <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded-lg border border-slate-850/60">
                            {lec.duration} Duration
                          </span>
                          <button className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold font-mono text-[11px] px-3.5 py-1.5 rounded-xl transition duration-300">
                            View Lesson
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Case C: Active Classroom Screen (Play Lecture, Chat feed side by side, DPP tab) */}
            {selectedBatch && selectedLecture && (
              <div className="space-y-6">
                
                {/* Back button link row */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedLecture(null);
                      setDppActive(false);
                    }}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-amber-400 font-mono text-xs text-slate-400 transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Return to Lecture Index</span>
                  </button>

                  {/* Toggle DPP mode in lecture header */}
                  <button
                    onClick={() => {
                      setDppActive(!dppActive);
                      handleResetDpp();
                    }}
                    className={`flex items-center space-x-1.5 text-xs font-mono font-bold px-4 py-2 rounded-xl transition-all border ${
                      dppActive
                        ? 'bg-rose-500 border-rose-400 text-white shadow-lg'
                        : 'bg-indigo-600/10 border-indigo-500/20 hover:bg-indigo-600/30 text-indigo-300'
                    }`}
                  >
                    <BookOpenCheck className="h-4 w-4" />
                    <span>{dppActive ? "Exit Practice Quiz" : "Take Lecture DPP Quiz"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column (lg:col-span-8): Either DPP Practice or Lecture Video Stream */}
                  <div className="lg:col-span-8">
                    {dppActive ? (
                      /* Daily Practice Problems (DPP) Active Dashboard */
                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                        
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                          <div>
                            <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider block">LECTURE ATTACHMENT</span>
                            <h3 className="text-base font-bold text-white">Daily Practice Problems (DPP)</h3>
                            <span className="text-[10px] font-mono text-slate-500 block">Topic: {selectedLecture.title}</span>
                          </div>
                          
                          <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-850 text-xs font-mono text-indigo-300 font-bold">
                            Question {currentDppIdx + 1} of {selectedLecture.dpp.length}
                          </span>
                        </div>

                        {/* Complete Screen */}
                        {dppCompleted ? (
                          <div className="text-center py-12 space-y-4">
                            <div className="h-14 w-14 bg-green-500/10 text-green-400 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-green-500/5">
                              <CheckCircle2 className="h-7 w-7" />
                            </div>
                            
                            <h4 className="text-lg font-bold text-white">DPP Assignment Completed!</h4>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                              You solved {dppCorrectCount} of {selectedLecture.dpp.length} problems correctly. Study points +{dppCorrectCount * 25 + 50} XP points added to profile!
                            </p>

                            <div className="text-xl font-mono font-bold text-indigo-400">
                              Score: {Math.round((dppCorrectCount / selectedLecture.dpp.length) * 100)}%
                            </div>

                            <div className="flex justify-center space-x-3 pt-4">
                              <button
                                onClick={handleResetDpp}
                                className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-bold font-mono px-5 py-2 rounded-xl transition"
                              >
                                Try Again
                              </button>
                              <button
                                onClick={() => {
                                  setDppActive(false);
                                  handleResetDpp();
                                }}
                                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-mono px-5 py-2 rounded-xl transition"
                              >
                                Back to Video
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Question text */}
                            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl font-sans text-white text-xs leading-relaxed">
                              {selectedLecture.dpp[currentDppIdx].question}
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 gap-3">
                              {selectedLecture.dpp[currentDppIdx].options.map((opt, oIdx) => {
                                const isSelected = selectedDppAns === oIdx;
                                const isSubmitted = dppSubmitted;
                                const isCorrectOpt = oIdx === selectedLecture.dpp[currentDppIdx].correctIdx;

                                let borderClass = "border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-300";
                                if (isSelected) {
                                  borderClass = "border-indigo-500 bg-indigo-950/25 text-indigo-300";
                                }
                                if (isSubmitted) {
                                  if (isCorrectOpt) {
                                    borderClass = "border-green-500 bg-green-950/20 text-green-300 font-bold";
                                  } else if (isSelected) {
                                    borderClass = "border-red-500 bg-red-950/20 text-red-300";
                                  }
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    onClick={() => handleSelectDppOption(oIdx)}
                                    className={`w-full text-left p-3.5 rounded-xl border text-xs leading-relaxed transition flex items-center justify-between ${borderClass}`}
                                  >
                                    <div className="flex items-center space-x-2.5">
                                      <span className="font-mono text-[10px] text-slate-500">({String.fromCharCode(65 + oIdx)})</span>
                                      <span>{opt}</span>
                                    </div>

                                    {/* Evaluation badges */}
                                    {isSubmitted && (isCorrectOpt ? (
                                      <Check className="h-4 w-4 text-green-400 shrink-0" />
                                    ) : (isSelected && (
                                      <X className="h-4 w-4 text-red-400 shrink-0" />
                                    )))}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Explanation board block */}
                            {dppSubmitted && (
                              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl leading-relaxed text-[11px] animate-fade-in text-slate-300">
                                <span className="text-[9px] font-mono font-bold uppercase text-amber-500 block">EXAMINATION BLUEPRINT</span>
                                <p className="mt-1 font-sans">{selectedLecture.dpp[currentDppIdx].explanation}</p>
                              </div>
                            )}

                            {/* Actions footer */}
                            <div className="flex justify-end pt-2 border-t border-slate-800/60">
                              {!dppSubmitted ? (
                                <button
                                  onClick={handleSubmitDppQuestion}
                                  disabled={selectedDppAns === null}
                                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-mono font-bold text-xs px-5 py-2 rounded-xl transition"
                                >
                                  Submit Answer
                                </button>
                              ) : (
                                <button
                                  onClick={handleNextDppQuestion}
                                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs px-6 py-2 rounded-xl transition"
                                >
                                  {currentDppIdx + 1 === selectedLecture.dpp.length ? "Finish DPP Quiz" : "Next Question"}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Simulated Interactive Video player wrapper with live controls */
                      <div className="space-y-4">
                        <div className="bg-slate-950 border border-slate-850 p-1.5 rounded-2xl overflow-hidden shadow-2xl relative group aspect-video">
                          <img
                            src={selectedLecture.videoUrlPlaceholder}
                            alt="Thematic Video placeholder"
                            className="w-full h-full object-cover rounded-xl brightness-75 select-none"
                          />

                          {/* Dark opacity overlay & Play button representation */}
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center pointer-events-none">
                            <div className="h-16 w-16 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center shadow-2xl scale-100 group-hover:scale-105 transition duration-300">
                              <Play className="h-7 w-7 fill-current ml-1" />
                            </div>
                            <span className="text-white text-xs font-mono px-3.5 py-1.5 bg-slate-950/80 border border-slate-800 rounded-full mt-4 bg-opacity-90">
                              Stream Live - Recorded Archive
                            </span>
                          </div>

                          {/* Classroom state slider overlay */}
                          <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 border border-slate-800/85 p-3 rounded-xl flex items-center justify-between text-[11px] font-mono leading-none bg-opacity-95">
                            <div className="flex items-center space-x-2">
                              <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-ping" />
                              <span className="text-slate-100">Vikas Sir's Lecture Streaming</span>
                            </div>
                            <div className="text-slate-400">
                              Time: <span className="text-amber-500 font-bold">12:15</span> / {selectedLecture.duration}
                            </div>
                          </div>
                        </div>

                        {/* Lecture overview and study theoretical notes */}
                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-left space-y-4 shadow-md">
                          <div>
                            <span className="text-[10px] font-mono text-amber-500 font-bold block uppercase tracking-wider">LECTURE BLUEPRINT</span>
                            <h3 className="text-base font-bold text-white mt-0.5">{selectedLecture.title}</h3>
                            <span className="text-xs text-slate-400 font-mono">Delivered by: {selectedLecture.trainer}</span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed leading-normal bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                            {selectedLecture.description}
                          </p>

                          <div className="space-y-2 pt-2 border-t border-slate-850">
                            <h4 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">CLASS THEORETICAL NOTES</h4>
                            <p className="text-xs text-slate-400 leading-relaxed italic whitespace-pre-wrap pl-3 border-l-2 border-indigo-500">
                              {selectedLecture.notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column (lg:col-span-4): Simulated Interactive Peer Live Chat */}
                  <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl h-[480px] md:h-[550px] flex flex-col overflow-hidden shadow-xl text-left">
                    <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-amber-400" />
                        <span className="text-xs font-mono text-slate-200">Study Classroom Chat</span>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                        Online
                      </span>
                    </div>

                    {/* Chat log context feed */}
                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col space-y-3 bg-slate-950/30">
                      {chatMessages.map((msg, mIdx) => (
                        <div key={mIdx} className="text-xs leading-normal">
                          <span className="font-bold text-indigo-300 mr-1.5 font-mono">
                            {msg.user}:
                          </span>
                          <span className="text-slate-300 font-sans">
                            {msg.text}
                          </span>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Active Chat submission form */}
                    <form onSubmit={handlePostClassChat} className="p-3 bg-slate-900 border-t border-slate-850 flex items-center gap-2">
                      <input
                        type="text"
                        value={userChatInput}
                        onChange={(e) => setUserChatInput(e.target.value)}
                        placeholder="Say post or comment..."
                        className="flex-grow bg-slate-950 border border-slate-800 text-[11px] text-slate-100 placeholder-slate-500 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                      />
                      <button
                        type="submit"
                        disabled={!userChatInput.trim()}
                        className="p-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 rounded-xl transition duration-300 shrink-0"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: Classroom Doubt Clearing Portal */}
        {activePWTab === 'doubts' && (
          <motion.div
            key="pw-doubts-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            {/* Input card doubt clearing */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center space-x-2.5 mb-3">
                <div className="h-10 w-10 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center">
                    PW Instant Doubt Desk
                  </h3>
                  <span className="block text-[10px] font-mono text-slate-400">Ask any system architecture, sorting logic, database index, or CS assignment doubt</span>
                </div>
              </div>

              <div className="space-y-4">
                <textarea
                  value={doubtQuery}
                  onChange={(e) => setDoubtQuery(e.target.value)}
                  placeholder="Ask Vikas Sir's Doubt Engine... (e.g. Compare Separate Chaining vs Linear Probing, Explain BST worst case runtime...)"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700/60 transition focus:border-amber-500 focus:outline-none rounded-xl p-4 text-xs text-slate-200 placeholder-slate-500 resize-none h-24 font-mono leading-relaxed"
                />

                <div className="flex justify-end items-center">
                  <button
                    onClick={handleAskDoubtEngine}
                    disabled={!doubtQuery.trim() || isSolvingDoubt}
                    className="flex items-center space-x-1.5 bg-amber-500 disabled:bg-slate-800 disabled:text-slate-600 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs px-5 py-2.5 rounded-xl transition duration-300"
                  >
                    {isSolvingDoubt ? (
                      <>
                        <span className="animate-spin h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent rounded-full mr-1.5" />
                        <span>Solving doubt...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Solve Doubt Instantly</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Resolve Logs */}
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h4 className="text-xs font-mono font-bold tracking-wider text-amber-500 uppercase">
                  My Doubt Logs ({userDoubts.length} questions answered)
                </h4>
                {userDoubts.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm("Clear your doubt clearing logs?")) {
                        saveDoubtToHistory([]);
                      }
                    }}
                    className="text-[10px] font-mono text-slate-500 hover:text-red-400 hover:underline"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {userDoubts.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl text-center text-slate-500 font-mono text-xs">
                  <HelpCircle className="h-8 w-8 mx-auto mb-2 text-slate-650 animate-pulse" />
                  <p>Your Doubt clearance history is empty.</p>
                  <p className="text-[10px] mt-1 text-slate-600">Submit a CS query above to query our AI classroom teacher!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userDoubts.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5 hover:border-slate-750 transition"
                    >
                      <div className="flex items-start justify-between border-b border-slate-850 pb-2 gap-2">
                        <div className="flex items-start space-x-2 text-xs text-white">
                          <span className="font-bold text-amber-500 font-mono text-[11px] shrink-0 mt-0.5">DOUBT Q:</span>
                          <span className="font-semibold text-slate-100 font-mono">{item.question}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                          {item.timestamp}
                        </span>
                      </div>

                      {/* AI Doubt solver response */}
                      <div className="text-xs leading-relaxed font-sans text-slate-300 bg-slate-950/40 border border-slate-850 p-4 rounded-xl whitespace-pre-wrap">
                        {item.answer.split('\n').map((line, lIdx) => {
                          const isBoldHeader = line.startsWith('**') || line.startsWith('###');
                          return (
                            <p key={lIdx} className={`mb-2.5 ${isBoldHeader ? 'text-amber-400 font-bold mt-3 first:mt-0' : ''}`}>
                              {line.replace(/[#*`]/g, '')}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </motion.div>
        )}

        {/* TAB 3: DPP Records */}
        {activePWTab === 'dpp-stats' && (
          <motion.div
            key="pw-dpp-stats-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6 max-w-4xl mx-auto text-left"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

              <h3 className="text-base font-bold text-white mb-2">Practice Records & Metrics</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Evaluating physical concepts iteratively increases logical comprehension. Check your overall Practice DPP metrics, complete topics, and review completed assignment badges.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                {/* Metric 1 */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl">
                  <span className="block text-[10px] text-slate-500">ASSIGNMENT BADGE LEVEL</span>
                  <span className="text-xl font-bold text-indigo-400 mt-1 block">Level I Practice Ranger</span>
                  <p className="text-[9px] text-slate-500 mt-1.5 leading-tight">Complete any classroom DPP to level up.</p>
                </div>

                {/* Metric 2 */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl">
                  <span className="block text-[10px] text-slate-500">SUCCESS ACCURACY</span>
                  <span className="text-xl font-bold text-cyan-400 mt-1 block">85% Correct</span>
                  <p className="text-[9px] text-slate-500 mt-1.5 leading-tight">Average first-attempt scores across DPP matrices.</p>
                </div>

                {/* Metric 3 */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl">
                  <span className="block text-[10px] text-slate-500">PRACTICE STREAK POINTS</span>
                  <span className="text-xl font-bold text-amber-500 mt-1 block">+50 XP Bonus Ready</span>
                  <p className="text-[9px] text-slate-500 mt-1.5 leading-tight">Take back-to-back quizzes to trigger multipliers!</p>
                </div>
              </div>
            </div>

            {/* List of all lessons with DPP status */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
                Interactive Daily Practice Problems Catalogue
              </h4>

              <div className="space-y-2.5">
                {BATCHES_DATA.flatMap(b => b.lectures).map((lec) => (
                  <div
                    key={lec.id}
                    className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase">Assignment Code: {lec.id}</span>
                      <h5 className="font-bold text-white mt-0.5">{lec.title} DPP</h5>
                      <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">{lec.dpp.length} questions included</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedBatch(BATCHES_DATA.find(b => b.lectures.some(l => l.id === lec.id)) || null);
                        setSelectedLecture(lec);
                        setDppActive(true);
                        setActivePWTab('batches');
                        handleResetDpp();
                      }}
                      className="bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/30 text-indigo-300 font-mono font-bold text-[11px] px-3.5 py-1.5 rounded-xl transition"
                    >
                      Start Assignment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
