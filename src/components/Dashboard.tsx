import React, { useState } from 'react';
import { 
  Award, 
  Flame, 
  BookOpen, 
  Calendar, 
  FileText, 
  Trash2, 
  CheckCircle,
  HelpCircle,
  BookMarked,
  BrainCircuit,
  ArrowUpRight
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { UserProfile, QuizSubmission, SavedNote } from '../types';
import { csDomains } from '../data/curriculum';

interface DashboardProps {
  profile: UserProfile | null;
  quizHistory: QuizSubmission[];
  savedNotes: SavedNote[];
  onDeleteNote: (noteId: string) => Promise<void>;
  setActiveTab: (tab: 'learn' | 'playground' | 'dashboard') => void;
}

export default function Dashboard({
  profile,
  quizHistory,
  savedNotes,
  onDeleteNote,
  setActiveTab,
}: DashboardProps) {
  const [selectedNote, setSelectedNote] = useState<SavedNote | null>(null);

  // Compute stats
  const totalXP = profile?.xp || 0;
  const streak = profile?.streak || 0;
  const level = profile?.level || 1;
  const nextLevelXP = level * 1000;
  const progressToNextLevel = Math.min(((totalXP % 1000) / 1000) * 100, 100);

  // Calculate mastery data per CS domain
  const skillMastery = csDomains.map(domain => {
    // Find all submissions belonging to this domain
    const submissions = quizHistory.filter(sub => sub.domainId === domain.id);
    let scoreTotal = 0;
    submissions.forEach(sub => {
      scoreTotal += (sub.correctAnswers / sub.totalQuestions) * 100;
    });

    const mastery = submissions.length > 0 ? Math.round(scoreTotal / submissions.length) : 0;

    return {
      subject: domain.title,
      A: mastery,
      fullMark: 100,
    };
  });

  // Calculate recent quizzes overview
  const recentQuizzes = [...quizHistory]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 5);

  return (
    <div id="student-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100">
      {/* Top Banner / Welcome Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 h-40 w-40 bg-cyan-500/10 rounded-full blur-3xl -z-10" />
        
        <div className="flex items-center space-x-5">
          <div className="relative">
            <img
              referrerPolicy="no-referrer"
              src={profile?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=ByteCraft'}
              alt="User profile representation"
              className="h-20 w-20 rounded-2xl border-2 border-indigo-400 p-1 bg-slate-800/80 shadow-md object-cover"
            />
            <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-indigo-500 to-cyan-500 text-[10px] font-mono leading-none font-bold px-2 py-1 rounded-full border border-slate-900 shadow">
              Lvl {level}
            </span>
          </div>
          <div>
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-widest">Student Core Profile</span>
            <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight mt-0.5 text-white">
              Hello, {profile?.displayName || 'Scholar'}!
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Your CS training dashboard is synchronizing correctly. Keep exploring new technologies.
            </p>
          </div>
        </div>

        {/* Level Progress Indicator */}
        <div className="w-full md:w-80 bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1.5">
            <span>XP Level Progress</span>
            <span className="font-bold text-slate-200">{totalXP % 1000} / 1000 XP</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3.5 border border-slate-800 p-[2px]">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-1000 relative"
              style={{ width: `${progressToNextLevel}%` }}
            >
              <div className="absolute -right-1 -top-1 h-3.5 w-3.5 bg-white rounded-full border border-indigo-500 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5 font-mono">
            <span>LEVEL {level}</span>
            <span>LEVEL {level + 1}</span>
          </div>
        </div>
      </div>

      {/* Grid of Key Performance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div id="stat-card-xp" className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex items-center space-x-4 shadow">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-mono">Total Points</p>
            <h3 className="text-2xl font-bold font-mono text-white mt-0.5">{totalXP} <span className="text-xs text-slate-400">XP</span></h3>
          </div>
        </div>

        <div id="stat-card-streak" className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex items-center space-x-4 shadow">
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-mono">Engagement Streak</p>
            <h3 className="text-2xl font-bold font-mono text-white mt-0.5">{streak} <span className="text-xs text-slate-400">Days</span></h3>
          </div>
        </div>

        <div id="stat-card-chapters" className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex items-center space-x-4 shadow">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-mono">Chapters Explored</p>
            <h3 className="text-2xl font-bold font-mono text-white mt-0.5">
              {profile?.completedTopics?.length || 0} <span className="text-xs text-slate-400">Done</span>
            </h3>
          </div>
        </div>

        <div id="stat-card-quizzes" className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex items-center space-x-4 shadow">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-mono">Tests Decimated</p>
            <h3 className="text-2xl font-bold font-mono text-white mt-0.5">{quizHistory.length} <span className="text-xs text-slate-400">Quiz</span></h3>
          </div>
        </div>
      </div>

      {/* Mastery Analytics & Submissions split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Radar Mastery Diagnostic */}
        <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight mb-1 flex items-center text-white">
              <BrainCircuit className="h-5 w-5 mr-2 text-indigo-400" /> Technology Mastery
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Real-time skills breakdown calculated by averaging testing performance metrics.
            </p>
          </div>

          <div className="h-64 flex items-center justify-center">
            {quizHistory.length === 0 ? (
              <div className="text-center text-slate-500 mt-4 px-4 py-8 bg-slate-800/20 rounded-2xl border border-slate-800 w-full">
                <HelpCircle className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-mono">No mastery data generated yet.</p>
                <button 
                  onClick={() => setActiveTab('learn')}
                  className="text-xs text-indigo-400 hover:underline mt-1 focus:outline-none"
                >
                  Take your first Lesson quiz &rarr;
                </button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillMastery}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} 
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b' }} />
                  <Radar 
                    name="Mastery %" 
                    dataKey="A" 
                    stroke="#6366f1" 
                    fill="#4f46e5" 
                    fillOpacity={0.4} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent quiz history submissions */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-lg font-bold tracking-tight flex items-center text-white">
                <Calendar className="h-5 w-5 mr-2 text-emerald-400" /> Performance History
              </h2>
              <span className="text-[10px] font-mono bg-slate-800 hover:bg-slate-700 cursor-pointer text-slate-300 px-2 py-1 rounded-md transition" onClick={() => setActiveTab('learn')}>
                Solve Practice
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Your recent interactive diagnostic grades securely logged in Firestore database.
            </p>
          </div>

          <div className="flex-grow overflow-y-auto max-h-[220px] space-y-2.5 pr-1">
            {recentQuizzes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20 text-slate-500">
                <p className="text-sm">Quiz activity registry is blank</p>
                <p className="text-xs mt-1">Practice concepts under Learning Paths to unlock progress levels.</p>
              </div>
            ) : (
              recentQuizzes.map((sub, idx) => {
                const perc = Math.round((sub.correctAnswers / sub.totalQuestions) * 100);
                const isExcellent = perc >= 80;
                const isPassing = perc >= 50;

                return (
                  <div 
                    key={sub.submissionId || idx}
                    className="flex justify-between items-center bg-slate-800/40 border border-slate-700/30 px-4 py-3 rounded-xl hover:border-indigo-500/20 transition-all"
                  >
                    <div>
                      <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">{sub.domainId}</div>
                      <div className="text-sm font-bold text-white mt-0.5 capitalize">{sub.topicId?.replace('-', ' ')}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{new Date(sub.completedAt).toLocaleDateString()} at {new Date(sub.completedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-mono font-bold ${
                        isExcellent ? 'text-emerald-400' : isPassing ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {sub.correctAnswers} / {sub.totalQuestions} ({perc}%)
                      </div>
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 uppercase ${
                        isExcellent ? 'bg-emerald-500/10 text-emerald-400' : isPassing ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {isExcellent ? 'Mastery' : isPassing ? 'Passing' : 'Revise'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Saved CS Cheat-Sheets accordion section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-md">
        <h2 className="text-lg font-bold tracking-tight mb-1 flex items-center text-white">
          <BookMarked className="h-5 w-5 mr-2 text-cyan-400" /> Saved CS Notes & AI Cheat Sheets
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Review personalized lessons and custom concept breakdowns you saved from AI interactions.
        </p>

        {savedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20 text-slate-500">
            <FileText className="h-8 w-8 text-slate-600 mb-2" />
            <p className="text-sm">Your personal notes vault is empty</p>
            <p className="text-xs mt-1 text-slate-600 font-mono">Ask ByteTutor inside the AI Playground to generate and save notes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Notes list left */}
            <div className="md:col-span-1 space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {savedNotes.map(note => (
                <div
                  key={note.noteId}
                  onClick={() => setSelectedNote(note)}
                  className={`p-4 rounded-xl text-left border cursor-pointer transition-all duration-300 ${
                    selectedNote?.noteId === note.noteId
                      ? 'bg-indigo-950/20 border-indigo-500 text-indigo-200'
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800/80 hover:border-slate-600'
                  }`}
                >
                  <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">{note.concept}</p>
                  <h4 className="text-sm font-bold mt-0.5 line-clamp-1">{note.title}</h4>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-700/20 text-[10px] text-slate-500 font-mono">
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure you want to delete this custom note?")) {
                          onDeleteNote(note.noteId);
                          if (selectedNote?.noteId === note.noteId) {
                            setSelectedNote(null);
                          }
                        }
                      }}
                      className="text-red-500 hover:text-red-400 p-1"
                      title="Delete saved note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Note details right */}
            <div className="md:col-span-2 bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5 max-h-[355px] overflow-y-auto min-h-[220px] flex flex-col">
              {selectedNote ? (
                <div>
                  <div className="border-b border-slate-800 pb-3 mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">{selectedNote.concept}</span>
                        <h3 className="text-lg font-bold text-white mt-1">{selectedNote.title}</h3>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
                        Saved {new Date(selectedNote.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                    {selectedNote.explanation}
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <BookMarked className="h-10 w-10 text-slate-700 mb-2" />
                  <p className="text-sm">Select a Cheat-Sheet</p>
                  <p className="text-xs mt-1">Interact with your curated computer science references.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
