import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Terminal, 
  Sliders, 
  HelpCircle, 
  ChevronRight, 
  Award, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Notebook, 
  Save, 
  RefreshCw,
  Info
} from 'lucide-react';
import { Domain, Topic, QuizQuestion } from '../types';
import { csDomains } from '../data/curriculum';

interface CurriculumViewProps {
  onAddXP: (amount: number) => Promise<void>;
  onCompleteTopic: (topicId: string) => Promise<void>;
  onSaveQuizSubmission: (domainId: string, topicId: string, score: number, total: number, correct: number) => Promise<void>;
  onSaveCustomNote: (title: string, concept: string, explanation: string) => Promise<void>;
  completedTopics: string[];
}

export default function CurriculumView({
  onAddXP,
  onCompleteTopic,
  onSaveQuizSubmission,
  onSaveCustomNote,
  completedTopics = [],
}: CurriculumViewProps) {
  const [selectedDomain, setSelectedDomain] = useState<Domain>(csDomains[0]);
  const [selectedTopic, setSelectedTopic] = useState<Topic>(csDomains[0].topics[0]);
  const [activeSubTab, setActiveSubTab] = useState<'theory' | 'quiz' | 'ai-practice'>('theory');

  // Static Local Quiz State
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [quizSaved, setQuizSaved] = useState<boolean>(false);

  // AI Generated Dynamic Practice State
  const [aiQuestion, setAiQuestion] = useState<QuizQuestion | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiSelectedAnswer, setAiSelectedAnswer] = useState<number | null>(null);
  const [aiAnswerChecked, setAiAnswerChecked] = useState<boolean>(false);
  const [aiFeedbackSaved, setAiFeedbackSaved] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Reset local state when switched
  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setActiveSubTab('theory');
    setQuizScore(null);
    setQuizCompleted(false);
    setUserAnswers({});
    setQuizSaved(false);
    setAiQuestion(null);
    setAiSelectedAnswer(null);
    setAiAnswerChecked(false);
    setAiFeedbackSaved(false);
    setAiError(null);
  };

  // Predefined quiz checking
  const handleSelectPredefinedAnswer = (qId: string, isIndex: number) => {
    if (quizCompleted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: isIndex }));
  };

  const handleGradePredefinedQuiz = async () => {
    let score = 0;
    selectedTopic.quiz.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswerIndex) {
        score += 1;
      }
    });

    setQuizScore(score);
    setQuizCompleted(true);
    setQuizSaved(true);

    // Save to history + Add XP (50 XP for completing a topic quiz!)
    const xpReward = score * 20;
    await onSaveQuizSubmission(
      selectedDomain.id,
      selectedTopic.id,
      Math.round((score / selectedTopic.quiz.length) * 100),
      selectedTopic.quiz.length,
      score
    );
    await onAddXP(xpReward);
    await onCompleteTopic(selectedTopic.id);
  };

  const restartQuiz = () => {
    setQuizScore(null);
    setQuizCompleted(false);
    setUserAnswers({});
    setQuizSaved(false);
  };

  // Generate Custom Interactive Practice Question using Gemini
  const fetchAIGeneratedPractice = async () => {
    setAiLoading(true);
    setAiSelectedAnswer(null);
    setAiAnswerChecked(false);
    setAiFeedbackSaved(false);
    setAiError(null);
    setAiQuestion(null);

    try {
      const response = await fetch('/api/ai/generate-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic.title,
          keyConcepts: selectedTopic.keyConcepts,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reach Gemini custom trainer. Please verify your internet connection or check your API configuration.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Convert generated JSON to our standard client QuizQuestion interface
      const constructedQuestion: QuizQuestion = {
        id: `ai-q-${Date.now()}`,
        question: data.question,
        options: data.options || [],
        correctAnswerIndex: data.correctAnswerIndex,
        explanation: data.explanation,
      };

      setAiQuestion(constructedQuestion);
    } catch (err) {
      console.error(err);
      setAiError(err instanceof Error ? err.message : "An unexpected service error occurred");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCheckAiAnswer = async () => {
    if (aiSelectedAnswer === null || !aiQuestion) return;
    setAiAnswerChecked(true);

    // Grade reward
    const isCorrect = aiSelectedAnswer === aiQuestion.correctAnswerIndex;
    const xpReward = isCorrect ? 30 : 10; // Earn 30 XP for correct answer, 10 XP fallback for attempt
    await onAddXP(xpReward);
  };

  const saveAiPracticeToNotes = async () => {
    if (!aiQuestion) return;
    const notesTitle = `Dynamic Practice: ${selectedTopic.title}`;
    const notesBody = `**Question:**\n${aiQuestion.question}\n\n**Options Considered:**\n${aiQuestion.options.map((opt, i) => `${i === aiQuestion.correctAnswerIndex ? '✅' : '❌'} ${opt}`).join('\n')}\n\n**AI Discussion & Rationale:**\n${aiQuestion.explanation}`;
    
    await onSaveCustomNote(notesTitle, selectedTopic.title, notesBody);
    setAiFeedbackSaved(true);
  };

  return (
    <div id="curriculum-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100">
      
      {/* Domains Selection Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">Mastery Paths</span>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-white mt-1">CS Technologies</h1>
        </div>

        {/* Domain Buttons row */}
        <div className="flex flex-wrap gap-2">
          {csDomains.map(domain => {
            const isSelected = selectedDomain.id === domain.id;
            return (
              <button
                key={domain.id}
                onClick={() => {
                  setSelectedDomain(domain);
                  handleSelectTopic(domain.topics[0]);
                }}
                className={`py-2 px-4 rounded-xl text-xs font-semibold font-mono tracking-tight transition-all duration-300 border ${
                  isSelected 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700/60'
                }`}
              >
                {domain.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Layout: Topics Side-grid, Content Main */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Topics Picker */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-3xl">
            <h3 className="text-sm font-bold font-mono text-slate-400 uppercase tracking-widest mb-4">
              {selectedDomain.title} Topics
            </h3>
            
            <div className="space-y-2">
              {selectedDomain.topics.map(topic => {
                const isSelected = selectedTopic.id === topic.id;
                const isCompleted = completedTopics.includes(topic.id);

                return (
                  <button
                    key={topic.id}
                    onClick={() => handleSelectTopic(topic)}
                    className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between border transition-all duration-300 ${
                      isSelected
                        ? 'bg-slate-800/80 border-indigo-500 text-indigo-300 shadow shadow-indigo-500/5'
                        : 'bg-slate-950/20 border-slate-800 text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
                    }`}
                  >
                    <div className="pr-2 leading-tight">
                      <span className="text-xs font-bold font-sans block">{topic.title}</span>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {topic.keyConcepts.slice(0, 2).join(' • ')}
                      </span>
                    </div>
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 fill-emerald-500/10 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950/20 border border-slate-800/80 p-5 rounded-3xl">
            <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest flex items-center">
              <Sparkles className="h-4 w-4 mr-1.5" /> Core Curriculum Design
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              Step through detailed analytical definitions on the right, and then request a unique practice run generated instantly using Gemini artificial intelligence.
            </p>
          </div>
        </div>

        {/* Learning Hub Main Section */}
        <div className="lg:col-span-3">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            {/* Header section with tabs */}
            <div className="bg-slate-900 border-b border-slate-800/80 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">{selectedDomain.title} Module</span>
                <h2 className="text-xl font-bold tracking-tight text-white mt-1">{selectedTopic.title}</h2>
              </div>

              {/* Sub-tabs list */}
              <div className="bg-slate-950 border border-slate-800 p-1 rounded-xl flex">
                <button
                  id="tab-btn-theory"
                  onClick={() => setActiveSubTab('theory')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all duration-300 ${
                    activeSubTab === 'theory'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Conceptual Theory
                </button>
                <button
                  id="tab-btn-quiz"
                  onClick={() => setActiveSubTab('quiz')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all duration-300 ${
                    activeSubTab === 'quiz'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Topic Quiz
                </button>
                <button
                  id="tab-btn-ai-practice"
                  onClick={() => {
                    setActiveSubTab('ai-practice');
                    if (!aiQuestion) {
                      fetchAIGeneratedPractice();
                    }
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-tight flex items-center transition-all duration-300 ${
                    activeSubTab === 'ai-practice'
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/10'
                  }`}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Practice
                </button>
              </div>
            </div>

            {/* TAB CONTENT: THEORY */}
            {activeSubTab === 'theory' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 sm:p-8 space-y-6"
              >
                {/* Concepts list labels */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center pr-1 uppercase">Key Concepts:</span>
                  {selectedTopic.keyConcepts.map(c => (
                    <span key={c} className="text-[10px] font-mono font-semibold bg-indigo-950/20 text-indigo-300 border border-indigo-500/10 px-2.5 py-0.5 rounded-full">
                      {c}
                    </span>
                  ))}
                </div>

                {/* Step contents mapping */}
                <div className="relative border-l border-slate-800 pl-6 ml-3 space-y-8 py-2">
                  {selectedTopic.theory.map((paragraph, index) => (
                    <div key={index} className="relative group">
                      {/* Counter circle logo */}
                      <span className="absolute -left-[35px] top-0 h-6.5 w-6.5 rounded-full bg-slate-900 border-2 border-indigo-500 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs shadow-md transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600">
                        {index + 1}
                      </span>
                      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap pt-0.5">
                        {paragraph}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Prompt box */}
                <div className="mt-8 bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex items-start space-x-3.5">
                  <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                    <Info className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-mono text-slate-300 uppercase">Knowledge Verification</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      Are you confident with the system designs outlined above? Test your diagnostic retention under the <strong>Topic Quiz</strong>, or prompt the <strong>AI Practice</strong> to produce custom dynamic scenarios.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: TOPIC QUIZ */}
            {activeSubTab === 'quiz' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 sm:p-8 space-y-8"
              >
                {selectedTopic.quiz.map((q, qIndex) => {
                  const userAnswer = userAnswers[q.id];
                  const showCorrect = quizCompleted && q.correctAnswerIndex === userAnswer;
                  const showWrong = quizCompleted && userAnswer !== undefined && q.correctAnswerIndex !== userAnswer;

                  return (
                    <div key={q.id} className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl">
                      <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-widest pl-1">
                        Question {qIndex + 1} of {selectedTopic.quiz.length}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1 whitespace-pre-wrap">{q.question}</h4>

                      {/* Options stack */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAnswer === optIdx;
                          let optBg = 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/20';
                          
                          if (isSelected) {
                            optBg = 'bg-indigo-950/20 border-indigo-500 text-indigo-300 font-semibold';
                          }

                          if (quizCompleted) {
                            if (optIdx === q.correctAnswerIndex) {
                              optBg = 'bg-emerald-950/40 border-emerald-500 text-emerald-400 font-bold';
                            } else if (isSelected) {
                              optBg = 'bg-red-950/40 border-red-500/80 text-red-400';
                            } else {
                              optBg = 'bg-slate-950/20 border-slate-900/60 text-slate-600 pointer-events-none';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={quizCompleted}
                              onClick={() => handleSelectPredefinedAnswer(q.id, optIdx)}
                              className={`w-full text-left p-4 rounded-xl border text-xs transition-all duration-200 flex items-center justify-between ${optBg}`}
                            >
                              <span>{opt}</span>
                              {quizCompleted && optIdx === q.correctAnswerIndex && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              )}
                              {quizCompleted && isSelected && optIdx !== q.correctAnswerIndex && (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Question rationale */}
                      {quizCompleted && (
                        <div className="mt-4 p-4.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                          <strong className="text-slate-200 block font-mono uppercase text-[10px] tracking-widest text-indigo-400 mb-1">Answer Analysis</strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Submit Panel / Outcome Grade banner */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {!quizCompleted ? (
                    <>
                      <p className="text-xs text-slate-500">
                        {Object.keys(userAnswers).length} of {selectedTopic.quiz.length} answers selected. Grade is immediate.
                      </p>
                      <button
                        onClick={handleGradePredefinedQuiz}
                        disabled={Object.keys(userAnswers).length !== selectedTopic.quiz.length}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold leading-none bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-800 disabled:text-slate-600 transition-colors cursor-pointer"
                      >
                        Submit & Grade Quiz
                      </button>
                    </>
                  ) : (
                    <div className="w-full flex flex-col sm:flex-row items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-2xl gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full border-2 border-indigo-500 bg-indigo-950/10 text-indigo-400 flex items-center justify-center font-mono font-bold text-sm">
                          {quizScore} / {selectedTopic.quiz.length}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Quiz Grades Calculated!</h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            XP allocated. Topics tracking is successfully updated.
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={restartQuiz}
                          className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 tracking-tight transition"
                        >
                          Restart Quiz
                        </button>
                        <button
                          onClick={() => setActiveSubTab('ai-practice')}
                          className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 tracking-tight flex items-center transition"
                        >
                          <Sparkles className="h-3 w-3 mr-1.5" />
                          Endless AI Training
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: AI DYNAMIC PRACTICE */}
            {activeSubTab === 'ai-practice' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 sm:p-8 space-y-6"
              >
                <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-white flex items-center">
                      <Sparkles className="h-4-w-4 text-cyan-400 mr-1.5" /> AI Custom Adaptive Practice
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Gemini is scanning concept terms: <strong>{selectedTopic.keyConcepts.join(' & ')}</strong> to design a tailormade question.
                    </p>
                  </div>
                  <button
                    onClick={fetchAIGeneratedPractice}
                    disabled={aiLoading}
                    className="flex items-center space-x-1 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-1.5 rounded-xl text-xs transition disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${aiLoading ? 'animate-spin' : ''}`} />
                    <span>Regen</span>
                  </button>
                </div>

                {/* Loading / Error / Question view state controller */}
                {aiLoading && (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                    <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mb-3" />
                    <p className="text-sm font-mono tracking-tight animate-pulse text-slate-300">Formulating scenario on {selectedTopic.title}...</p>
                    <p className="text-xs mt-1 text-slate-500">Checking model constraints & analyzing indices.</p>
                  </div>
                )}

                {aiError && (
                  <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/30 text-xs text-red-400">
                    <p className="font-bold font-mono">Error generating concept exercise:</p>
                    <p className="mt-1">{aiError}</p>
                    <button 
                      onClick={fetchAIGeneratedPractice}
                      className="text-xs text-cyan-400 hover:underline font-bold mt-2 focus:outline-none"
                    >
                      Try again &rarr;
                    </button>
                  </div>
                )}

                {aiQuestion && !aiLoading && (
                  <div className="space-y-6">
                    {/* The dynamic question */}
                    <div className="bg-slate-950/30 border border-slate-800 p-5 rounded-2xl">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">Custom Practice Scenario</span>
                      <p className="text-sm text-slate-100 font-sans mt-2 whitespace-pre-wrap leading-relaxed">
                        {aiQuestion.question}
                      </p>

                      {/* Options stack list */}
                      <div className="grid grid-cols-1 gap-3 mt-5">
                        {aiQuestion.options.map((opt, optIdx) => {
                          const isSelected = aiSelectedAnswer === optIdx;
                          let optionBorders = 'bg-slate-950/30 border-slate-800 hover:bg-slate-800/10 text-slate-300';

                          if (isSelected) {
                            optionBorders = 'bg-cyan-950/20 border-cyan-500 text-cyan-300 font-semibold';
                          }

                          if (aiAnswerChecked) {
                            if (optIdx === aiQuestion.correctAnswerIndex) {
                              optionBorders = 'bg-emerald-950/40 border-emerald-500 text-emerald-400 font-bold';
                            } else if (isSelected) {
                              optionBorders = 'bg-red-950/40 border-red-500/80 text-red-400';
                            } else {
                              optionBorders = 'bg-slate-950/10 border-slate-900/40 text-slate-600 pointer-events-none';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={aiAnswerChecked}
                              onClick={() => setAiSelectedAnswer(optIdx)}
                              className={`w-full text-left p-4 rounded-xl border text-xs transition flex justify-between items-center ${optionBorders}`}
                            >
                              <span>{opt}</span>
                              {aiAnswerChecked && optIdx === aiQuestion.correctAnswerIndex && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              )}
                              {aiAnswerChecked && isSelected && optIdx !== aiQuestion.correctAnswerIndex && (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      {aiAnswerChecked && (
                        <div className="mt-5 p-5 bg-slate-950/60 border border-slate-800 rounded-xl">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
                            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">Comprehensive Discussions</span>
                            
                            {/* Save Note trigger button */}
                            <button
                              disabled={aiFeedbackSaved}
                              onClick={saveAiPracticeToNotes}
                              className="text-[10px] font-sans font-bold text-slate-300 hover:text-white flex items-center bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60 disabled:opacity-50 disabled:pointer-events-none"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              {aiFeedbackSaved ? 'Saved to Vault' : 'Save As Cheat Sheet'}
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap font-sans">
                            {aiQuestion.explanation}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons footer */}
                    {!aiAnswerChecked ? (
                      <div className="flex justify-end">
                        <button
                          onClick={handleCheckAiAnswer}
                          disabled={aiSelectedAnswer === null}
                          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white disabled:bg-slate-800 disabled:text-slate-600 transition-colors"
                        >
                          Check Answer & Allocate XP
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center bg-slate-900/60 border border-slate-800 px-4 py-3 rounded-2xl">
                        <p className="text-xs text-slate-500">
                          {aiSelectedAnswer === aiQuestion.correctAnswerIndex 
                            ? 'Excellent! +30 XP claimed successfully.' 
                            : 'Attempt noted. Rationale explained above. +10 XP allocated.'}
                        </p>
                        <button
                          onClick={fetchAIGeneratedPractice}
                          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition"
                        >
                          Generate Next Scenario
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
