import { useState, useEffect } from 'react';
import { Terminal, Search, Plus, Copy, Trash2, Bot, XCircle, Save } from 'lucide-react';
import { CmdCommand } from '../types';
import { CMD_CATEGORIES, copyToClipboard } from '../utils/cmdCommands';
import { storage } from '../utils/storage';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface CmdCommandsProps {
  onClose?: () => void;
}

export function CmdCommands({ onClose }: CmdCommandsProps) {
  const [activeCmdTab, setActiveCmdTab] = useState<string>('laravel');
  const [cmdSearchQuery, setCmdSearchQuery] = useState('');
  const [showCmdSearch, setShowCmdSearch] = useState(false);
  const [showAddCommandForm, setShowAddCommandForm] = useState(false);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [customCommands, setCustomCommands] = useState<CmdCommand[]>([]);
  const [customCategories, setCustomCategories] = useState<Array<{id: string, name: string, icon: string, color: string}>>([]);
  const [newCommand, setNewCommand] = useState({
    command: '',
    description: '',
    category: 'laravel' as 'laravel' | 'django' | 'react' | 'vue' | 'node' | 'custom'
  });
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '⚡',
    color: '#8B5CF6'
  });

  // Load custom commands and categories on component mount
  useEffect(() => {
    const loadCustomData = async () => {
      try {
        const savedCommands = await storage.getSetting('custom_cmd_commands');
        const savedCategories = await storage.getSetting('custom_cmd_categories');
        
        if (savedCommands) {
          setCustomCommands(JSON.parse(savedCommands));
        }
        if (savedCategories) {
          setCustomCategories(JSON.parse(savedCategories));
        }
      } catch (error) {
        console.error('Failed to load custom data:', error);
      }
    };
    loadCustomData();
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

  // Save custom categories when they change
  useEffect(() => {
    const saveCustomCategories = async () => {
      try {
        await storage.saveSetting('custom_cmd_categories', JSON.stringify(customCategories));
      } catch (error) {
        console.error('Failed to save custom categories:', error);
      }
    };
    
    if (customCategories.length > 0) {
      saveCustomCategories();
    }
  }, [customCategories]);

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
    setNewCommand({ command: '', description: '', category: 'laravel' as 'laravel' | 'django' | 'react' | 'vue' | 'node' | 'custom' });
    setShowAddCommandForm(false);
    toast.success('Custom command added successfully!');
  };

  const handleAddCustomCategory = () => {
    if (!newCategory.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    const category = {
      id: `custom-${Date.now()}`,
      name: newCategory.name,
      icon: newCategory.icon,
      color: newCategory.color
    };

    setCustomCategories(prev => [...prev, category]);
    setNewCategory({ name: '', icon: '⚡', color: '#8B5CF6' });
    setShowAddCategoryForm(false);
    toast.success('Custom category added successfully!');
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

  const handleDeleteCustomCategory = async (categoryId: string) => {
    const result = await Swal.fire({
      title: 'Delete Category?',
      text: 'This will also delete all commands in this category. Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setCustomCategories(prev => prev.filter(cat => cat.id !== categoryId));
      setCustomCommands(prev => prev.filter(cmd => cmd.category !== categoryId));
      toast.success('Category deleted successfully!');
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

  // Get all categories (default + custom)
  const allCategories = [
    ...CMD_CATEGORIES,
    ...customCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
      icon: cat.icon,
      color: cat.color,
      commands: customCommands.filter(cmd => cmd.category === cat.id)
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <Terminal className="h-8 w-8 mr-3" />
          CMD Commands
        </h1>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Search and Add Buttons */}
      <div className="flex items-center justify-between">
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
          <button
            onClick={() => setShowAddCategoryForm(true)}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showCmdSearch && (
        <div>
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
      <div className="flex flex-wrap gap-2">
        {allCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCmdTab(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeCmdTab === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            style={activeCmdTab === category.id ? {} : { borderLeft: `4px solid ${category.color}` }}
          >
            <span className="text-lg">{category.icon}</span>
            <span className="font-medium">{category.name}</span>
            {category.commands && category.commands.length > 0 && (
              <span className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 text-xs px-2 py-1 rounded-full">
                {category.commands.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Commands Grid - Only Commands with Tooltips */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {(() => {
          let allCommands: CmdCommand[] = [];
          
          if (activeCmdTab === 'custom') {
            allCommands = customCommands;
          } else {
            const currentCategory = allCategories.find(cat => cat.id === activeCmdTab);
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
              className="group relative"
            >
              <button
                onClick={() => handleCopyCommand(command.command)}
                className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                title={command.description}
              >
                <code className="block text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                  {command.command}
                </code>
              </button>
              
              {command.isCustom && (
                <button
                  onClick={() => handleDeleteCustomCommand(command.id)}
                  className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ));
        })()}
      </div>

      {/* Empty State */}
      {(() => {
        let allCommands: CmdCommand[] = [];
        
        if (activeCmdTab === 'custom') {
          allCommands = customCommands;
        } else {
          const currentCategory = allCategories.find(cat => cat.id === activeCmdTab);
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
            <div className="text-center py-12">
              <Terminal className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {cmdSearchQuery ? 'No commands found matching your search.' : 
                 activeCmdTab === 'custom' ? 'No custom commands yet. Add your first command!' : 
                 'No commands available for this category.'}
              </p>
              {activeCmdTab === 'custom' && (
                <button
                  onClick={() => setShowAddCommandForm(true)}
                  className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Add Your First Command
                </button>
              )}
            </div>
          );
        }
      })()}

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
                  {allCategories.map((category) => (
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

      {/* Add Category Form Modal */}
      {showAddCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Custom Category
                </h3>
                <button
                  onClick={() => setShowAddCategoryForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Python, Go, Rust"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <input
                  type="text"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="e.g., 🐍, 🦀, ⚡"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-12 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddCategoryForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomCategory}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
