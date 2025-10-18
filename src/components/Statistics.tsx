import React, { useState, useEffect } from 'react';
import { Activity, Code2, Star, Terminal, Tag, Folder, TrendingUp, BarChart3, PieChart, Users, Clock, Download } from 'lucide-react';
import { CodeSnippet, Comment, Review, Tag as TagType, Category, CmdCommand } from '../types';
import { storage } from '../utils/storage';
import { CMD_CATEGORIES } from '../utils/cmdCommands';

interface StatisticsProps {
  snippets: CodeSnippet[];
  comments: Comment[];
  reviews: Review[];
  tags: TagType[];
  categories: Category[];
}

export function Statistics({ snippets, comments, reviews, tags, categories }: StatisticsProps) {
  const [customCommands, setCustomCommands] = useState<CmdCommand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomCommands = async () => {
      try {
        const savedCommands = await storage.getSetting('custom_cmd_commands');
        if (savedCommands) {
          setCustomCommands(JSON.parse(savedCommands));
        }
      } catch (error) {
        console.error('Failed to load custom commands:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCustomCommands();
  }, []);

  // Calculate statistics
  const totalSnippets = snippets.length;
  const publicSnippets = snippets.filter(s => s.visibility === 'public').length;
  const privateSnippets = snippets.filter(s => s.visibility === 'private').length;
  const favoriteSnippets = snippets.filter(s => s.isFavorite).length;
  const totalComments = comments.length;
  const totalReviews = reviews.length;
  const totalTags = tags.length;
  const totalCategories = categories.length;
  
  // Command statistics
  const allCommands = [...CMD_CATEGORIES.flatMap(cat => cat.commands), ...customCommands];
  const totalCommands = allCommands.length;
  const customCommandsCount = customCommands.length;
  const defaultCommandsCount = totalCommands - customCommandsCount;

  // Language distribution
  const languageDistribution = snippets.reduce((acc, snippet) => {
    acc[snippet.language] = (acc[snippet.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topLanguages = Object.entries(languageDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([language, count]) => ({ name: language, value: count }));

  // Category distribution
  const categoryDistribution = categories.map(cat => ({
    name: cat.name,
    value: cat.count,
    color: cat.color,
    icon: cat.icon
  }));

  // Command category distribution
  const commandCategoryDistribution = CMD_CATEGORIES.map(cat => ({
    name: cat.name,
    value: cat.commands.length,
    color: cat.color,
    icon: cat.icon
  }));

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentSnippets = snippets.filter(s => 
    new Date(s.createdAt) > sevenDaysAgo
  ).length;

  const recentComments = comments.filter(c => 
    new Date(c.createdAt) > sevenDaysAgo
  ).length;

  const recentCommands = customCommands.filter(c => 
    new Date(c.createdAt) > sevenDaysAgo
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <Activity className="h-8 w-8 mr-3" />
          Statistics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Overview of your code snippets and commands usage
        </p>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Snippets */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Snippets</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalSnippets}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Code2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
            <span className="text-green-600 dark:text-green-400 font-medium">{publicSnippets} public</span>
            <span className="mx-2">•</span>
            <span className="text-gray-500 dark:text-gray-500">{privateSnippets} private</span>
          </div>
        </div>

        {/* Total Commands */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Commands</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalCommands}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Terminal className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
            <span className="text-blue-600 dark:text-blue-400 font-medium">{defaultCommandsCount} default</span>
            <span className="mx-2">•</span>
            <span className="text-purple-600 dark:text-purple-400 font-medium">{customCommandsCount} custom</span>
          </div>
        </div>

        {/* Favorites */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Favorites</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{favoriteSnippets}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {totalSnippets > 0 ? Math.round((favoriteSnippets / totalSnippets) * 100) : 0}% of total snippets
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Activity</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{recentSnippets + recentComments + recentCommands}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Last 7 days
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Language Distribution
          </h3>
          <div className="space-y-3">
            {topLanguages.map((lang, index) => (
              <div key={lang.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{lang.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${(lang.value / totalSnippets) * 100}%`,
                        backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">{lang.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Command Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Command Categories
          </h3>
          <div className="space-y-3">
            {commandCategoryDistribution.map((cat, index) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${(cat.value / totalCommands) * 100}%`,
                        backgroundColor: cat.color
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">{cat.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tags */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Tags
            </h3>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalTags}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Unique tags used across all snippets
          </p>
        </div>

        {/* Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Folder className="h-5 w-5 mr-2" />
              Categories
            </h3>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{totalCategories}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Organized snippet categories
          </p>
        </div>

        {/* Comments & Reviews */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Engagement
            </h3>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalComments + totalReviews}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {totalComments} comments • {totalReviews} reviews
          </p>
        </div>
      </div>

      {/* Recent Activity Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recent Activity (Last 7 Days)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{recentSnippets}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">New Snippets</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{recentComments}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">New Comments</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{recentCommands}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">New Commands</div>
          </div>
        </div>
      </div>
    </div>
  );
}
