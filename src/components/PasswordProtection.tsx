import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Shield, CheckCircle, XCircle } from 'lucide-react';
import { storage } from '../utils/storage';
import toast from 'react-hot-toast';

interface PasswordProtectionProps {
  onAuthenticated: () => void;
}

const CORRECT_PASSWORD = '441988mm';
const PASSWORD_KEY = 'app_password_authenticated';

export function PasswordProtection({ onAuthenticated }: PasswordProtectionProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const isAuthenticated = localStorage.getItem(PASSWORD_KEY);
      if (isAuthenticated === 'true') {
        onAuthenticated();
        return;
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast.error('Please enter the password');
      return;
    }

    setIsSubmitting(true);

    try {
      if (password === CORRECT_PASSWORD) {
        // Store authentication in localStorage
        localStorage.setItem(PASSWORD_KEY, 'true');
        
        // Also store in Firebase for backup
        await storage.saveSetting('password_authenticated', true);
        await storage.saveSetting('authentication_date', new Date().toISOString());
        
        toast.success('Authentication successful! Welcome to Code Vault Pro');
        onAuthenticated();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          toast.error('Too many failed attempts. Please refresh the page and try again.');
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } else {
          toast.error(`Incorrect password. ${3 - newAttempts} attempts remaining.`);
        }
        
        setPassword('');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Code Vault Pro
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Professional Code Management System
          </p>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <Lock className="h-4 w-4 inline mr-1" />
              This application is password protected
            </p>
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter Access Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter password..."
                disabled={isSubmitting || attempts >= 3}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {attempts > 0 && attempts < 3 && (
              <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                <XCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  Incorrect password. {3 - attempts} attempts remaining.
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || attempts >= 3 || !password.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>Access System</span>
              </>
            )}
          </button>
        </form>

        {/* Security Info */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
            <Shield className="h-4 w-4 mr-1" />
            Security Features
          </h3>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Password is required only once per session</li>
            <li>• Authentication status is securely stored</li>
            <li>• Firebase integration for data backup</li>
            <li>• Automatic session management</li>
          </ul>
        </div>

        {/* Project Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Project Slug: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">code-vault-pro-441988mm-bank-system-v5</code>
          </p>
        </div>
      </div>
    </div>
  );
}