import React, { useState, useMemo } from 'react';
import { Search, Star, Globe, Lock, Eye, Edit, Trash2, Upload, Copy, Heart, X } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CodeSnippet, Tag, Category, Comment } from '../types';
import { CodeEditor } from './CodeEditor';
import { TagInput } from './TagInput';
import { ContextMenu, useContextMenu } from './ContextMenu';
import { CommentsSection } from './CommentsSection';
import { SUPPORTED_LANGUAGES, getLanguageCategory, getCategoryColor, getCategoryIcon, LANGUAGE_CATEGORIES } from '../utils/codeHighlight';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface FavoritesPageProps {
  snippets: CodeSnippet[];
  tags: Tag[];
  categories: Category[];
  comments: Comment[];
  onEditSnippet: (snippet: CodeSnippet) => void;
  onDeleteSnippet: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onExportSnippet: (snippet: CodeSnippet, provider: string) => void;
  onCommentsUpdate: (comments: Comment[]) => void;
}

const ITEMS_PER_PAGE = 12;

export function FavoritesPage({
  snippets,
  tags,
  categories,
  comments,
  onEditSnippet,
  onDeleteSnippet,
  onToggleFavorite,
  onExportSnippet,
  onCommentsUpdate
}: FavoritesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();

  // Filter favorite snippets only
  const favoriteSnippets = useMemo(() => {
    return snippets
      .filter(snippet => snippet.isFavorite)
      .filter(snippet => {
        // Text search
        if (searchQuery && searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchesTitle = snippet.title.toLowerCase().includes(query);
          const matchesDescription = snippet.description.toLowerCase().includes(query);
          const matchesCode = snippet.code.toLowerCase().includes(query);
          const matchesLanguage = snippet.language.toLowerCase().includes(query);
          const matchesTags = snippet.tags.some(tag => tag.toLowerCase().includes(query));
          
          if (!matchesTitle && !matchesDescription && !matchesCode && !matchesLanguage && !matchesTags) {
            return false;
          }
        }

        // Language filter
        if (selectedLanguage && snippet.language !== selectedLanguage) {
          return false;
        }

        // Category filter
        if (selectedCategory) {
          const snippetCategory = getLanguageCategory(snippet.language);
          if (snippetCategory !== selectedCategory) {
            return false;
          }
        }

        // Tag filter
        if (selectedTags.length > 0) {
          if (!selectedTags.every(tag => snippet.tags.includes(tag))) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [snippets, searchQuery, selectedLanguage, selectedCategory, selectedTags]);

  // Pagination calculations
  const totalPages = Math.ceil(favoriteSnippets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentFavorites = favoriteSnippets.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLanguage, selectedCategory, selectedTags]);

  // Get available languages for selected category
  const availableLanguages = useMemo(() => {
    if (!selectedCategory) {
      return SUPPORTED_LANGUAGES;
    }
    
    const categoryData = LANGUAGE_CATEGORIES[selectedCategory as keyof typeof LANGUAGE_CATEGORIES];
    if (!categoryData) {
      return SUPPORTED_LANGUAGES;
    }
    
    return SUPPORTED_LANGUAGES.filter(lang => 
      categoryData.languages.includes(lang.value)
    );
  }, [selectedCategory]);

  const handleDeleteSnippet = async (snippet: CodeSnippet) => {
    // Validate snippet ID before attempting deletion
    if (!snippet.id || snippet.id.trim() === '') {
      toast.error('Cannot delete snippet: Invalid ID');
      return;
    }

    const result = await Swal.fire({
      title: 'Delete Snippet?',
      text: `Are you sure you want to delete "${snippet.title}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      onDeleteSnippet(snippet.id);
    }
  };

  const handleExport = async (snippet: CodeSnippet) => {
    try {
      const { value: provider } = await Swal.fire({
        title: 'Export to Platform',
        text: 'Choose where to export this snippet:',
        input: 'select',
        inputOptions: {
          'gist': 'GitHub Gist'
        },
        inputPlaceholder: 'Select a platform',
        showCancelButton: true,
        confirmButtonText: 'Export',
        cancelButtonText: 'Cancel'
      });

      if (provider) {
        try {
          const loadingToast = toast.loading(`Exporting to ${provider}...`);
          
          try {
            const result = await onExportSnippet(snippet, provider);
            toast.dismiss(loadingToast);
            
            if (result?.success && result?.url) {
              Swal.fire({
                title: 'Export Successful!',
                html: `
                  <div class="text-center">
                    <p class="mb-4">"${snippet.title}" has been successfully exported to GitHub Gist.</p>
                    
                    <div class="mb-4">
                      <a href="${result.url}" target="_blank" rel="noopener noreferrer"
                         class="export-link inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-decoration-none">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                        View Export
                      </a>
                    </div>
                    
                    <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Export Link:</p>
                      <div class="export-url-code">
                        <a href="${result.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 break-all">
                          ${result.url}
                        </a>
                      </div>
                      <button onclick="navigator.clipboard.writeText('${result.url}').then(() => Swal.fire({title: 'Copied!', text: 'Link copied to clipboard', icon: 'success', timer: 2000, showConfirmButton: false}))" 
                              class="mt-2 px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        Copy Link
                      </button>
                    </div>
                  </div>
                `,
                icon: 'success',
                showConfirmButton: true,
                confirmButtonText: 'OK',
                showCloseButton: true,
                width: '600px',
                customClass: {
                  htmlContainer: 'text-left'
                }
              });
              
              toast.success(`Successfully exported to ${provider}!`);
            } else {
              toast.error(`Failed to export to ${provider}`);
            }
          } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(`Failed to export to ${provider}`);
            console.error('Export failed:', error);
          }
        } catch (error) {
          console.error('Export failed:', error);
          toast.error('Export failed due to an unexpected error');
        }
      }
    } catch (error) {
      console.error('Export dialog failed:', error);
      toast.error('Failed to open export dialog');
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const getContextMenuItems = (snippet: CodeSnippet) => [
    {
      id: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: () => setSelectedSnippet(snippet)
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: Edit,
      onClick: () => onEditSnippet(snippet)
    },
    {
      id: 'copy',
      label: 'Copy Code',
      icon: Copy,
      onClick: () => handleCopyCode(snippet.code)
    },
    {
      id: 'unfavorite',
      label: 'Remove from Favorites',
      icon: Heart,
      onClick: () => onToggleFavorite(snippet.id)
    },
    {
      id: 'export',
      label: 'Export',
      icon: Upload,
      onClick: () => handleExport(snippet),
      separator: true
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: () => handleDeleteSnippet(snippet)
    }
  ];

  const Pagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, favoriteSnippets.length)}</span> of <span className="font-medium">{favoriteSnippets.length}</span> results
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>
          
          <div className="flex items-center space-x-1">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={`page-${page}-${index}`}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => setCurrentPage(page as number)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <Star className="h-8 w-8 text-yellow-500 fill-current" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Favorites</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {favoriteSnippets.length} favorite snippets
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedLanguage(''); // Reset language when category changes
            }}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {Object.entries(LANGUAGE_CATEGORIES).map(([key, category]) => (
              <option key={key} value={key}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>

          {/* Language Filter */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Languages</option>
            {availableLanguages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label} ({lang.framework})
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedLanguage('');
              setSelectedCategory('');
              setSelectedTags([]);
            }}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Tag Filter */}
        <div className="mt-4">
          <TagInput
            tags={selectedTags}
            suggestions={tags.map(t => t.name)}
            onChange={setSelectedTags}
            placeholder="Filter by tags..."
          />
        </div>
      </div>

      {/* Favorites Grid */}
      {currentFavorites.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentFavorites.map((snippet) => (
            <div
              key={snippet.id}
              onContextMenu={(e) => showContextMenu(e, getContextMenuItems(snippet))}
              onClick={async (e) => {
                // Check if clicked element is not a button or interactive element
                const target = e.target as HTMLElement;
                if (!target.closest('button') && !target.closest('a')) {
                  // Copy code and show details
                  await handleCopyCode(snippet.code);
                  setTimeout(() => {
                    setSelectedSnippet(snippet);
                  }, 300);
                }
              }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            >
              {/* Header */}
              <div 
                className="p-4 border-b border-gray-200 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getCategoryColor(getLanguageCategory(snippet.language)) }}
                      >
                        <span className="mr-1">{getCategoryIcon(getLanguageCategory(snippet.language))}</span>
                        {LANGUAGE_CATEGORIES[getLanguageCategory(snippet.language) as keyof typeof LANGUAGE_CATEGORIES]?.name || 'Other'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {snippet.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {SUPPORTED_LANGUAGES.find(l => l.value === snippet.language)?.label || snippet.language} • {new Date(snippet.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    {snippet.visibility === 'public' ? (
                      <Globe className="h-4 w-4 text-green-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Copy indicator */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1 shadow-lg">
                    <Copy className="h-3 w-3" />
                    <span>Copy & View</span>
                  </div>
                </div>

                {/* Tags */}
                {snippet.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {snippet.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {snippet.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                        +{snippet.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              {snippet.description && (
                <div 
                  className="p-4 border-b border-gray-200 dark:border-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {snippet.description}
                  </p>
                </div>
              )}

              {/* Code Preview */}
              <div 
                className="p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <CodeEditor
                  code={snippet.code.slice(0, 200) + (snippet.code.length > 200 ? '\n...' : '')}
                  language={snippet.language}
                  readOnly={true}
                  showLineNumbers={false}
                  maxHeight="150px"
                  showFullscreenButton={false}
                />
              </div>

              {/* Actions */}
              <div 
                className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>{snippet.rating.toFixed(1)}</span>
                  </span>
                  <span>{snippet.commentCount} comments</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setSelectedSnippet(snippet)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEditSnippet(snippet)}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onToggleFavorite(snippet.id)}
                    className="p-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900 rounded transition-colors"
                    title="Remove from Favorites"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                  <button
                    onClick={() => handleDeleteSnippet(snippet)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          {/* Pagination */}
          <Pagination />

          <div className="text-gray-400 mb-4">
            <Star className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No favorite snippets
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery || selectedLanguage || selectedCategory || selectedTags.length > 0
              ? 'No favorite snippets match the selected filters.'
              : 'You haven\'t added any snippets to favorites yet. Start by adding stars to snippets you want to save.'}
          </p>
          {(searchQuery || selectedLanguage || selectedCategory || selectedTags.length > 0) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLanguage('');
                setSelectedCategory('');
                setSelectedTags([]);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Pagination for favorites */}
      {currentFavorites.length > 0 && <Pagination />}

      {/* Context Menu */}
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        items={contextMenu.items}
        onClose={hideContextMenu}
        visible={contextMenu.visible}
      />

      {/* Snippet Detail Modal */}
      {selectedSnippet && (
        <SnippetDetailModal
          snippet={selectedSnippet}
          onClose={() => setSelectedSnippet(null)}
          onEdit={onEditSnippet}
          onDelete={handleDeleteSnippet}
          onToggleFavorite={onToggleFavorite}
          onExportSnippet={onExportSnippet}
          comments={comments}
          onCommentsUpdate={onCommentsUpdate}
        />
      )}
    </div>
  );
}

function SnippetDetailModal({
  snippet,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onExportSnippet,
  comments,
  onCommentsUpdate
}: {
  snippet: CodeSnippet;
  onClose: () => void;
  onEdit: (snippet: CodeSnippet) => void;
  onDelete: (snippet: CodeSnippet) => void;
  onToggleFavorite: (id: string) => void;
  onExportSnippet: (snippet: CodeSnippet, provider: string) => void;
  comments: Comment[];
  onCommentsUpdate: (comments: Comment[]) => void;
}) {
  // Handle Escape key to close modal
  React.useEffect(() => {
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

  const handleCopyFullCode = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      toast.success('Full code copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const handleExportSnippet = async () => {
    try {
      const loadingToast = toast.loading('Exporting to GitHub Gist...');
      
      try {
        const result = await onExportSnippet(snippet, 'gist');
        toast.dismiss(loadingToast);
        
        if (result?.success && result?.url) {
          // Show success dialog with clickable link
          Swal.fire({
            title: 'Export Successful!',
            html: `
              <div class="text-center">
                <p class="mb-4">"${snippet.title}" has been successfully exported to GitHub Gist.</p>
                
                <div class="mb-4">
                  <a href="${result.url}" target="_blank" rel="noopener noreferrer"
                     class="export-link inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-decoration-none">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    View Export
                  </a>
                </div>
                
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Export Link:</p>
                  <div class="export-url-code">
                    <a href="${result.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 break-all">
                      ${result.url}
                    </a>
                  </div>
                  <button onclick="navigator.clipboard.writeText('${result.url}').then(() => Swal.fire({title: 'Copied!', text: 'Link copied to clipboard', icon: 'success', timer: 2000, showConfirmButton: false}))" 
                          class="mt-2 px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                    Copy Link
                  </button>
                </div>
              </div>
            `,
            icon: 'success',
            showConfirmButton: true,
            confirmButtonText: 'OK',
            showCloseButton: true,
            width: '600px',
            customClass: {
              htmlContainer: 'text-left'
            }
          });
          
          toast.success('Successfully exported to GitHub Gist!');
        } else {
          toast.error('Failed to export to GitHub Gist');
        }
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error('Failed to export to GitHub Gist');
        console.error('Export failed:', error);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full code-detail-modal">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {snippet.title}
                </h2>
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {snippet.language} • {new Date(snippet.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportSnippet}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded transition-colors"
                title="Export to GitHub Gist"
              >
                <Upload className="h-4 w-4" />
              </button>
              <button
                onClick={handleCopyFullCode}
                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900 rounded transition-colors"
                title="Copy Full Code"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tags */}
          {snippet.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {snippet.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {snippet.description && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Description
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {snippet.description}
            </p>
          </div>
        )}

        {/* Code */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Code
          </h3>
          <div className="code-content">
            <CodeEditor
              code={snippet.code}
              language={snippet.language}
              readOnly={true}
              maxHeight="500px"
              showFullscreenButton={true}
            />
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <CommentsSection
            snippetId={snippet.id}
            comments={comments}
            onCommentsUpdate={onCommentsUpdate}
          />
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={handleExportSnippet}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Export to GitHub</span>
          </button>
          <button
            onClick={handleCopyFullCode}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Copy className="h-4 w-4" />
            <span>Copy Code</span>
          </button>
          <button
            onClick={() => onToggleFavorite(snippet.id)}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Heart className="h-4 w-4" />
            <span>Remove from Favorites</span>
          </button>
          <button
            onClick={() => {
              onEdit(snippet);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => {
              onDelete(snippet);
              onClose();
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}