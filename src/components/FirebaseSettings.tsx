import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, RefreshCw, Settings, Info, Cloud, Shield, AlertTriangle } from 'lucide-react';
import { firebaseStorage } from '../utils/firebaseStorage';
import toast from 'react-hot-toast';

interface FirebaseSettingsProps {
  onClose: () => void;
}

export function FirebaseSettings({ onClose }: FirebaseSettingsProps) {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error' | 'idle'>('idle');
  const [connectionError, setConnectionError] = useState<string>('');
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const [firebaseInfo, setFirebaseInfo] = useState<any>(null);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  useEffect(() => {
    setFirebaseInfo(firebaseStorage.getFirebaseInfo());
  }, []);

  const testConnection = async () => {
    setConnectionStatus('testing');
    setConnectionError('');
    setConnectionDetails(null);
    
    try {
      console.log('🧪 Starting Firebase connection test...');
      const result = await firebaseStorage.testConnection();
      
      if (result.success) {
        setConnectionStatus('success');
        setConnectionDetails(result.details);
        toast.success('Firebase connection successful!');
        console.log('✅ Connection test passed:', result.details);
      } else {
        setConnectionStatus('error');
        setConnectionError(result.error || 'Unknown error');
        setConnectionDetails(result.details);
        toast.error('Firebase connection failed');
        console.error('❌ Connection test failed:', result.error);
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
      toast.error('Firebase connection test failed');
      console.error('❌ Connection test exception:', error);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Database className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing':
        return 'Testing connection...';
      case 'success':
        return 'Connection successful';
      case 'error':
        return 'Connection failed';
      default:
        return 'Ready to test';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Firebase Configuration
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Database connection and settings
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Connection Status */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Cloud className="h-5 w-5 mr-2" />
                Connection Status
              </h3>
              <button
                onClick={testConnection}
                disabled={connectionStatus === 'testing'}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {getStatusIcon()}
                <span>{connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {getStatusText()}
                </p>
                {connectionError && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Error: {connectionError}
                  </p>
                )}
                {connectionStatus === 'success' && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    ✅ Firebase Firestore and Realtime Database connected successfully
                  </p>
                )}
                {connectionDetails && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Last tested: {new Date(connectionDetails.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Connection Results */}
          {connectionDetails && (
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Connection Test Results
              </h3>
              
              <div className="space-y-3">
                {/* Firestore Results */}
                {connectionDetails.firestore && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Firestore Database</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Read: {connectionDetails.firestore.read ? '✅' : '❌'} | 
                        Write: {connectionDetails.firestore.write ? '✅' : '❌'}
                      </p>
                      {connectionDetails.firestore.error && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {connectionDetails.firestore.error}
                        </p>
                      )}
                    </div>
                    {connectionDetails.firestore.read && connectionDetails.firestore.write ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
                
                {/* Realtime Database Results */}
                {connectionDetails.realtimeDatabase && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Realtime Database</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Read: {connectionDetails.realtimeDatabase.read ? '✅' : '❌'} | 
                        Write: {connectionDetails.realtimeDatabase.write ? '✅' : '❌'}
                      </p>
                      {connectionDetails.realtimeDatabase.error && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {connectionDetails.realtimeDatabase.error}
                        </p>
                      )}
                    </div>
                    {connectionDetails.realtimeDatabase.read && connectionDetails.realtimeDatabase.write ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Firebase Configuration */}
          {firebaseInfo && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configuration Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Project Info</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Project ID:</span>
                      <code className="ml-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                        {firebaseInfo.projectId}
                      </code>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Database URL:</span>
                      <code className="ml-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs break-all">
                        {firebaseInfo.databaseURL}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Project Slug</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Unique Identifier:</span>
                      <code className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs break-all">
                        {firebaseInfo.projectSlug}
                      </code>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Version 5 - Complete Firebase integration with proper security
                      {connectionDetails?.offlineMode && ' | 🔄 Offline Mode Active'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Collections */}
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Database Collections</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {firebaseInfo.collections.map((collection: string) => (
                    <div key={collection} className="bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded text-sm">
                      <code className="text-gray-700 dark:text-gray-300">{collection}</code>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  All collections use the unique project slug prefix for data isolation
                </p>
              </div>

              {/* Features */}
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Available Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {firebaseInfo.features.map((feature: string) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Troubleshooting Guide */}
              {connectionStatus === 'error' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Troubleshooting</h4>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                        <li>• Check your internet connection</li>
                        <li>• Verify Firebase project configuration</li>
                        <li>• Ensure Firestore and Realtime Database are enabled</li>
                        <li>• Check browser console for detailed error messages</li>
                        <li>• Try refreshing the page and testing again</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Security Information</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                  <li>• All data is stored securely in Firebase Cloud Firestore</li>
                  <li>• Project uses unique collection names (v3) for complete data isolation</li>
                  <li>• Password protection is active for application access</li>
                  <li>• Real-time database backup is available</li>
                  <li>• Network connectivity is automatically managed</li>
                  <li>• Connection status is monitored and logged</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}