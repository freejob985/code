import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, Eye, Upload } from 'lucide-react';
import { CodeSnippet, Tag } from '../types';
import { CodeEditor } from './CodeEditor';
import { TagInput } from './TagInput';
import { SUPPORTED_LANGUAGES } from '../utils/codeHighlight';
import { Category } from '../types';
import { geminiAI } from '../utils/geminiAI';
import { buttonClasses } from '../utils/buttonStyles';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const snippetSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters'),
  code: z.string().min(1, 'Code is required'),
  language: z.string().min(1, 'Language is required'),
  category: z.string().optional(),
  visibility: z.enum(['private', 'unlisted', 'public']),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed'),
});

type SnippetFormData = z.infer<typeof snippetSchema>;

interface SnippetFormProps {
  snippet?: CodeSnippet;
  tags: Tag[];
  categories: Category[];
  existingSnippets?: CodeSnippet[];
  onSave: (data: Partial<CodeSnippet>) => void;
  onCancel: () => void;
  onExport?: (data: Partial<CodeSnippet>, provider: string) => void;
}

export function SnippetForm({ snippet, tags, categories, existingSnippets = [], onSave, onCancel, onExport }: SnippetFormProps) {
  const [previewMode, setPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Handle Escape key to close form
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onCancel]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<SnippetFormData>({
    resolver: zodResolver(snippetSchema),
    defaultValues: {
      title: snippet?.title || '',
      description: snippet?.description || '',
      code: snippet?.code || '',
      language: snippet?.language || 'javascript',
      category: snippet?.category || '',
      visibility: snippet?.visibility || 'private',
      tags: snippet?.tags || [],
    }
  });

  const watchedFields = watch();

  useEffect(() => {
    setIsDirty(true);
  }, [watchedFields]);

  const onSubmit = async (data: SnippetFormData) => {
    // Check for duplicate titles (excluding current snippet if editing)
    const titleExists = existingSnippets.some(existingSnippet => 
      existingSnippet.title.toLowerCase().trim() === data.title.toLowerCase().trim() && 
      (!snippet || existingSnippet.id !== snippet.id)
    );
    
    if (titleExists) {
      toast.error('A snippet with this title already exists. Please choose a different title.');
      return;
    }

    try {
      onSave(data);
      toast.success(snippet ? 'Snippet updated successfully!' : 'Snippet created successfully!');
    } catch (error) {
      toast.error('Failed to save snippet');
    }
  };

  const handleExport = async (provider: string) => {
    if (!onExport) return;
    
    const data = watch();
    try {
      const loadingToast = toast.loading(`Exporting to ${provider}...`);
      
      try {
        const result = await onExport(data, provider);
        toast.dismiss(loadingToast);
        
        if (result?.success && result?.url) {
          // Show success dialog with clickable link
          Swal.fire({
            title: 'تم التصدير بنجاح!',
            html: `
              <div class="text-center">
                <p class="mb-4">تم تصدير الكود الخاص بك بنجاح إلى ${provider === 'gist' ? 'GitHub Gist' : provider === 'drive' ? 'Google Drive' : 'Dropbox'}.</p>
                
                <div class="mb-4">
                  <a href="${result.url}" target="_blank" rel="noopener noreferrer"
                     class="export-link inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-decoration-none">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    عرض التصدير
                  </a>
                </div>
                
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رابط التصدير:</p>
                  <div class="export-url-code">
                    <a href="${result.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 break-all">
                      ${result.url}
                    </a>
                  </div>
                  <button onclick="navigator.clipboard.writeText('${result.url}').then(() => Swal.fire({title: 'تم النسخ!', text: 'تم نسخ الرابط إلى الحافظة', icon: 'success', timer: 2000, showConfirmButton: false}))" 
                          class="mt-2 px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                    نسخ الرابط
                  </button>
                </div>
              </div>
            `,
            icon: 'success',
            showConfirmButton: true,
            confirmButtonText: 'حسناً',
            showCloseButton: true,
            width: '600px',
            customClass: {
              htmlContainer: 'text-right'
            }
          });
          
          toast.success(`تم التصدير بنجاح إلى ${provider}!`);
        } else {
          toast.error(`فشل في التصدير إلى ${provider}`);
        }
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error(`فشل في التصدير إلى ${provider}`);
        console.error('Export failed:', error);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleAIGenerate = async () => {
    const code = watch('code');
    const language = watch('language');
    
    if (!code.trim()) {
      toast.error('Please enter some code first');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const result = await geminiAI.generateSnippetDetails(code, language);
      
      if (result) {
        // Only update empty fields
        if (!watch('title').trim()) {
          setValue('title', result.title);
        }
        if (!watch('description').trim()) {
          setValue('description', result.description);
        }
        if (watch('tags').length === 0) {
          setValue('tags', result.tags);
        }
        
        toast.success('AI suggestions applied successfully!');
      } else {
        toast.error('Failed to generate AI suggestions');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate AI suggestions');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto modal-content custom-scrollbar smooth-scroll">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {snippet ? 'Edit Snippet' : 'Create New Snippet'}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                    previewMode
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={isGeneratingAI}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                    isGeneratingAI
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 cursor-not-allowed'
                      : 'text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 hover:text-purple-700 dark:hover:text-purple-300'
                  }`}
                >
                  {isGeneratingAI ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>AI Complete</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title * 
                  <span className="text-xs text-gray-500 ml-1">(AI can auto-complete)</span>
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter snippet title..."
                />
                {errors.title && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language *
                </label>
                <select
                  {...register('language')}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                {errors.language && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.language.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description 
                <span className="text-xs text-gray-500 ml-1">(AI can auto-complete)</span>
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what this code does..."
              />
              {errors.description && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags 
                <span className="text-xs text-gray-500 ml-1">(AI can auto-complete)</span>
              </label>
              <TagInput
                tags={watch('tags')}
                suggestions={tags.map(t => t.name)}
                onChange={(newTags) => setValue('tags', newTags)}
                placeholder="Add tags to organize your code..."
              />
              {errors.tags && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.tags.message}</p>
              )}
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Visibility
              </label>
              <div className="flex space-x-4">
                {[
                  { value: 'private', label: 'Private', description: 'Only you can see this' },
                  { value: 'unlisted', label: 'Unlisted', description: 'Anyone with the link can see this' },
                  { value: 'public', label: 'Public', description: 'Anyone can discover and see this' }
                ].map((option) => (
                  <label key={option.value} className="flex items-start space-x-2 cursor-pointer">
                    <input
                      {...register('visibility')}
                      type="radio"
                      value={option.value}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Code * 
                <span className="text-xs text-purple-600 dark:text-purple-400 ml-1">(Enter code first, then use AI Complete)</span>
              </label>
              {previewMode ? (
                <CodeEditor
                  code={watch('code')}
                  language={watch('language')}
                  readOnly={true}
                />
              ) : (
                <CodeEditor
                  code={watch('code')}
                  language={watch('language')}
                  onChange={(code) => setValue('code', code)}
                />
              )}
              {errors.code && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.code.message}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              {onExport && (
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Export to:</span>
                  {['gist'].map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => handleExport(provider)}
                      className={`${buttonClasses.secondarySm} flex items-center space-x-1`}
                    >
                      <Upload className="h-3 w-3" />
                      <span>GitHub</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className={buttonClasses.secondary}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${buttonClasses.primary} flex items-center space-x-2`}
              >
                <Save className="h-4 w-4" />
                <span>{isSubmitting ? 'Saving...' : snippet ? 'Update' : 'Create'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}