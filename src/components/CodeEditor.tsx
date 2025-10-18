import React, { useRef, useEffect } from 'react';
import { highlightCode, SUPPORTED_LANGUAGES } from '../utils/codeHighlight';
import { Copy, Eye, EyeOff, Maximize, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
  showLineNumbers?: boolean;
  maxHeight?: string;
  showFullscreenButton?: boolean;
}

export function CodeEditor({
  code,
  language,
  onChange,
  readOnly = false,
  showLineNumbers = true,
  maxHeight = '400px',
  showFullscreenButton = true
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  // Handle Escape key to close fullscreen
  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isFullscreen]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  useEffect(() => {
    if (preRef.current) {
      const highlighted = highlightCode(code, language);
      preRef.current.innerHTML = highlighted;
    }
  }, [code, language]);

  const lines = code.split('\n').length;
  const lineNumbers = Array.from({ length: lines }, (_, i) => i + 1);

  return (
    <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {SUPPORTED_LANGUAGES.find(l => l.value === language)?.label || language}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {lines} lines
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <Copy className="h-3 w-3" />
          <span>Copy</span>
        </button>
        {showFullscreenButton && (
          <button
            onClick={handleFullscreen}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Maximize className="h-3 w-3" />
            <span>Fullscreen</span>
          </button>
        )}
      </div>

      {/* Editor */}
      <div className="relative" style={{ maxHeight }}>
        <div className="flex overflow-auto">
          {/* Line Numbers */}
          {showLineNumbers && (
            <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-mono px-2 py-4 border-r border-gray-200 dark:border-gray-700 select-none">
              {lineNumbers.map(num => (
                <div key={num} className="h-5 flex items-center justify-end leading-5">
                  {num}
                </div>
              ))}
            </div>
          )}

          {/* Code Content */}
          <div className="flex-1 relative">
            {readOnly ? (
              <pre
                ref={preRef}
                className="p-4 text-sm font-mono leading-5 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 overflow-x-auto whitespace-pre"
                style={{ tabSize: 2 }}
              />
            ) : (
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={handleTextareaChange}
                  className="absolute inset-0 p-4 text-sm font-mono leading-5 text-transparent bg-transparent resize-none outline-none caret-gray-900 dark:caret-gray-100 overflow-hidden"
                  style={{ tabSize: 2 }}
                  spellCheck={false}
                />
                <pre
                  ref={preRef}
                  className="p-4 text-sm font-mono leading-5 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 overflow-x-auto whitespace-pre pointer-events-none"
                  style={{ tabSize: 2 }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col z-50">
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white">
                  {SUPPORTED_LANGUAGES.find(l => l.value === language)?.label || language}
                </span>
                <span className="text-xs text-gray-400">
                  {lines} lines
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </button>
              <button
                onClick={handleCloseFullscreen}
                className="flex items-center space-x-1 px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Fullscreen Code Content */}
          <div className="flex-1 overflow-hidden">
            <div className="flex h-full">
              {/* Line Numbers */}
              {showLineNumbers && (
                <div className="flex-shrink-0 bg-gray-800 text-gray-400 text-sm font-mono px-4 py-4 border-r border-gray-700 select-none overflow-y-auto">
                  {lineNumbers.map(num => (
                    <div key={num} className="h-6 flex items-center justify-end leading-6">
                      {num}
                    </div>
                  ))}
                </div>
              )}

              {/* Code Content */}
              <div className="flex-1 relative overflow-auto">
                {readOnly ? (
                  <pre
                    className="p-4 text-sm font-mono leading-6 text-gray-100 bg-gray-900 overflow-x-auto whitespace-pre h-full"
                    style={{ tabSize: 2 }}
                    dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }}
                  />
                ) : (
                  <div className="relative h-full">
                    <textarea
                      value={code}
                      onChange={handleTextareaChange}
                      className="absolute inset-0 p-4 text-sm font-mono leading-6 text-transparent bg-transparent resize-none outline-none caret-gray-100 overflow-auto"
                      style={{ tabSize: 2 }}
                      spellCheck={false}
                    />
                    <pre
                      className="p-4 text-sm font-mono leading-6 text-gray-100 bg-gray-900 overflow-x-auto whitespace-pre pointer-events-none h-full"
                      style={{ tabSize: 2 }}
                      dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fullscreen Footer */}
          <div className="p-4 bg-gray-900 border-t border-gray-700 flex items-center justify-between">
            <div className="text-xs text-gray-400">
              Press <kbd className="px-2 py-1 bg-gray-700 rounded text-white">Esc</kbd> to exit fullscreen
            </div>
            <div className="text-xs text-gray-400">
              {code.length} characters
            </div>
          </div>
        </div>
      )}
    </div>
  );
}