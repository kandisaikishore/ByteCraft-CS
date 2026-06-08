import React from 'react';
import { BookOpen, Sparkles, LayoutDashboard, LogOut, Flame, Award, LogIn, Code2, Tv } from 'lucide-react';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';

interface NavbarProps {
  user: User | null;
  profile: UserProfile | null;
  activeTab: 'learn' | 'playground' | 'challenges' | 'dashboard' | 'batches';
  setActiveTab: (tab: 'learn' | 'playground' | 'challenges' | 'dashboard' | 'batches') => void;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Navbar({
  user,
  profile,
  activeTab,
  setActiveTab,
  onLogin,
  onLogout,
}: NavbarProps) {
  return (
    <nav id="academy-navbar" className="sticky top-0 z-50 bg-white border-b border-slate-200 text-slate-800 shadow-sm backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('learn')}>
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-mono font-bold text-lg shadow-md shadow-indigo-500/20">
              BC
            </div>
            <div>
              <span className="font-sans font-bold tracking-tight text-slate-900 text-lg">
                ByteCraft<span className="text-indigo-600 font-mono"> CS</span>
              </span>
              <span className="block text-[10px] font-mono text-indigo-600 tracking-wider">ACADEMY</span>
            </div>
          </div>

          {/* Nav Items (Only visible or active if signed in / guest flow is supported) */}
          <div className="hidden md:flex space-x-1">
            <button
              id="nav-btn-learn"
              onClick={() => setActiveTab('learn')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'learn'
                  ? 'bg-indigo-600/10 text-indigo-700 border border-indigo-500/20'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Learning Paths
            </button>

            <button
              id="nav-btn-playground"
              onClick={() => setActiveTab('playground')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'playground'
                  ? 'bg-indigo-600/10 text-indigo-700 border border-indigo-500/20'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Playground
            </button>

            <button
              id="nav-btn-challenges"
              onClick={() => setActiveTab('challenges')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'challenges'
                  ? 'bg-indigo-600/10 text-indigo-700 border border-indigo-500/20'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <Code2 className="h-4 w-4 mr-2" />
              Coding Arena
            </button>

            <button
              id="nav-btn-batches"
              onClick={() => setActiveTab('batches')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'batches'
                  ? 'bg-indigo-600/10 text-indigo-700 border border-indigo-505/20'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <Tv className="h-4 w-4 mr-2" />
              Study Batches
            </button>

            {user && (
              <button
                id="nav-btn-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-600/10 text-indigo-700 border border-indigo-500/20'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Student Dashboard
              </button>
            )}
          </div>

          {/* User profile & Info */}
          <div className="flex items-center space-x-4">
            {profile && (
              <div className="hidden sm:flex items-center space-x-3 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-xs">
                {/* Streak */}
                <div className="flex items-center text-orange-600 font-mono font-bold" title="Daily Streak">
                  <Flame className="h-4 w-4 fill-orange-500/20 mr-1 animate-pulse" />
                  <span>{profile.streak} Days</span>
                </div>
                {/* XP / Level */}
                <div className="flex items-center text-indigo-600 font-mono font-bold" title="Total XP">
                  <Award className="h-4 w-4 mr-1" />
                  <span>Lvl {profile.level} ({profile.xp} XP)</span>
                </div>
              </div>
            )}

            {user ? (
              <div className="flex items-center space-x-3">
                {/* User Avatar */}
                <div className="flex items-center space-x-2">
                  <img
                    referrerPolicy="no-referrer"
                    src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                    alt="Profile Avatar"
                    className="h-8 w-8 rounded-full border-2 border-indigo-500/50 object-cover"
                  />
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-semibold leading-3 text-slate-800 max-w-[100px] truncate">
                      {user.displayName}
                    </div>
                    <span className="text-[10px] text-slate-500 leading-3">Student</span>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  id="nav-btn-logout"
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer text-slate-600"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                id="nav-btn-login"
                onClick={onLogin}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                <LogIn className="h-4 w-4" />
                <span>Get Started</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer links */}
      <div className="md:hidden border-t border-slate-200 bg-white flex justify-around py-3">
        <button
          onClick={() => setActiveTab('learn')}
          className={`flex flex-col items-center text-xs font-medium space-y-1 ${
            activeTab === 'learn' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <BookOpen className="h-5 w-5" />
          <span>Learn</span>
        </button>

        <button
          onClick={() => setActiveTab('playground')}
          className={`flex flex-col items-center text-xs font-medium space-y-1 ${
            activeTab === 'playground' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Sparkles className="h-5 w-5" />
          <span>Tutor</span>
        </button>

        <button
          onClick={() => setActiveTab('challenges')}
          className={`flex flex-col items-center text-xs font-medium space-y-1 ${
            activeTab === 'challenges' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <Code2 className="h-5 w-5" />
          <span>Code</span>
        </button>

        <button
          onClick={() => setActiveTab('batches')}
          className={`flex flex-col items-center text-xs font-medium space-y-1 ${
            activeTab === 'batches' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <Tv className="h-5 w-5" />
          <span>Batches</span>
        </button>

        {user && (
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center text-xs font-medium space-y-1 ${
              activeTab === 'dashboard' ? 'text-purple-400' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </button>
        )}
      </div>
    </nav>
  );
}
