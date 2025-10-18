import React, { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  suggestions?: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export function TagInput({
  tags,
  suggestions = [],
  onChange,
  placeholder = "Add tags...",
  maxTags = 10
}: TagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestion, setFocusedSuggestion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(input.toLowerCase()) &&
      !tags.includes(suggestion)
    )
    .slice(0, 5);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onChange([...tags, trimmedTag]);
      setInput('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (showSuggestions && filteredSuggestions[focusedSuggestion]) {
          addTag(filteredSuggestions[focusedSuggestion]);
        } else if (input.trim()) {
          addTag(input);
        }
        break;
      case 'Backspace':
        if (input === '' && tags.length > 0) {
          removeTag(tags[tags.length - 1]);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedSuggestion(prev => 
          Math.min(prev + 1, filteredSuggestions.length - 1)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedSuggestion(prev => Math.max(prev - 1, 0));
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    setShowSuggestions(value.length > 0);
    setFocusedSuggestion(0);
  };

  useEffect(() => {
    setShowSuggestions(false);
  }, [tags]);

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(input.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-gray-900 dark:text-gray-100"
          disabled={tags.length >= maxTags}
        />
        
        {tags.length < maxTags && (
          <Plus className="h-4 w-4 text-gray-400" />
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className={`w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                index === focusedSuggestion
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {tags.length >= maxTags && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
          Maximum {maxTags} tags allowed
        </p>
      )}
    </div>
  );
}