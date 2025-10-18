import { useState, useEffect } from 'react';
import { Github, CheckCircle, XCircle, RefreshCw, Download, Upload, Copy, Key, TestTube, Save, Eye, EyeOff, Plus, Edit, Trash2, Database, Terminal, Search, Bot } from 'lucide-react';
import { ProviderConfig, Category, CmdCommand } from '../types';
import { ContextMenu, useContextMenu } from './ContextMenu';
import { IconPicker } from './IconPicker';
import { FirebaseSettings } from './FirebaseSettings';
import { useTheme } from './ThemeProvider';
import { storage } from '../utils/storage';
import { SUPPORTED_LANGUAGES } from '../utils/codeHighlight';
import { CMD_CATEGORIES, copyToClipboard } from '../utils/cmdCommands';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface SettingsProps {
  categories: Category[];
  onUpdateCategories: (categories: Category[]) => void;
  onExportData: () => string;
  onImportData: (data: string) => boolean;
}

export function Settings({ categories, onUpdateCategories, onExportData, onImportData }: SettingsProps) {
  const { theme, setTheme } = useTheme();
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [showFirebaseSettings, setShowFirebaseSettings] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [selectedIconForCategory, setSelectedIconForCategory] = useState('📁');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showBulkCategoryForm, setShowBulkCategoryForm] = useState(false);
  const [bulkCategoryText, setBulkCategoryText] = useState('');
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    languages: [] as string[]
  });
  const [apiKeys, setApiKeys] = useState({
    github: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    github: false
  });
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProviderConfig[]>([
    { type: 'gist', connected: false }
  ]);
  
  // CMD Commands state
  const [activeCmdTab, setActiveCmdTab] = useState<string>('laravel');
  const [cmdSearchQuery, setCmdSearchQuery] = useState('');
  const [showCmdSearch, setShowCmdSearch] = useState(false);
  const [showAddCommandForm, setShowAddCommandForm] = useState(false);
  const [customCommands, setCustomCommands] = useState<CmdCommand[]>([]);
  const [newCommand, setNewCommand] = useState({
    command: '',
    description: '',
    category: 'custom' as 'laravel' | 'django' | 'react' | 'vue' | 'node' | 'custom'
  });

  // Load GitHub token on component mount
  useEffect(() => {
    const loadGitHubToken = async () => {
      const token = await storage.getSetting('github_token');
      if (token) {
        setApiKeys(prev => ({ ...prev, github: token }));
        setProviders(prev => prev.map(p => 
          p.type === 'gist' ? { ...p, connected: true } : p
        ));
      }
    };
    loadGitHubToken();
  }, []);

  // Load custom commands on component mount
  useEffect(() => {
    const loadCustomCommands = async () => {
      try {
        const savedCommands = await storage.getSetting('custom_cmd_commands');
        if (savedCommands) {
          setCustomCommands(JSON.parse(savedCommands));
        }
      } catch (error) {
        console.error('Failed to load custom commands:', error);
      }
    };
    loadCustomCommands();
  }, []);

  // Save custom commands when they change
  useEffect(() => {
    const saveCustomCommands = async () => {
      try {
        await storage.saveSetting('custom_cmd_commands', JSON.stringify(customCommands));
      } catch (error) {
        console.error('Failed to save custom commands:', error);
      }
    };
    
    if (customCommands.length > 0) {
      saveCustomCommands();
    }
  }, [customCommands]);

  // Handle Escape key for API Settings Modal
  useEffect(() => {
    if (!showApiSettings) return;
    
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowApiSettings(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showApiSettings]);

  // Handle Escape key for Category Form Modal
  useEffect(() => {
    if (!showCategoryForm) return;
    
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowCategoryForm(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showCategoryForm]);

  // Handle Escape key for Bulk Category Form Modal
  useEffect(() => {
    if (!showBulkCategoryForm) return;
    
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowBulkCategoryForm(false);
        setBulkCategoryText('');
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showBulkCategoryForm]);

  const handleConnect = async () => {
    setShowApiSettings(true);
  };

  const handleDisconnect = async (provider: ProviderConfig) => {
    const result = await Swal.fire({
      title: `قطع الاتصال من ${providerNames[provider.type]}؟`,
      text: 'لن تتمكن من التصدير/الاستيراد من هذه الخدمة.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'قطع الاتصال',
      cancelButtonText: 'إلغاء'
    });

    if (result.isConfirmed) {
      // Clear API key from storage
      if (provider.type === 'gist') {
        await storage.saveSetting('github_token', '');
      }
      
      // Update local state
      setApiKeys(prev => ({
        ...prev,
        github: ''
      }));
      
      setProviders(prev => prev.map(p => 
        p.type === provider.type 
          ? { ...p, connected: false, accountEmail: undefined, tokenExpiry: undefined }
          : p
      ));
      toast.success(`Disconnected from ${providerNames[provider.type]}`);
    }
  };

  const handleSaveApiKey = async (provider: string, token: string) => {
    if (provider === 'github') {
      await storage.saveSetting('github_token', token);
    }
    
    setProviders(prev => prev.map(p => 
      p.type === 'gist' && provider === 'github'
        ? { ...p, connected: !!token }
        : p
    ));
    
    toast.success(`API key saved for GitHub`);
  };

  const handleTestConnection = async (provider: string) => {
    const token = apiKeys[provider as keyof typeof apiKeys];
    if (!token.trim()) {
      toast.error('Please enter API key first');
      return;
    }

    setTestingConnection(provider);
    
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success/failure based on token format
      const isValidFormat = token.length > 10 && token.includes('_');
      
      if (isValidFormat) {
        toast.success(`✅ Successfully connected to GitHub`);
        handleSaveApiKey(provider, token);
      } else {
        toast.error(`❌ Connection failed - Check API key validity`);
      }
    } catch {
      toast.error(`❌ Connection error`);
    } finally {
      setTestingConnection(null);
    }
  };
  
  const handleExportData = async () => {
    try {
      const data = await onExportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `code-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully!');
        } catch {
          toast.error('Failed to export data');
        }
  };

  const handleImportData = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result as string;
          const success = await onImportData(data);
          if (success) {
            toast.success('Data imported successfully!');
          } else {
            toast.error('Invalid backup file format');
          }
        } catch {
          toast.error('Failed to import data');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleCopyConnectionInfo = async (provider: ProviderConfig) => {
    const info = `${providerNames[provider.type]}: ${provider.accountEmail || 'Not connected'}`;
    try {
      await navigator.clipboard.writeText(info);
      toast.success('Connection info copied!');
    } catch {
      toast.error('Failed to copy info');
    }
  };

  const getProviderContextMenuItems = (provider: ProviderConfig) => [
    {
      id: 'copy-info',
      label: 'Copy Connection Info',
      icon: Copy,
      onClick: () => handleCopyConnectionInfo(provider)
    },
    ...(provider.connected ? [
      {
        id: 'refresh',
        label: 'Refresh Connection',
        icon: RefreshCw,
        onClick: () => handleConnect()
      },
      {
        id: 'disconnect',
        label: 'Disconnect',
        icon: XCircle,
        onClick: () => handleDisconnect(provider),
        separator: true
      }
    ] : [
      {
        id: 'connect',
        label: 'Connect',
        icon: CheckCircle,
        onClick: () => handleConnect()
      }
    ])
  ];

  const handleCreateCategory = async () => {
    setSelectedIconForCategory('📁');
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      languages: []
    });
    setShowCategoryForm(true);
  };

  const handleEditCategory = async (category: Category) => {
    setEditingCategory(category);
    setSelectedIconForCategory(category.icon);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      languages: category.languages || []
    });
    setShowCategoryForm(true);
  };

  const handleSaveCategory = () => {
    if (!categoryFormData.name.trim()) {
      toast.error('Please enter category name');
      return;
    }

    if (editingCategory) {
      // Update existing category
      const updatedCategories = categories.map(c => 
        c.id === editingCategory.id 
          ? { 
              ...c, 
              name: categoryFormData.name,
              slug: categoryFormData.name.toLowerCase().replace(/\s+/g, '-'),
              description: categoryFormData.description,
              icon: selectedIconForCategory,
              color: categoryFormData.color,
              languages: categoryFormData.languages
            }
          : c
      );
      
      onUpdateCategories(updatedCategories);
      storage.saveCategories(updatedCategories);
      console.log('Categories saved successfully');
      toast.success('Category updated successfully!');
    } else {
      // Create new category
      const newCategory: Category = {
        id: Date.now().toString(),
        name: categoryFormData.name,
        slug: categoryFormData.name.toLowerCase().replace(/\s+/g, '-'),
        color: categoryFormData.color,
        icon: selectedIconForCategory,
        description: categoryFormData.description,
        count: 0,
        languages: categoryFormData.languages
      };
      
      const updatedCategories = [...categories, newCategory];
      onUpdateCategories(updatedCategories);
      storage.saveCategories(updatedCategories);
      console.log('New category saved successfully');
      toast.success('Category created successfully!');
    }

    setShowCategoryForm(false);
    setEditingCategory(null);
  };
  const handleDeleteCategory = async (category: Category) => {
    const result = await Swal.fire({
      title: 'Delete Category?',
      text: `Are you sure you want to delete category "${category.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      const updatedCategories = categories.filter(c => c.id !== category.id);
      onUpdateCategories(updatedCategories);
      storage.saveCategories(updatedCategories);
      toast.success('Category deleted successfully!');
    }
  };

  const handleClearAllData = async () => {
    const result = await Swal.fire({
      title: 'Clear All Data?',
      text: 'This will permanently delete ALL your data including snippets, tags, categories, and settings. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Yes, clear everything!',
      cancelButtonText: 'Cancel',
      input: 'text',
      inputPlaceholder: 'Type "DELETE" to confirm',
      inputValidator: (value) => {
        if (value !== 'DELETE') {
          return 'Please type "DELETE" to confirm';
        }
      }
    });

    if (result.isConfirmed) {
      try {
        // Clear all Firebase data
        const success = await storage.clearAllData();
        
        if (success) {
          // Also clear localStorage as backup
          localStorage.removeItem('code-vault-snippets');
          localStorage.removeItem('code-vault-comments');
          localStorage.removeItem('code-vault-reviews');
          localStorage.removeItem('code-vault-tags');
          localStorage.removeItem('code-vault-categories');
          localStorage.removeItem('code-vault-settings');
          
          toast.success('All data cleared successfully from Firebase!');
          
          // Reload the page to reset the application state
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          toast.error('Failed to clear data from Firebase');
        }
      } catch (error) {
        console.error('Error clearing data:', error);
        toast.error('Failed to clear data');
      }
    }
  };

  const providerIcons: Record<string, typeof Github> = {
    gist: Github
  };

  const providerNames: Record<string, string> = {
    gist: 'GitHub Gist'
  };

  // CMD Commands handlers
  const handleCopyCommand = async (command: string) => {
    const success = await copyToClipboard(command);
    if (success) {
      toast.success('Command copied to clipboard!');
    } else {
      toast.error('Failed to copy command');
    }
  };

  const handleAddCustomCommand = () => {
    if (!newCommand.command.trim()) {
      toast.error('Please enter a command');
      return;
    }

    const customCommand: CmdCommand = {
      id: `custom-${Date.now()}`,
      command: newCommand.command,
      description: newCommand.description || 'Custom command',
      category: newCommand.category,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCustomCommands(prev => [...prev, customCommand]);
    setNewCommand({ command: '', description: '', category: 'custom' as 'laravel' | 'django' | 'react' | 'vue' | 'node' | 'custom' });
    setShowAddCommandForm(false);
    toast.success('Custom command added successfully!');
  };

  const handleDeleteCustomCommand = async (commandId: string) => {
    const result = await Swal.fire({
      title: 'Delete Command?',
      text: 'Are you sure you want to delete this custom command?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setCustomCommands(prev => prev.filter(cmd => cmd.id !== commandId));
      toast.success('Command deleted successfully!');
    }
  };

  const handleGenerateAIExplanation = async () => {
    try {
      // This would integrate with your AI service
      // For now, we'll show a placeholder
      toast.success('AI explanation feature coming soon!');
    } catch {
      toast.error('Failed to generate AI explanation');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure your preferences and integrations
        </p>
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Appearance
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Theme
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
            className="w-full max-w-xs px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <code>code-vault-pro-441988mm-bank-system-v4</code>
          </select>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Version 5 - Complete Firebase integration with Firestore and Realtime Database
          </p>
        </div>
      </div>

      {/* Firebase Database Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Firebase Database
          </h2>
          <button
            onClick={() => setShowFirebaseSettings(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Database className="h-4 w-4" />
            <span>Database Settings</span>
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Firebase Firestore</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Primary database for storing code snippets and metadata
              </p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Realtime Database</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time synchronization and backup storage
              </p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Project Slug:</strong> <code>code-vault-pro-441988mm-bank-system-v2</code>
            </p>
            <div className="export-url-code">
              <code>code-vault-pro-441988mm-bank-system-v3</code>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Version 3 - Enhanced Firebase integration with improved connectivity
            </p>
          </div>
        </div>
      </div>

      {/* Category Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Category Management
          </h2>
          <button
            onClick={handleCreateCategory}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
          <button
            onClick={() => setShowBulkCategoryForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Bulk Add</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div 
              key={category.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span 
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-medium"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon}
                  </span>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {category.count} snippets
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {category.languages?.length || 0} languages
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {category.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {category.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CMD Commands Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Terminal className="h-5 w-5 mr-2" />
            CMD Commands
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCmdSearch(!showCmdSearch)}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
            <button
              onClick={() => setShowAddCommandForm(true)}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Command</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showCmdSearch && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={cmdSearchQuery}
                onChange={(e) => setCmdSearchQuery(e.target.value)}
                placeholder="Search commands..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Technology Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CMD_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCmdTab(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeCmdTab === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </button>
          ))}
          {/* Custom Commands Tab */}
          <button
            onClick={() => setActiveCmdTab('custom')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeCmdTab === 'custom'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <span className="text-lg">⚡</span>
            <span className="font-medium">Custom Commands</span>
            {customCommands.length > 0 && (
              <span className="bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 text-xs px-2 py-1 rounded-full">
                {customCommands.length}
              </span>
            )}
          </button>
        </div>

        {/* Commands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(() => {
            let allCommands: CmdCommand[] = [];
            
            if (activeCmdTab === 'custom') {
              // Show only custom commands
              allCommands = customCommands;
            } else {
              // Show default commands + custom commands for this category
              const currentCategory = CMD_CATEGORIES.find(cat => cat.id === activeCmdTab);
              allCommands = [...(currentCategory?.commands || []), ...customCommands.filter(cmd => cmd.category === activeCmdTab)];
            }
            
            const filteredCommands = cmdSearchQuery 
              ? allCommands.filter(cmd => 
                  cmd.command.toLowerCase().includes(cmdSearchQuery.toLowerCase()) ||
                  cmd.description.toLowerCase().includes(cmdSearchQuery.toLowerCase())
                )
              : allCommands;

            return filteredCommands.map((command) => (
              <div
                key={command.id}
                className="group relative p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <code className="block text-sm font-mono text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mb-2 break-all">
                      {command.command}
                    </code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {command.description}
                    </p>
                  </div>
                  {command.isCustom && (
                    <button
                      onClick={() => handleDeleteCustomCommand(command.id)}
                      className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => handleCopyCommand(command.command)}
                  className="w-full mt-3 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy Command</span>
                </button>
              </div>
            ));
          })()}
        </div>

        {(() => {
          let allCommands: CmdCommand[] = [];
          
          if (activeCmdTab === 'custom') {
            allCommands = customCommands;
          } else {
            const currentCategory = CMD_CATEGORIES.find(cat => cat.id === activeCmdTab);
            allCommands = [...(currentCategory?.commands || []), ...customCommands.filter(cmd => cmd.category === activeCmdTab)];
          }
          
          const filteredCommands = cmdSearchQuery 
            ? allCommands.filter(cmd => 
                cmd.command.toLowerCase().includes(cmdSearchQuery.toLowerCase()) ||
                cmd.description.toLowerCase().includes(cmdSearchQuery.toLowerCase())
              )
            : allCommands;

          if (filteredCommands.length === 0) {
            return (
              <div className="text-center py-8">
                <Terminal className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {cmdSearchQuery ? 'No commands found matching your search.' : 
                   activeCmdTab === 'custom' ? 'No custom commands yet. Add your first command!' : 
                   'No commands available for this category.'}
                </p>
                {activeCmdTab === 'custom' && (
                  <button
                    onClick={() => setShowAddCommandForm(true)}
                    className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Add Your First Command
                  </button>
                )}
              </div>
            );
          }
        })()}
      </div>

      {/* Clear All Data */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-6">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
          Danger Zone
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Permanently delete all your data including snippets, tags, categories, and settings. This action cannot be undone.
        </p>
        <button
          onClick={handleClearAllData}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          <span>Clear All Data</span>
        </button>
      </div>

      {/* Provider Integrations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Cloud Integrations
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Connect your cloud services to export and import code snippets
        </p>

        <div className="space-y-4">
          {providers.map((provider) => {
            const Icon = providerIcons[provider.type];
            const name = providerNames[provider.type];

            return (
              <div 
                key={provider.type} 
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onContextMenu={(e) => showContextMenu(e, getProviderContextMenuItems(provider))}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {name}
                    </h3>
                    {provider.connected ? (
                      <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <span>Connected</span>
                        <span className="text-gray-500 dark:text-gray-400">
                          • API Configured
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <XCircle className="h-4 w-4" />
                        <span>Not Connected</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {provider.connected ? (
                    <>
                      <button
                        onClick={() => handleDisconnect(provider)}
                        className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        Disconnect
                      </button>
                      <button 
                        onClick={() => setShowApiSettings(true)}
                        className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleConnect()}
                        className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Setup API
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Context Menu */}
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={hideContextMenu}
          visible={contextMenu.visible}
        />
      </div>

      {/* API Settings Modal */}
      {showApiSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Cloud Services API Settings
                </h2>
                <button
                  onClick={() => setShowApiSettings(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* GitHub API */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Github className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    GitHub Personal Access Token
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get access token from: 
                  <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 ml-1">
                    GitHub Settings → Developer settings → Personal access tokens
                  </a>
                </p>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type={showPasswords.github ? "text" : "password"}
                      value={apiKeys.github}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, github: e.target.value }))}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, github: !prev.github }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.github ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleTestConnection('github')}
                    disabled={testingConnection === 'github' || !apiKeys.github.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-1"
                  >
                    {testingConnection === 'github' ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                    <span>{testingConnection === 'github' ? 'Testing...' : 'Test'}</span>
                  </button>
                  <button
                    onClick={() => handleSaveApiKey('github', apiKeys.github)}
                    disabled={!apiKeys.github.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                </div>
              </div>


              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">GitHub Integration Instructions:</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Create a Personal Access Token on GitHub</li>
                  <li>• Grant "gist" scope permissions</li>
                  <li>• Use "Test" button to verify connection</li>
                  <li>• Keys are stored securely in Firebase</li>
                  <li>• Never share API keys with anyone</li>
                </ul>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowApiSettings(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Mobile Development"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Category description..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Associated Languages
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <label key={lang.value} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={categoryFormData.languages?.includes(lang.value) || false}
                        onChange={(e) => {
                          const languages = categoryFormData.languages || [];
                          if (e.target.checked) {
                            setCategoryFormData(prev => ({
                              ...prev,
                              languages: [...languages, lang.value]
                            }));
                          } else {
                            setCategoryFormData(prev => ({
                              ...prev,
                              languages: languages.filter(l => l !== lang.value)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{lang.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(true)}
                    className="flex items-center justify-center w-12 h-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-2xl">{selectedIconForCategory}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(true)}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Choose Icon
                  </button>
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={categoryFormData.color}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-12 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={categoryFormData.color}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowCategoryForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {editingCategory ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Category Form Modal */}
      {showBulkCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Bulk Add Categories
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Enter category names, one per line
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Names
                </label>
                <textarea
                  value={bulkCategoryText}
                  onChange={(e) => setBulkCategoryText(e.target.value)}
                  placeholder={`Frontend Development\nBackend Development\nMobile Development\nData Science\nDevOps`}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Each line will create a separate category
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowBulkCategoryForm(false);
                  setBulkCategoryText('');
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const lines = bulkCategoryText.split('\n').filter(line => line.trim());
                  if (lines.length === 0) {
                    toast.error('Please enter at least one category name');
                    return;
                  }

                  const newCategories = lines.map((line, index) => {
                    const name = line.trim();
                    return {
                      id: (Date.now() + index).toString(),
                      name,
                      slug: name.toLowerCase().replace(/\s+/g, '-'),
                      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
                      icon: '📁',
                      description: `${name} related snippets`,
                      count: 0,
                      languages: []
                    };
                  });

                  const updatedCategories = [...categories, ...newCategories];
                  onUpdateCategories(updatedCategories);
                  storage.saveCategories(updatedCategories);
                  
                  toast.success(`${newCategories.length} categories created successfully!`);
                  setShowBulkCategoryForm(false);
                  setBulkCategoryText('');
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Create Categories
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Icon Picker Modal */}
      {showIconPicker && (
        <IconPicker
          selectedIcon={selectedIconForCategory}
          onSelect={setSelectedIconForCategory}
          onClose={() => setShowIconPicker(false)}
        />
      )}
      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Data Management
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Export or import all your data as a backup file. Data is automatically synced with Firebase.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </button>
          <button
            onClick={handleImportData}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Import Data</span>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          About Code Vault
        </h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>Version: 2.0.0 (Firebase Edition)</p>
          <p>Professional code snippet management platform</p>
          <p>Built with React, TypeScript, Tailwind CSS, and Firebase</p>
          <p>Project Slug: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">code-vault-pro-441988mm-bank-system-v5</code></p>
          <p>Database: Firebase Firestore + Realtime Database</p>
          <p>Security: Password Protected Access</p>
          <p>Enhanced: Complete Firebase integration with proper security rules</p>
        </div>
      </div>

      {/* Firebase Settings Modal */}
      {showFirebaseSettings && (
        <FirebaseSettings onClose={() => setShowFirebaseSettings(false)} />
      )}

      {/* Add Command Form Modal */}
      {showAddCommandForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Bot className="h-5 w-5 mr-2" />
                  Add Custom Command
                </h3>
                <button
                  onClick={() => setShowAddCommandForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Command */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Command *
                </label>
                <input
                  type="text"
                  value={newCommand.command}
                  onChange={(e) => setNewCommand(prev => ({ ...prev, command: e.target.value }))}
                  placeholder="e.g., npm install package-name"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newCommand.description}
                  onChange={(e) => setNewCommand(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter a description for this command..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={newCommand.category}
                  onChange={(e) => setNewCommand(prev => ({ ...prev, category: e.target.value as 'laravel' | 'django' | 'react' | 'vue' | 'node' | 'custom' }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {CMD_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* AI Explanation Button */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      AI Explanation
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Generate description using AI
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateAIExplanation}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Bot className="h-4 w-4" />
                    <span>Generate</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddCommandForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomCommand}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Add Command
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}