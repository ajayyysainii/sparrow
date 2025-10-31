import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
      <div className="w-32 h-32 rounded-3xl bg-gray-200 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-gray-500/30">
        <span className="text-8xl">🤖</span>
      </div>
      
      <h1 className="text-6xl font-bold mb-4 text-slate-900 tracking-tight">
        AI Voice Assistant
      </h1>
      
      <p className="text-2xl text-slate-500 mb-12 leading-relaxed max-w-2xl">
        Start natural voice conversations with your AI assistant. 
        Make calls, view history, and experience seamless voice interactions.
      </p>
      
      <div className="flex gap-6">
        <Link
          to="/call"
          className="bg-linear-to-r from-blue-500 to-blue-700 text-white border-0 rounded-3xl px-8 py-4 text-lg font-semibold cursor-pointer inline-flex items-center gap-3 transition-all duration-200 ease-out shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40"
        >
          <span className="text-2xl">🎤</span>
          Start Voice Call
        </Link>
        
        <Link
          to="/call/list"
          className="bg-white/80 backdrop-blur-xl text-slate-700 border border-slate-200 rounded-3xl px-8 py-4 text-lg font-semibold cursor-pointer inline-flex items-center gap-3 transition-all duration-200 ease-out shadow-lg shadow-black/8 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/12"
        >
          <span className="text-2xl">📋</span>
          View Call History
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
