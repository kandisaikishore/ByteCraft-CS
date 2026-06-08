export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  xp: number;
  streak: number;
  level: number;
  completedTopics?: string[]; // Array of topic IDs
  enrolledCourses?: string[]; // Array of domain IDs (courses) the user enrolled in
  completedChallenges?: string[]; // Array of challenge IDs solved
  createdAt: string; // ISO String
  updatedAt?: string; // ISO String
}

export interface TestCase {
  id: string;
  inputs: any[];
  expected: any;
  inputDisplay: string; // Friendly text like "nums = [2, 7, 11], target = 9"
  expectedDisplay: string; // Friendly expected output
}

export interface ChallengeProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  constraints: string[];
  fnName: string;
  starterTemplates: {
    [lang: string]: string;
  };
  testCases: TestCase[];
  xpReward: number;
}

export interface ChallengeSubmission {
  submissionId: string;
  userId: string;
  challengeId: string;
  challengeTitle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: string;
  code: string;
  passed: boolean;
  score?: number; // Percent passed, e.g. 100 or 66
  aiFeedback?: string; // Optional AI evaluation feedback
  completedAt: string; // ISO String
}

export interface QuizSubmission {
  submissionId: string;
  userId: string;
  domainId: string;
  topicId: string;
  score: number; // e.g. 8 - score out of 10
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string; // ISO String
}

export interface SavedNote {
  noteId: string;
  userId: string;
  title: string;
  concept: string;
  explanation: string; // Markdown text
  createdAt: string; // ISO String
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  keyConcepts: string[];
  theory: string[]; // Step-by-step full conceptual theory
  quiz: QuizQuestion[];
}

export interface Domain {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  accentColor: string; // Tailwind class
  topics: Topic[];
}

declare global {
  interface Window {
    showNotification?: (message: string, type: 'success' | 'info' | 'error' | 'warning') => void;
  }
}

