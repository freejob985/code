import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Code2, Tag, Star, MessageCircle, TrendingUp, Users, Globe, Lock, Copy, Edit, Trash2, Eye } from 'lucide-react';
import { CodeSnippet, Comment, Review, Statistics, Category } from '../types';
import { ContextMenu, useContextMenu } from './ContextMenu';
import { getLanguageCategory, getCategoryColor, getCategoryIcon, LANGUAGE_CATEGORIES } from '../utils/codeHighlight';
import toast from 'react-hot-toast';

interface DashboardProps {
  snippets: CodeSnippet[];
  comments: Comment[];
  reviews: Review[];
  categories?: Category[];
  onEditSnippet?: (snippet: CodeSnippet) => void;
  onDeleteSnippet?: (id: string) => void;
  onViewSnippet?: (snippet: CodeSnippet) => void;
}

export function Dashboard({ snippets, comments, reviews, categories = [], onEditSnippet, onDeleteSnippet, onViewSnippet }: DashboardProps) {
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const getSnippetContextMenuItems = (snippet: CodeSnippet) => [
    {
      id: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: () => onViewSnippet?.(snippet)
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: Edit,
      onClick: () => onEditSnippet?.(snippet)
    },
    {
      id: 'copy',
      label: 'Copy Code',
      icon: Copy,
      onClick: () => handleCopyCode(snippet.code)
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: () => onDeleteSnippet?.(snippet.id),
      separator: true
    }
  ];

  const stats: Statistics = useMemo(() => {
    const publicSnippets = snippets.filter(s => s.visibility === 'public').length;
    const privateSnippets = snippets.filter(s => s.visibility === 'private').length;
    const totalRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? totalRatings / reviews.length : 0;

    // Language distribution
    const languageCounts: { [key: string]: number } = {};
    snippets.forEach(snippet => {
      languageCounts[snippet.language] = (languageCounts[snippet.language] || 0) + 1;
    });

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
    const languageDistribution = Object.entries(languageCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));

    // Category distribution
    const categoryCounts: { [key: string]: number } = {};
    snippets.forEach(snippet => {
      const category = getLanguageCategory(snippet.language);
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([category, value]) => ({
        name: LANGUAGE_CATEGORIES[category as keyof typeof LANGUAGE_CATEGORIES]?.name || category,
        value,
        color: getCategoryColor(category),
        icon: getCategoryIcon(category)
      }));

    // Tag frequency
    const tagCounts: { [key: string]: number } = {};
    snippets.forEach(snippet => {
      snippet.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const tagFrequency = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    // Activity data (mock - in real app would be based on actual dates)
    const activityData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        created: Math.floor(Math.random() * 5),
        updated: Math.floor(Math.random() * 8),
        exported: Math.floor(Math.random() * 3)
      };
    });

    return {
      totalSnippets: snippets.length,
      publicSnippets,
      privateSnippets,
      totalTags: Object.keys(tagCounts).length,
      totalCategories: categories.length,
      averageRating,
      languageDistribution,
      categoryDistribution,
      tagFrequency,
      activityData
    };
  }, [snippets, comments, reviews, categories]);

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color = 'blue' 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    color?: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    };

    return (
      <div className={`p-6 rounded-xl border transition-colors ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          <Icon className="h-8 w-8 text-current opacity-60" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Overview of your code snippets and activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Snippets"
          value={stats.totalSnippets}
          subtitle={`${stats.publicSnippets} public, ${stats.privateSnippets} private`}
          icon={Code2}
          color="blue"
        />
        <StatCard
          title="Total Tags"
          value={stats.totalTags}
          subtitle="Unique tags used"
          icon={Tag}
          color="green"
        />
        <StatCard
          title="Categories"
          value={stats.totalCategories}
          subtitle="Code categories"
          icon={Tag}
          color="purple"
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          subtitle={`From ${reviews.length} reviews`}
          icon={Star}
          color="yellow"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.categoryDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {stats.categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Language Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Language Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.languageDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {stats.languageDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tag Frequency */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Most Used Tags
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.tagFrequency} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              stroke="#6B7280"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Activity Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Weekly Activity
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.activityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="created" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={{ fill: '#10B981' }}
              name="Created"
            />
            <Line 
              type="monotone" 
              dataKey="updated" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6' }}
              name="Updated"
            />
            <Line 
              type="monotone" 
              dataKey="exported" 
              stroke="#F59E0B" 
              strokeWidth={2}
              dot={{ fill: '#F59E0B' }}
              name="Exported"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Snippets
        </h3>
        <div className="space-y-3">
          {snippets.slice(0, 5).map((snippet) => (
            <div 
              key={snippet.id} 
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              onContextMenu={(e) => showContextMenu(e, getSnippetContextMenuItems(snippet))}
              onClick={() => onViewSnippet?.(snippet)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Code2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {snippet.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {snippet.language} • {new Date(snippet.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {snippet.visibility === 'public' ? (
                  <Globe className="h-4 w-4 text-green-500" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-400" />
                )}
                {snippet.isFavorite && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
              </div>
            </div>
          ))}
        </div>
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
  );
}