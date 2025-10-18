import React, { useEffect, useState } from 'react';
import { Code2, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);

  const stages = [
    'Initializing Code Vault...',
    'Loading syntax highlighters...',
    'Setting up integrations...',
    'Ready to code!'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return prev;
        }
        return prev + 2;
      });
    }, 50);

    const stageInterval = setInterval(() => {
      setStage(prev => Math.min(prev + 1, stages.length - 1));
    }, 800);

    return () => {
      clearInterval(interval);
      clearInterval(stageInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <div className="relative bg-white rounded-full p-6 shadow-2xl animate-bounce">
            <Code2 className="h-16 w-16 text-blue-600" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-400 animate-spin" />
        </div>

        {/* App Name */}
        <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in">
          Code Vault
        </h1>
        <p className="text-blue-200 mb-8 animate-fade-in-delay">
          Professional Code Management Platform
        </p>

        {/* Progress Bar */}
        <div className="w-80 mx-auto mb-4">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-400 to-teal-400 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Loading Stage */}
        <p className="text-blue-100 text-sm animate-pulse">
          {stages[stage]}
        </p>

        {/* Progress Percentage */}
        <p className="text-white/60 text-xs mt-2">
          {Math.round(progress)}%
        </p>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-delay {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in-delay 1s ease-out 0.5s both;
        }
      `}</style>
    </div>
  );
}