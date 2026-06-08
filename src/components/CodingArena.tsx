import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Terminal, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Flame, 
  Search, 
  ChevronLeft, 
  HelpCircle, 
  Loader2, 
  Sparkles, 
  BookOpen, 
  MessageSquare, 
  RefreshCw,
  Cpu,
  BookMarked
} from 'lucide-react';
import { challenges } from '../data/challenges';
import { ChallengeProblem, ChallengeSubmission, UserProfile } from '../types';
import { doc, setDoc, collection, addDoc, getDocs, query, orderBy, where, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../db/firebase';
import { User } from 'firebase/auth';

interface CodingArenaProps {
  user: User | null;
  profile: UserProfile | null;
  onAddXP: (amount: number) => void;
  onSyncProfile: () => void;
}

export default function CodingArena({ user, profile, onAddXP, onSyncProfile }: CodingArenaProps) {
  // Navigation & Problems selection
  const [selectedProblem, setSelectedProblem] = useState<ChallengeProblem | null>(null);
  
  // Lists filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // IDE Workspace states
  const [language, setLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>('');
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'ai-tutor' | 'submissions'>('description');
  
  // Local runner states
  const [localResults, setLocalResults] = useState<any[] | null>(null);
  const [localCompileError, setLocalCompileError] = useState<string | null>(null);
  const [isRunningLocal, setIsRunningLocal] = useState(false);

  // AI evaluation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiGrade, setAiGrade] = useState<{
    passed: boolean;
    score: number;
    complexity: string;
    feedback: string;
    suggestions: string[];
  } | null>(null);

  // AI Hint state
  const [isRequestingHint, setIsRequestingHint] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);

  // Submissions history for current problem
  const [problemSubmissions, setProblemSubmissions] = useState<ChallengeSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Extract category and difficulty structures for filters
  const categories = ['All', ...Array.from(new Set(challenges.map(c => c.category)))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  // Initialize selected problem's starter template
  useEffect(() => {
    if (selectedProblem) {
      setCode(selectedProblem.starterTemplates[language] || selectedProblem.starterTemplates['javascript'] || '');
      setLocalResults(null);
      setLocalCompileError(null);
      setAiGrade(null);
      setAiHint(null);
      setActiveLeftTab('description');
      
      // Fetch submissions for this problem
      if (user) {
        fetchProblemSubmissions(selectedProblem.id);
      }
    }
  }, [selectedProblem, language]);

  // Fetch past submissions from firestore
  const fetchProblemSubmissions = async (problemId: string) => {
    if (!user) return;
    setLoadingSubmissions(true);
    const subRoute = `users/${user.uid}/challengeSubmissions`;
    try {
      const submissionsRef = collection(db, 'users', user.uid, 'challengeSubmissions');
      const q = query(
        submissionsRef, 
        where('challengeId', '==', problemId),
        orderBy('completedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const fetched: ChallengeSubmission[] = [];
      querySnapshot.forEach((doc) => {
        fetched.push(doc.data() as ChallengeSubmission);
      });
      setProblemSubmissions(fetched);
    } catch (e) {
      // If collection doesn't exist yet, it is completely safe to ignore or set empty
      console.warn("Could not load submissions. Might be unseeded yet:", e);
      setProblemSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Helper for deep equity checks in JavaScript test cases
  const isDeepEqual = (a: any, b: any): boolean => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      // Many array challenges return coordinates in arbitrary order (like Two Sum indices)
      const sortedA = [...a].sort((x, y) => (typeof x === 'number' ? x - y : String(x).localeCompare(String(y))));
      const sortedB = [...b].sort((x, y) => (typeof x === 'number' ? x - y : String(x).localeCompare(String(y))));
      for (let i = 0; i < sortedA.length; i++) {
        if (!isDeepEqual(sortedA[i], sortedB[i])) return false;
      }
      return true;
    }
    
    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (const key of keysA) {
        if (!keysB.includes(key) || !isDeepEqual(a[key], b[key])) return false;
      }
      return true;
    }
    return false;
  };

  // Local execution of JavaScript code inside a browser sandbox
  const handleRunLocalTests = () => {
    if (!selectedProblem) return;
    setIsRunningLocal(true);
    setLocalCompileError(null);
    setLocalResults(null);

    // Give a short delay to simulate real execution and visual rhythm
    setTimeout(() => {
      try {
        const fnName = selectedProblem.fnName;
        // Sandbox code creation with target logic verification
        const evalScript = `
          ${code}
          if (typeof ${fnName} !== 'function') {
            throw new Error("Target function '${fnName}' not found. Please do not modify the function name in the template.");
          }
          return ${fnName};
        `;

        // Safely instantiate user function
        const userFn = new Function(evalScript)();

        // Run cases
        const results = selectedProblem.testCases.map((tc) => {
          try {
            // High fidelity deep copy of input to prevent user code mutation side-effects
            const inputsCopy = JSON.parse(JSON.stringify(tc.inputs));
            const start = performance.now();
            const actualOutput = userFn(...inputsCopy);
            const duration = (performance.now() - start).toFixed(3);

            const passed = isDeepEqual(actualOutput, tc.expected);
            return {
              id: tc.id,
              inputDisplay: tc.inputDisplay,
              expectedDisplay: tc.expectedDisplay,
              actualOutput,
              actualDisplay: JSON.stringify(actualOutput),
              passed,
              duration,
              error: null
            };
          } catch (rErr: any) {
            return {
              id: tc.id,
              inputDisplay: tc.inputDisplay,
              expectedDisplay: tc.expectedDisplay,
              actualOutput: null,
              actualDisplay: 'CRASH',
              passed: false,
              duration: '0.000',
              error: rErr.message || String(rErr)
            };
          }
        });

        setLocalResults(results);
      } catch (err: any) {
        setLocalCompileError(err.message || String(err));
      } finally {
        setIsRunningLocal(false);
      }
    }, 600);
  };

  // Submit and Let the AI Judge Evaluate
  const handleSubmitSolution = async () => {
    if (!selectedProblem || !user) return;
    setIsSubmitting(true);
    setAiGrade(null);

    // Step 1: Run local tests if javascript, to compile local verification score
    let localPassPercent = 100;
    let localPassedAll = true;

    if (language === 'javascript') {
      try {
        const fnName = selectedProblem.fnName;
        const evalScript = `
          ${code}
          return ${fnName};
        `;
        const userFn = new Function(evalScript)();
        
        let passedCount = 0;
        selectedProblem.testCases.forEach((tc) => {
          try {
            const result = userFn(...JSON.parse(JSON.stringify(tc.inputs)));
            if (isDeepEqual(result, tc.expected)) {
              passedCount++;
            }
          } catch (e) {}
        });

        localPassedAll = passedCount === selectedProblem.testCases.length;
        localPassPercent = Math.round((passedCount / selectedProblem.testCases.length) * 100);
      } catch (e) {
        localPassedAll = false;
        localPassPercent = 0;
      }
    }

    // Step 2: Query our backend Gemini AI grader for professional code analysis
    try {
      const response = await fetch('/api/ai/grade-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          problemTitle: selectedProblem.title,
          description: selectedProblem.description,
          difficulty: selectedProblem.difficulty
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "AI platform failed to respond.");
      }

      const report = await response.json();
      setAiGrade(report);

      // Save submission record in Firestore
      const submissionId = `sub-${Date.now()}`;
      const subRoute = `users/${user.uid}/challengeSubmissions/${submissionId}`;
      const submissionsRef = doc(db, 'users', user.uid, 'challengeSubmissions', submissionId);

      const submission: ChallengeSubmission = {
        submissionId,
        userId: user.uid,
        challengeId: selectedProblem.id,
        challengeTitle: selectedProblem.title,
        difficulty: selectedProblem.difficulty,
        language,
        code,
        passed: report.passed && localPassedAll,
        score: report.score || localPassPercent,
        aiFeedback: report.feedback,
        completedAt: new Date().toISOString()
      };

      await setDoc(submissionsRef, submission);
      
      // Update problem submissions list locally
      setProblemSubmissions(prev => [submission, ...prev]);

      // If they passed both local validations & AI logical specifications, reward them!
      const isAlreadySolved = profile?.completedChallenges?.includes(selectedProblem.id);
      if (submission.passed && !isAlreadySolved) {
        // Gain XP points!
        const xpAmount = selectedProblem.xpReward;
        onAddXP(xpAmount);

        // Update solved array in Profile
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          completedChallenges: arrayUnion(selectedProblem.id),
          updatedAt: new Date().toISOString()
        });

        // Trigger parent state reload
        onSyncProfile();
      }

      // Switch view panel to submissions to review report
      setActiveLeftTab('submissions');

    } catch (e: any) {
      window.showNotification?.("AI Judging currently unavailable: " + e.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Request Hint from AI
  const handleGetHint = async () => {
    if (!selectedProblem) return;
    setIsRequestingHint(true);
    setAiHint(null);

    // Call chatbot endpoint seeking quick tips
    try {
      const prompt = `You are a LeetCode coach. Give me a brief, wise algorithmic hint for solving the challenge: "${selectedProblem.title}" (${selectedProblem.difficulty}). 
The user is coding in: ${language}.
Provide:
1. High-level concept description (one sentence)
2. Pseudocode or step-by-step logic direction (no actual code answers, do not solve it completely)
3. One potential edge case to track.`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: prompt })
      });

      const data = await response.json();
      setAiHint(data.reply || "Analyze pointers or sorting inputs as a starting checkpoint.");
      setActiveLeftTab('ai-tutor');
    } catch (e) {
      setAiHint("Think about space-time tradeoffs: Can you use a hash map to look up items in O(1) time rather than O(N)?");
    } finally {
      setIsRequestingHint(false);
    }
  };

  // Reset starting template code
  const handleResetTemplate = () => {
    if (selectedProblem && window.confirm("Reset the code editor? All changes made will be cleared.")) {
      setCode(selectedProblem.starterTemplates[language] || selectedProblem.starterTemplates['javascript'] || '');
      setLocalResults(null);
      setLocalCompileError(null);
      setAiGrade(null);
    }
  };

  // Filter calculations
  const filteredProblems = challenges.filter(prob => {
    const matchesSearch = prob.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prob.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'All' || prob.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === 'All' || prob.category === selectedCategory;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  // Calculate percentages and statistics
  const totalCompleted = profile?.completedChallenges?.length || 0;
  const totalProblems = challenges.length;
  const completionPercentage = Math.round((totalCompleted / totalProblems) * 100) || 0;

  // Render index dashboard list
  if (!selectedProblem) {
    return (
      <div id="coding-arena-index" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Arena Statistics Header bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Problems solved */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            <div>
              <span className="block text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">COMPLETED CHALLENGES</span>
              <h3 className="text-3xl font-bold text-white mt-1">
                {totalCompleted} <span className="text-slate-500 text-lg">/ {totalProblems}</span>
              </h3>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono font-bold">{completionPercentage}% solved</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20">
              <Code2 className="h-6 w-6" />
            </div>
          </div>

          {/* Card 2: Arena points */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <div>
              <span className="block text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">ARENA STANDING</span>
              <h3 className="text-3xl font-bold text-white mt-1">
                {totalCompleted * 100} <span className="text-slate-500 text-xs font-mono">XP GAINED</span>
              </h3>
              <p className="text-xs text-slate-400 mt-2.5">
                Each completed challenge rewards +100XP to +150XP.
              </p>
            </div>
            <div className="h-12 w-12 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center border border-cyan-500/20">
              <Award className="h-6 w-6" />
            </div>
          </div>

          {/* Card 3: Arena badge */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
            <div>
              <span className="block text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">HIGHEST ARENA RANK</span>
              <h3 className="text-xl font-bold text-white mt-2 font-sans">
                {totalCompleted === 0 ? "Algorithmic Initiate" :
                 totalCompleted <= 2 ? "Recursion Ranger" :
                 totalCompleted <= 4 ? "Data Structure Master" : "Master Compiler Grader"}
              </h3>
              <div className="flex items-center space-x-1 mt-1 text-orange-400">
                <Flame className="h-4 w-4 fill-orange-500/20" />
                <span className="text-[10px] font-mono font-bold uppercase">Rank unlocked ({totalCompleted} badges)</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center border border-purple-500/20">
              <Cpu className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Page Title & description */}
        <div className="mb-8">
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
              Interactive Lab
            </span>
            <span className="text-slate-500 font-mono text-xs">•</span>
            <span className="text-slate-400 font-mono text-xs">Self-paced programming suite</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Coding Arena Workspace</h2>
          <p className="text-slate-400 text-sm mt-1">
            Review algorithmic problems, construct optimized logical architectures, and run code submissions against verification tests simulated in real-time.
          </p>
        </div>

        {/* Search, Filter, and Selection tools */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 bg-slate-900/60 p-4 border border-slate-800/80 rounded-2xl">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search problems or modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2 rounded-xl text-xs text-white placeholder-slate-500 hover:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Category filter */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-white px-3 py-1.5 rounded-xl hover:border-slate-700 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Difficulty filter */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400">Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-white px-3 py-1.5 rounded-xl hover:border-slate-700 focus:outline-none"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Challenges table listing */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4 text-center">Reward Points</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-mono">
                      No matching challenges found. Try updating your filters or search keywords.
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((prob) => {
                    const isSolved = profile?.completedChallenges?.includes(prob.id);
                    return (
                      <tr 
                        key={prob.id} 
                        className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                        onClick={() => setSelectedProblem(prob)}
                      >
                        {/* Solved Status badge item link */}
                        <td className="px-6 py-4">
                          {isSolved ? (
                            <div className="flex items-center text-green-400 font-mono font-bold text-[10px] space-x-1 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full w-fit">
                              <CheckCircle2 className="h-3.5 w-3.5 fill-green-500/10" />
                              <span>SOLVED</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-slate-400 font-mono text-[10px] space-x-1 bg-slate-800/80 border border-slate-700/50 px-2.5 py-0.5 rounded-full w-fit">
                              <div className="h-1.5 w-1.5 bg-slate-500 rounded-full" />
                              <span>UNSOLVED</span>
                            </div>
                          )}
                        </td>

                        {/* Title */}
                        <td className="px-6 py-4 font-semibold text-white">
                          <span className="hover:text-indigo-400 transition-colors text-sm">{prob.title}</span>
                          <span className="block text-[10px] text-slate-500 font-mono font-normal mt-0.5">fn: {prob.fnName}()</span>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4 font-mono text-slate-400">
                          {prob.category}
                        </td>

                        {/* Difficulty */}
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-0.5 border text-[10px] font-mono font-bold rounded-lg ${
                            prob.difficulty === 'Easy' 
                              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}>
                            {prob.difficulty}
                          </span>
                        </td>

                        {/* XP Reward */}
                        <td className="px-6 py-4 text-center text-indigo-400 font-mono font-bold">
                          +{prob.xpReward} XP
                        </td>

                        {/* Actions buttons */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProblem(prob);
                            }}
                            className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-1.5 rounded-xl transition duration-300 shadow-md shadow-indigo-600/10 text-xs"
                          >
                            <span>Code Now</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Render actual IDE workbench workspace
  const isProblemSolved = profile?.completedChallenges?.includes(selectedProblem.id);

  return (
    <div id="coding-arena-workspace" className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-[calc(100vh-4rem)] animate-fade-in text-white">
      {/* Workspace Sub-header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-4">
        {/* Left Side: Back button, Title & difficulty */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSelectedProblem(null)}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-indigo-400 transition"
            title="Return to Challenges"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-100">{selectedProblem.title}</h2>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border ${
                selectedProblem.difficulty === 'Easy' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-300' 
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
              }`}>
                {selectedProblem.difficulty}
              </span>
              {isProblemSolved && (
                <span className="bg-green-900/40 text-green-400 border border-green-800 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold flex items-center">
                  ✓ COMPLETED
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono mt-0.5">
              <span>{selectedProblem.category}</span>
              <span>•</span>
              <span className="text-indigo-400 font-bold">+{selectedProblem.xpReward} XP Reward</span>
            </div>
          </div>
        </div>

        {/* Right side controls: languages Selector, reset and hint actions */}
        <div className="flex items-center space-x-2 lg:space-x-3 w-full sm:w-auto justify-end">
          {/* Language selector */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl">
            <span className="text-[10px] text-slate-500 font-mono uppercase">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none px-2 rounded hover:border-slate-700"
            >
              <option value="javascript">JavaScript (Local compiler)</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>

          <button
            onClick={handleGetHint}
            disabled={isRequestingHint}
            className="flex items-center space-x-1 bg-cyan-700/20 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-600/30 font-bold text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer"
          >
            {isRequestingHint ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            )}
            <span className="hidden lg:inline">Get Hint</span>
          </button>

          <button
            onClick={handleResetTemplate}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition"
            title="Reset to default starter template"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main split work bench code editor row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-start">
        {/* Left column: Problem Details / Submissions pane (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[650px] overflow-hidden shadow-lg">
          {/* Tabs header */}
          <div className="flex border-b border-slate-800 bg-slate-950 text-xs font-mono">
            <button
              onClick={() => setActiveLeftTab('description')}
              className={`flex-1 text-center py-3.5 font-bold border-b-2 hover:bg-slate-900 transition ${
                activeLeftTab === 'description' 
                  ? 'border-indigo-500 text-indigo-400 bg-slate-900/60' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveLeftTab('ai-tutor')}
              className={`flex-1 text-center py-3.5 font-bold border-b-2 hover:bg-slate-900 transition flex items-center justify-center space-x-1 ${
                activeLeftTab === 'ai-tutor' 
                  ? 'border-cyan-500 text-cyan-400 bg-slate-900/60' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>AI Tutor Hint</span>
            </button>
            <button
              onClick={() => setActiveLeftTab('submissions')}
              className={`flex-1 text-center py-3.5 font-bold border-b-2 hover:bg-slate-900 transition flex items-center justify-center space-x-1 ${
                activeLeftTab === 'submissions' 
                  ? 'border-purple-500 text-purple-400 bg-slate-900/60' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>My Submissions</span>
              {problemSubmissions.length > 0 && (
                <span className="bg-purple-950/60 text-purple-400 border border-purple-800/80 rounded-full h-4 min-w-4 text-[9px] px-1 flex items-center justify-center font-bold">
                  {problemSubmissions.length}
                </span>
              )}
            </button>
          </div>

          {/* Left panel body scroll zone */}
          <div className="flex-1 p-5 overflow-y-auto custom-scrollbar text-sm leading-relaxed text-slate-300">
            {activeLeftTab === 'description' && (
              <div className="space-y-5 animate-fade-in">
                {/* Text explanation */}
                <div className="prose prose-invert max-w-none text-slate-300 text-xs">
                  {selectedProblem.description.split('\n\n').map((para, i) => (
                    <p key={i} className="mb-3 leading-relaxed">{para}</p>
                  ))}
                </div>

                {/* Example test cases representation */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">EXAMPLES</h4>
                  {selectedProblem.testCases.map((tc, idx) => (
                    <div key={idx} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 font-mono text-[11px] space-y-1.5">
                      <div className="text-slate-400">Example {idx + 1}:</div>
                      <div>
                        <span className="text-slate-500">Input:</span>{' '}
                        <span className="text-slate-200">{tc.inputDisplay}</span>
                      </div>
                      <div>
                        <span className="text-indigo-400">Expected:</span>{' '}
                        <span className="text-indigo-300 font-bold">{tc.expectedDisplay}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Constraints bullets */}
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <h4 className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">CONSTRAINTS & MEMORY PARAMETERS</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono text-[11px]">
                    {selectedProblem.constraints.map((constraint, i) => (
                      <li key={i}>{constraint}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeLeftTab === 'ai-tutor' && (
              <div className="space-y-4 animate-fade-in text-xs">
                {aiHint ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-cyan-400 font-mono font-bold tracking-tight">
                      <Sparkles className="h-4 w-4" />
                      <span>COACHING STRATEGY BOARD</span>
                    </div>
                    {/* Render hint chunks nicely */}
                    <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl prose prose-invert font-sans text-slate-300 max-w-none leading-relaxed whitespace-pre-wrap">
                      {aiHint}
                    </div>
                    <div className="p-3 bg-slate-950/20 border border-slate-850/60 text-slate-400 rounded-lg flex items-start space-x-2">
                      <HelpCircle className="h-4 w-4 text-cyan-500/80 shrink-0 mt-0.5" />
                      <span>Ready to write the logic? Try applying the above concept mapping directly into the editor on the right.</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-10 w-10 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center mb-4">
                      <HelpCircle className="h-5 w-5 animate-pulse" />
                    </div>
                    <p className="font-semibold text-slate-200 text-sm">Need a pointer?</p>
                    <p className="text-slate-400 max-w-xs mt-1 text-xs">
                      Our dynamic AI tutor scans the problem context and provides conceptual architectural pseudocode hints without writing the exact code for you.
                    </p>
                    <button
                      onClick={handleGetHint}
                      disabled={isRequestingHint}
                      className="mt-4 flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded-xl transition text-xs"
                    >
                      {isRequestingHint ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                      )}
                      <span>Request Algorithmic Hint</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeLeftTab === 'submissions' && (
              <div className="space-y-4 animate-fade-in text-xs">
                {loadingSubmissions ? (
                  <div className="flex items-center justify-center py-12 text-slate-400 font-mono">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>FETCHING INTERACTIVE HISTORY...</span>
                  </div>
                ) : problemSubmissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 font-mono">
                    <Terminal className="h-10 w-10 text-slate-600 mb-3" />
                    <p>No submissions recorded for this problem yet.</p>
                    <p className="text-[10px] mt-1 text-slate-600">Solve cases locally and click Submit to record submissions!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-mono font-bold tracking-wider uppercase text-purple-400">SUBMISSIONS RECORD</h4>
                    {problemSubmissions.map((sub, sIdx) => (
                      <div 
                        key={sub.submissionId} 
                        className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-3"
                      >
                        {/* Title line */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {sub.passed ? (
                              <span className="flex items-center text-green-400 text-[10px] font-bold font-mono space-x-1 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>ACCEPTED SOLUTION</span>
                              </span>
                            ) : (
                              <span className="flex items-center text-red-400 text-[10px] font-bold font-mono space-x-1 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                                <XCircle className="h-3 w-3" />
                                <span>REJECTED CODE</span>
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded uppercase">
                              {sub.language}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(sub.completedAt).toLocaleDateString()} {new Date(sub.completedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>

                        {/* Stats line */}
                        <div className="grid grid-cols-2 gap-3 bg-slate-900/40 p-2 border border-slate-850 rounded-lg text-[10px] font-mono">
                          <div>
                            <span className="text-slate-500">SCORE:</span>{' '}
                            <span className={`font-bold ${sub.score && sub.score >= 80 ? 'text-green-400' : 'text-slate-300'}`}>
                              {sub.score}% cases
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">COMPILER STATUS:</span>{' '}
                            <span className={sub.passed ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                              {sub.passed ? 'ALL PASSED' : 'LOGIC ERROR'}
                            </span>
                          </div>
                        </div>

                        {/* AI Feedback review section if present */}
                        {sub.aiFeedback && (
                          <div className="border-t border-slate-800/80 pt-2.5 space-y-1">
                            <span className="text-[9px] font-mono font-bold uppercase text-purple-400 block tracking-wider">AI EVALUATOR REPORT</span>
                            <p className="text-slate-300 leading-relaxed font-sans whitespace-pre-wrap text-[11px] bg-slate-900/10 hover:bg-slate-900/30 p-2.5 border border-slate-850 rounded-md">
                              {sub.aiFeedback}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Interactive Code Editor & Local runner (lg:col-span-7) */}
        <div id="coding-arena-editor" className="lg:col-span-7 flex flex-col h-[650px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          {/* Editor Header info */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
              <Terminal className="h-4 w-4 text-indigo-400" />
              <span>ByteCompiler Terminal 2.0</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-400 font-mono font-bold uppercase tracking-widest">ONLINE RUNTIME READY</span>
            </div>
          </div>

          {/* Code TextArea editor canvas */}
          <div className="flex-1 relative flex">
            {/* Simulated Line numbers gutter */}
            <div className="hidden sm:flex flex-col select-none bg-slate-950/80 px-2.5 py-4 border-r border-slate-850 font-mono text-slate-600 text-xs text-right w-12 pt-5">
              {Array.from({ length: 28 }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Editor Input Area */}
            <textarea
              id="challenge-terminal-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full bg-slate-950 font-mono text-xs text-indigo-100 p-4 pt-5 resize-none border-none outline-none focus:ring-0 selection:bg-indigo-600/30 custom-scrollbar leading-relaxed"
              placeholder="Write your solution code template structure here..."
              spellCheck="false"
            />
          </div>

          {/* Compile Terminal Results Board (Only pops if tests executed) */}
          {(localResults || localCompileError || isRunningLocal || isSubmitting) && (
            <div className="border-t border-slate-800 bg-slate-950/95 max-h-56 overflow-y-auto p-4 font-mono text-xs custom-scrollbar">
              <div className="flex items-center justify-between mb-3 text-[10px] text-slate-500 border-b border-slate-850 pb-1.5 uppercase font-bold">
                <span>Compilation Diagnostics Console</span>
                <button 
                  onClick={() => {
                    setLocalResults(null);
                    setLocalCompileError(null);
                    setAiGrade(null);
                  }}
                  className="text-slate-500 hover:text-slate-300 hover:underline"
                >
                  Clear Terminal
                </button>
              </div>

              {isRunningLocal && (
                <div className="flex items-center justify-center py-6 text-slate-400 animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>EXECUTING LOCAL TEST MATRIX ACTIONS...</span>
                </div>
              )}

              {isSubmitting && (
                <div className="flex items-center justify-center py-6 text-cyan-400 animate-pulse">
                  <Sparkles className="h-4 w-4 animate-spin mr-2" />
                  <span>TRANSMITTING BATCH TO AI COMPILER JUDGE...</span>
                </div>
              )}

              {/* Compile Error output */}
              {localCompileError && (
                <div className="bg-red-950/30 text-red-400 p-3 rounded-xl border border-red-500/20 leading-relaxed font-mono">
                  <div className="font-bold flex items-center space-x-1.5 text-[11px] uppercase mb-1">
                    <XCircle className="h-4 w-4 fill-red-500/10" />
                    <span>SYNTAX COMPILATION EXCEPTION</span>
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed text-[11px] pl-5">
                    {localCompileError}
                  </pre>
                </div>
              )}

              {/* Local Test Cases pass/fail list output */}
              {localResults && (
                <div className="space-y-2 text-[11px] leading-relaxed">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span>TEST BENCH SUMMARY:</span>
                    <span>
                      {localResults.filter(r => r.passed).length} / {localResults.length} CASES PASSED
                    </span>
                  </div>

                  {localResults.map((res, idx) => (
                    <div 
                      key={res.id} 
                      className={`p-2.5 rounded-lg border flex flex-col gap-1.5 ${
                        res.passed 
                          ? 'bg-green-950/15 border-green-500/20 text-green-300' 
                          : 'bg-red-950/15 border-red-500/20 text-red-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Case {idx + 1}: {res.passed ? 'PASSED ✓' : 'FAILED ✗'}</span>
                        <span className="text-[10px] text-slate-500 font-mono font-normal">Exec: {res.duration}ms</span>
                      </div>
                      
                      {/* Technical specifications */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-0.5 text-[10px] font-mono text-slate-400">
                        <div>
                          <span className="text-slate-500">Input:</span> {res.inputDisplay}
                        </div>
                        <div>
                          <span className="text-slate-500">Expected:</span> <span className="text-indigo-400">{res.expectedDisplay}</span>
                        </div>
                        {!res.passed && (
                          <div className="sm:col-span-2 text-red-400 bg-red-950/20 p-1.5 rounded border border-red-500/10 mt-1">
                            <span className="font-bold uppercase text-[9px] block">Returned output:</span> 
                            <code>{res.error ? `CRASH: ${res.error}` : `actual: ${res.actualDisplay}`}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Editor Action buttons bar FOOTER */}
          <div className="px-4 py-3 bg-slate-950 border-t border-slate-850 flex items-center justify-between gap-4">
            <div className="text-[10px] font-mono text-slate-500">
              * Compilers support offline instant JS testcases. Submissions are persisted.
            </div>

            <div className="flex items-center space-x-2">
              {/* Reset / Run block */}
              {language === 'javascript' ? (
                <button
                  onClick={handleRunLocalTests}
                  disabled={isRunningLocal || isSubmitting}
                  className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 hover:text-white font-mono font-bold text-xs px-4.5 py-2 rounded-xl transition shadow cursor-pointer"
                >
                  {isRunningLocal ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5 fill-slate-300/20" />
                  )}
                  <span>Run Tests (JS Only)</span>
                </button>
              ) : (
                <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800/80 px-2 py-1.5 rounded-lg">
                  Click Submit to compile {language}
                </span>
              )}

              {/* Submit Solution to DB with AI verification */}
              <button
                onClick={handleSubmitSolution}
                disabled={isSubmitting || isRunningLocal}
                className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 hover:indigo-400 text-white font-bold text-xs px-5 py-2 rounded-xl transition shadow-lg shadow-indigo-600/15 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-white/90" />
                )}
                <span>Submit & Grade</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
