import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Edit, Trash2, Link, Image, Eye, EyeOff, User, Calendar, Reply, Info } from 'lucide-react';
import { Comment } from '../types';
import { storage } from '../utils/storage';
import DOMPurify from 'dompurify';
import toast from 'react-hot-toast';

interface CommentsSectionProps {
  snippetId: string;
  comments: Comment[];
  onCommentsUpdate: (comments: Comment[]) => void;
}

export function CommentsSection({ snippetId, comments, onCommentsUpdate }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [authorName, setAuthorName] = useState('Anonymous');

  // Load author name from storage
  useEffect(() => {
    const loadAuthorName = async () => {
      try {
        const savedName = await storage.getSetting('comment_author_name');
        if (savedName && savedName.trim()) {
          setAuthorName(savedName.trim());
        }
      } catch (error) {
        console.warn('Failed to load comment author name:', error);
        // Keep default value 'Anonymous'
      }
    };
    loadAuthorName();
  }, []);

  // Save author name to storage
  const saveAuthorName = async (name: string) => {
    await storage.saveSetting('comment_author_name', name);
    setAuthorName(name);
  };

  // Filter comments for this snippet
  const snippetComments = comments.filter(c => c.snippetId === snippetId);

  // Process comment content to make links clickable and show images
  const processCommentContent = (content: string): string => {
    let processed = content;
    
    // Make URLs clickable
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    processed = processed.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="comment-link">$1</a>');
    
    // Convert image URLs to images
    const imageRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg))/gi;
    processed = processed.replace(imageRegex, '<div class="comment-image-container"><img src="$1" alt="Comment image" class="comment-image" loading="lazy" /></div>');
    
    // Make email addresses clickable
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    processed = processed.replace(emailRegex, '<a href="mailto:$1" class="comment-link">$1</a>');
    
    // Convert line breaks to <br>
    processed = processed.replace(/\n/g, '<br>');
    
    return DOMPurify.sanitize(processed, {
      ALLOWED_TAGS: ['a', 'br', 'img', 'div', 'strong', 'em', 'code'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'loading']
    });
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (!authorName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    const comment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      snippetId,
      author: authorName,
      content: newComment.trim(),
      status: 'visible',
      createdAt: new Date().toISOString()
    };

    try {
      const updatedComments = [...comments, comment];
      await storage.saveComments(updatedComments);
      onCommentsUpdate(updatedComments);
      setNewComment('');
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) {
      toast.error('Please enter comment content');
      return;
    }

    try {
      const updatedComments = comments.map(c => 
        c.id === commentId 
          ? { ...c, content: editContent.trim() }
          : c
      );
      await storage.saveComments(updatedComments);
      onCommentsUpdate(updatedComments);
      setEditingComment(null);
      setEditContent('');
      toast.success('Comment updated successfully!');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const updatedComments = comments.filter(c => c.id !== commentId);
      await storage.saveComments(updatedComments);
      onCommentsUpdate(updatedComments);
      toast.success('Comment deleted successfully!');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  return (
    <div className="comments-section">
      {/* Comments Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          Comments ({snippetComments.length})
        </h3>
      </div>

      {/* Add New Comment */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => saveAuthorName(e.target.value)}
            placeholder="Enter your name..."
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Comment Content
            </label>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showPreview ? 'Edit' : 'Preview'}</span>
            </button>
          </div>

          {showPreview ? (
            <div className="min-h-[100px] p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
              {newComment.trim() ? (
                <div 
                  className="comment-content"
                  dangerouslySetInnerHTML={{ __html: processCommentContent(newComment) }}
                />
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">Preview will appear here...</p>
              )}
            </div>
          ) : (
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment here... You can include links and image URLs!"
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
            />
          )}
        </div>

        {/* Help Text */}
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Formatting Tips:</p>
              <ul className="space-y-1 text-xs">
                <li>• <strong>Links:</strong> Just paste any URL (https://example.com)</li>
                <li>• <strong>Images:</strong> Paste image URLs ending with .jpg, .png, .gif, etc.</li>
                <li>• <strong>Email:</strong> user@example.com will become clickable</li>
                <li>• <strong>Line breaks:</strong> Press Enter for new lines</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <Link className="h-3 w-3 mr-1" />
              Auto-link URLs
            </span>
            <span className="flex items-center">
              <Image className="h-3 w-3 mr-1" />
              Auto-show images
            </span>
          </div>
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim() || !authorName.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send className="h-4 w-4" />
            <span>Add Comment</span>
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {snippetComments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          snippetComments
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((comment) => (
              <div key={comment.id} className="comment-card">
                {/* Comment Header */}
                <div className="comment-header">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="comment-author">{comment.author}</p>
                      <p className="comment-date">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="comment-actions">
                    <button
                      onClick={() => startEdit(comment)}
                      className="comment-action-btn edit"
                      title="Edit comment"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="comment-action-btn delete"
                      title="Delete comment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Comment Content */}
                {editingComment === comment.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="comment-content"
                    dangerouslySetInnerHTML={{ __html: processCommentContent(comment.content) }}
                  />
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
}