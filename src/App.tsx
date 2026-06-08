import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot, 
  serverTimestamp,
  arrayUnion,
  query,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  logoutUser, 
  testConnection, 
  handleFirestoreError, 
  OperationType 
} from './db/firebase';
import { UserProfile, QuizSubmission, SavedNote } from './types';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CurriculumView from './components/CurriculumView';
import AIPlayground from './components/AIPlayground';
import CodingArena from './components/CodingArena';
import FloatingBot from './components/FloatingBot';
import PWStudyBatches from './components/PWStudyBatches';
import { 
  Sparkles, 
  BookOpen, 
  LayoutDashboard, 
  Code, 
  Terminal, 
  ChevronRight, 
  ArrowRight,
  Shield,
  Clock,
  LogOut,
  Settings,
  CheckCircle2,
  AlertCircle,
  X,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizSubmission[]>([]);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'learn' | 'playground' | 'challenges' | 'dashboard' | 'batches'>('learn');
  const [hasExplored, setHasExplored] = useState<boolean>(false);

  // Modern state-based Toast Notifications
  interface Toast {
    id: string;
    message: string;
    type: 'success' | 'info' | 'error' | 'warning';
  }
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Register modern global notification capability
  useEffect(() => {
    window.showNotification = (message: string, type: Toast['type'] = 'info') => {
      addToast(message, type);
    };
    return () => {
      delete window.showNotification;
    };
  }, []);

  // Trigger test connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  // Monitor Firebase Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Sync User Profile
        await syncUserProfile(currentUser);
      } else {
        setProfile(null);
        setQuizHistory([]);
        setSavedNotes([]);
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Monitor subcollections in real-time if authenticated
  useEffect(() => {
    if (!user) return;

    // Snapshot sync for Quiz Submissions
    const subPath = `users/${user.uid}/quizSubmissions`;
    const subRef = collection(db, 'users', user.uid, 'quizSubmissions');
    const qSub = query(subRef, orderBy('completedAt', 'desc'));
    
    const unsubscribeSubmissions = onSnapshot(qSub, (snapshot) => {
      const history: QuizSubmission[] = [];
      snapshot.forEach((doc) => {
        history.push(doc.data() as QuizSubmission);
      });
      setQuizHistory(history);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, subPath);
    });

    // Snapshot sync for Saved Notes
    const notesPath = `users/${user.uid}/savedNotes`;
    const notesRef = collection(db, 'users', user.uid, 'savedNotes');
    const qNotes = query(notesRef, orderBy('createdAt', 'desc'));

    const unsubscribeNotes = onSnapshot(qNotes, (snapshot) => {
      const notes: SavedNote[] = [];
      snapshot.forEach((doc) => {
        notes.push(doc.data() as SavedNote);
      });
      setSavedNotes(notes);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, notesPath);
    });

    return () => {
      unsubscribeSubmissions();
      unsubscribeNotes();
    };
  }, [user]);

  // Sync profile document
  const syncUserProfile = async (currentUser: User) => {
    const profilePath = `users/${currentUser.uid}`;
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Create baseline initial profile on first ever login
        const baselineProfile: UserProfile = {
          userId: currentUser.uid,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'New Scholar',
          email: currentUser.email || '',
          photoURL: currentUser.photoURL || '',
          xp: 150, // Welcome gift XP!
          streak: 1,
          level: 1,
          completedTopics: [],
          createdAt: new Date().toISOString(),
        };

        await setDoc(docRef, baselineProfile);
        setProfile(baselineProfile);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, profilePath);
    } finally {
      setAuthLoading(false);
    }
  };

  // Add Experience Points (XP) Gamification controller
  const handleAddXP = async (amount: number) => {
    if (!user || !profile) return;
    const profilePath = `users/${user.uid}`;
    
    try {
      const docRef = doc(db, 'users', user.uid);
      const newXP = profile.xp + amount;
      
      // Level progression calculator (Every 1000 XP increases their level!)
      const newLevel = Math.floor(newXP / 1000) + 1;
      const leveledUp = newLevel > profile.level;

      const updates: Partial<UserProfile> = {
        xp: newXP,
        level: newLevel,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(docRef, updates);
      
      setProfile(prev => prev ? {
        ...prev,
        xp: newXP,
        level: newLevel,
        updatedAt: updates.updatedAt
      } : null);

      if (leveledUp) {
        addToast(`🎉 CONGRATULATIONS! You leveled up to Level ${newLevel}! Keep coding!`, 'success');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, profilePath);
    }
  };

  // Complete Topic callback
  const handleCompleteTopic = async (topicId: string) => {
    if (!user || !profile) return;
    const profilePath = `users/${user.uid}`;

    try {
      if (profile.completedTopics?.includes(topicId)) return;

      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        completedTopics: arrayUnion(topicId),
        updatedAt: new Date().toISOString(),
      });

      setProfile(prev => prev ? {
        ...prev,
        completedTopics: prev.completedTopics ? [...prev.completedTopics, topicId] : [topicId]
      } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, profilePath);
    }
  };

  // Save Quiz Submission Callback
  const handleSaveQuizSubmission = async (
    domainId: string,
    topicId: string,
    score: number,
    total: number,
    correct: number
  ) => {
    if (!user) return;
    const submissionId = `sub-${Date.now()}`;
    const subRoute = `users/${user.uid}/quizSubmissions/${submissionId}`;

    try {
      const docRef = doc(db, 'users', user.uid, 'quizSubmissions', submissionId);
      const submission: QuizSubmission = {
        submissionId,
        userId: user.uid,
        domainId,
        topicId,
        score,
        totalQuestions: total,
        correctAnswers: correct,
        completedAt: new Date().toISOString(),
      };

      await setDoc(docRef, submission);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, subRoute);
    }
  };

  // Save Custom Note Callback
  const handleSaveCustomNote = async (title: string, concept: string, explanation: string) => {
    if (!user) return;
    const noteId = `note-${Date.now()}`;
    const noteRoute = `users/${user.uid}/savedNotes/${noteId}`;

    try {
      const docRef = doc(db, 'users', user.uid, 'savedNotes', noteId);
      const note: SavedNote = {
        noteId,
        userId: user.uid,
        title,
        concept,
        explanation,
        createdAt: new Date().toISOString(),
      };

      await setDoc(docRef, note);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, noteRoute);
    }
  };

  // Delete Custom Note Callback
  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    const noteRoute = `users/${user.uid}/savedNotes/${noteId}`;

    try {
      const docRef = doc(db, 'users', user.uid, 'savedNotes', noteId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, noteRoute);
    }
  };

  // User Authentication wrappers
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      addToast("Registration failed. Please close modal and try again.", 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setActiveTab('learn');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans tracking-tight leading-normal overflow-x-hidden">
      {/* Background radial effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent pointer-events-none" />

      {/* Navigation Bar */}
      <Navbar
        user={user}
        profile={profile}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setHasExplored(true);
          setActiveTab(tab);
        }}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
      />

      {/* Content state views */}
      {authLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[450px] py-24 text-slate-600">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-4" />
          <p className="font-mono text-sm tracking-widest animate-pulse">BOOTING BYTECRAFT PLATFORM ENGINE...</p>
        </div>
      ) : (user || hasExplored) ? (
        <main className="relative z-10 transition-all duration-300">
          {activeTab === 'learn' && (
            <CurriculumView
              onAddXP={async (amount) => {
                if (!user) {
                  addToast("Please click 'Get Started' to sign in, save progress, and earn XP points!", 'warning');
                  return;
                }
                handleAddXP(amount);
              }}
              onCompleteTopic={async (topicId) => {
                if (!user) return;
                handleCompleteTopic(topicId);
              }}
              onSaveQuizSubmission={async (domainId, topicId, score, total, correct) => {
                if (!user) return;
                handleSaveQuizSubmission(domainId, topicId, score, total, correct);
              }}
              onSaveCustomNote={async (title, concept, explanation) => {
                if (!user) {
                  addToast("Please sign in with Google to save notes to your personal library!", 'warning');
                  return;
                }
                handleSaveCustomNote(title, concept, explanation);
              }}
              completedTopics={profile?.completedTopics || []}
            />
          )}

          {activeTab === 'batches' && (
            <PWStudyBatches
              user={user}
              profile={profile}
              onAddXP={handleAddXP}
              onSyncProfile={async () => {
                if (user) await syncUserProfile(user);
              }}
            />
          )}

          {activeTab === 'challenges' && (
            <CodingArena
              user={user}
              profile={profile}
              onAddXP={handleAddXP}
              onSyncProfile={async () => {
                if (user) await syncUserProfile(user);
              }}
            />
          )}

          {activeTab === 'playground' && (
            user ? (
              <AIPlayground
                onSaveCustomNote={handleSaveCustomNote}
                savedNotes={savedNotes}
              />
            ) : (
              <div className="max-w-md mx-auto my-16 bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center shadow-xl">
                <Sparkles className="h-10 w-10 text-cyan-400 mx-auto mb-4 animate-pulse" />
                <h3 className="text-base font-bold text-white mb-2">Student Session Required</h3>
                <p className="text-slate-400 text-xs mb-6">
                  Interactive AI Tutor Playgrounds use persistent secure session tokens. Unlock direct sandbox access by logging in.
                </p>
                <button
                  onClick={handleGoogleLogin}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition duration-300 cursor-pointer"
                >
                  Sign In with Google
                </button>
              </div>
            )
          )}

          {activeTab === 'dashboard' && (
            user ? (
              <Dashboard
                profile={profile}
                quizHistory={quizHistory}
                savedNotes={savedNotes}
                onDeleteNote={handleDeleteNote}
                setActiveTab={setActiveTab}
              />
            ) : (
              <div className="max-w-md mx-auto my-16 bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center shadow-xl">
                <LayoutDashboard className="h-10 w-10 text-purple-400 mx-auto mb-4 animate-pulse" />
                <h3 className="text-base font-bold text-white mb-2">Student Dashboard Locked</h3>
                <p className="text-slate-400 text-xs mb-6">
                  Progression logs, activity matrices, streak details, and saved cheat-sheets are synchronized on the cloud. Sign in to review your dashboard.
                </p>
                <button
                  onClick={handleGoogleLogin}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition duration-300 cursor-pointer"
                >
                  Sign In with Google
                </button>
              </div>
            )
          )}
        </main>
      ) : (
        /* Guest Landing Section - High-Fidelity Call-To-Action */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-20 blur" />
            <span className="relative inline-flex items-center space-x-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 text-[10px] font-mono font-bold tracking-widest text-indigo-600 uppercase">
              <Sparkles className="h-3 w-3" /> Fully Scalable EdTech Persistent Platform
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-sans font-bold text-slate-950 tracking-tight leading-none max-w-4xl mx-auto">
            Interactive Computer Science <br />
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 bg-clip-text text-transparent">
              Training Redefined
            </span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
            Gain mastery in complex CS concepts from low-level memory parameters to advanced artificial intelligence models. Solve topic-wise quizzes and training questions with quick AI response feedback.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              Start Free Learning Academy
            </button>
            <button
              onClick={() => {
                setHasExplored(true);
                setActiveTab('learn');
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-50 border border-slate-250 hover:bg-slate-100 text-slate-700 font-bold text-sm transition cursor-pointer"
            >
              Browse Curriculum Content
            </button>
          </div>

          {/* Core Feature Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
            <div className="bg-slate-50/80 border border-slate-200 p-6 rounded-3xl text-left shadow-sm">
              <div className="h-10 w-10 bg-indigo-50/80 text-indigo-600 rounded-xl flex items-center justify-center mb-4 border border-indigo-100">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Full-Stack Curriculum</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                Step-by-step rigorous guides explaining execution stacks, graphs, ACID relational models, rest statelessness, and generative self-attention layers.
              </p>
            </div>

            <div className="bg-slate-50/80 border border-slate-200 p-6 rounded-3xl text-left shadow-sm">
              <div className="h-10 w-10 bg-cyan-50/80 text-cyan-600 rounded-xl flex items-center justify-center mb-4 border border-cyan-100">
                <Terminal className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Interactive CS Quizzes</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                Solve diagnostic quizzes and infinite custom practice questions generated dynamically for precise concept learning, receiving quick explanations.
              </p>
            </div>

            <div className="bg-slate-50/80 border border-slate-200 p-6 rounded-3xl text-left shadow-sm">
              <div className="h-10 w-10 bg-purple-50/80 text-purple-600 rounded-xl flex items-center justify-center mb-4 border border-purple-100">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Real-Time Progression Board</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                Track points, streak levels, study stats, and your technology mastery on the cloud. Save AI responses directly as custom review cheat-sheets.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Real-time Toast Notification Overlay */}
      <div className="fixed top-24 right-6 z-100 flex flex-col space-y-3 pointer-events-none max-w-sm w-full font-sans">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              className="pointer-events-auto w-full bg-white border border-slate-250 rounded-2xl shadow-xl flex items-start gap-3 p-4 overflow-hidden relative"
              style={{
                borderLeftWidth: '5px',
                borderLeftColor: 
                  t.type === 'success' ? '#10b981' : 
                  t.type === 'error' ? '#ef4444' : 
                  t.type === 'warning' ? '#f59e0b' : '#3b82f6'
              }}
            >
              <div className="shrink-0 mt-0.5">
                {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                {t.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                {t.type === 'warning' && <AlertCircle className="h-5 w-5 text-amber-500" />}
                {t.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-xs font-semibold text-slate-800 break-words leading-relaxed select-none">{t.message}</p>
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
                className="absolute right-3 top-3 p-0.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Global AI Assistant Floating Companion */}
      <FloatingBot />
    </div>
  );
}
