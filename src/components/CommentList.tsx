import React, { useState, useMemo } from 'react';
import type { DocumentComment } from '../types';
import { useDocumentContext } from '../hooks/useDocumentContext';
import { useCommentFilterContext } from '../hooks/useCommentFilterContext';

export type SortOption = 'date-desc' | 'date-asc' | 'author-asc' | 'author-desc';

interface CommentListProps {
  className?: string;
}

/**
 * CommentList component for displaying extracted comments from documents
 */
export const CommentList: React.FC<CommentListProps> = ({ className = '' }) => {
  const { documents, activeDocumentId, selectedDocumentIds, comments, selectedCommentId, setSelectedComment } = useDocumentContext();
  const { getFilteredComments } = useCommentFilterContext();
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  // Filter comments based on selected document(s)
  const selectedComments = useMemo(() => {
    // If there are selected documents, show comments from those
    if (selectedDocumentIds.length > 0) {
      return comments.filter(comment => selectedDocumentIds.includes(comment.documentId));
    }
    
    // Fall back to activeDocumentId for backward compatibility
    if (activeDocumentId) {
      return comments.filter(comment => comment.documentId === activeDocumentId);
    }
    
    // If no documents are selected, show no comments
    return [];
  }, [comments, selectedDocumentIds, activeDocumentId]);

  // Apply comment filters to the selected comments
  const filteredComments = useMemo(() => {
    return getFilteredComments(selectedComments);
  }, [selectedComments, getFilteredComments]);

  // Sort comments based on selected option
  const sortedComments = useMemo(() => {
    const sorted = [...filteredComments];
    
    switch (sortBy) {
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'author-asc':
        return sorted.sort((a, b) => a.author.localeCompare(b.author));
      case 'author-desc':
        return sorted.sort((a, b) => b.author.localeCompare(a.author));
      default:
        return sorted;
    }
  }, [filteredComments, sortBy]);

  // Get document name for grouping display
  const getDocumentName = (documentId: string): string => {
    const doc = documents.find(d => d.id === documentId);
    return doc?.name || 'Unknown Document';
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  // Handle comment selection
  const handleCommentClick = (commentId: string) => {
    setSelectedComment(commentId === selectedCommentId ? null : commentId);
  };

  // Get comment by ID or paraId
  const getCommentById = (idOrParaId: string): DocumentComment | null => {
    // First try to find by regular ID
    let comment = sortedComments.find(c => c.id === idOrParaId);
    if (comment) return comment;
    
    // Try to find by paraId
    comment = sortedComments.find(c => c.paraId === idOrParaId);
    return comment || null;
  };

  // Navigate to a specific comment
  const navigateToComment = (commentId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering parent click
    setSelectedComment(commentId);
    
    // Scroll to the comment
    setTimeout(() => {
      const element = document.getElementById(`comment-${commentId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Group comments by document if showing multiple documents
  const groupedComments = useMemo(() => {
    // If we have selected documents or activeDocumentId, group appropriately
    const isShowingMultiple = selectedDocumentIds.length > 1;
    
    if (!isShowingMultiple && (selectedDocumentIds.length === 1 || activeDocumentId)) {
      // Single document view
      const singleDocId = selectedDocumentIds.length === 1 ? selectedDocumentIds[0] : activeDocumentId!;
      return { [singleDocId]: sortedComments };
    }
    
    // Multiple documents view
    const groups: Record<string, DocumentComment[]> = {};
    sortedComments.forEach(comment => {
      if (!groups[comment.documentId]) {
        groups[comment.documentId] = [];
      }
      groups[comment.documentId].push(comment);
    });
    return groups;
  }, [sortedComments, selectedDocumentIds, activeDocumentId]);

  if (sortedComments.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="text-gray-400 text-6xl mb-4">💬</div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">No comments found</h3>
        <p className="text-sm text-gray-500 text-center">
          {documents.length === 0 
            ? 'Upload a .docx document to see extracted comments'
            : selectedDocumentIds.length === 0 && !activeDocumentId
              ? 'Select one or more documents to view their comments'
              : 'No comments were found in the selected document(s)'
          }
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with sort controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Comments {(() => {
            if (selectedDocumentIds.length === 1) {
              return `(${getDocumentName(selectedDocumentIds[0])})`;
            } else if (selectedDocumentIds.length > 1) {
              return `(${selectedDocumentIds.length} documents, ${sortedComments.length} total)`;
            } else if (activeDocumentId) {
              return `(${getDocumentName(activeDocumentId)})`;
            } else {
              return `(${sortedComments.length})`;
            }
          })()}
        </h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="author-asc">Author A-Z</option>
          <option value="author-desc">Author Z-A</option>
        </select>
      </div>

      {/* Comments list */}
      <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-auto">
        {Object.entries(groupedComments).map(([documentId, docComments]) => (
          <div key={documentId}>
            {/* Document header (only show if multiple documents are selected) */}
            {selectedDocumentIds.length > 1 && (
              <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b border-gray-200 mb-3">
                <h3 className="font-medium text-gray-700">
                  📄 {getDocumentName(documentId)} ({docComments.length})
                </h3>
              </div>
            )}
            
            {/* Comments for this document */}
            {docComments.map((comment) => {
              const parentComment = comment.parentId ? getCommentById(comment.parentId) : null;
              const isReply = !!comment.parentId;
              
              return (
                <div
                  key={comment.id}
                  id={`comment-${comment.id}`}
                  onClick={() => handleCommentClick(comment.id)}
                  className={`bg-white rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isReply ? 'ml-8 border-l-4 border-l-purple-300' : ''
                  } ${
                    selectedCommentId === comment.id
                      ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="p-4">
                    {/* Comment header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {comment.initial || comment.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-800">{comment.author}</span>
                            {comment.done && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                                ✓ Done
                              </span>
                            )}
                            {comment.parentId && (
                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                                ↳ Reply
                              </span>
                            )}
                            {comment.children && comment.children.length > 0 && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                {comment.children.length} {comment.children.length === 1 ? 'reply' : 'replies'}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{formatDate(comment.date)}</div>
                        </div>
                      </div>
                      {comment.reference && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {comment.reference}
                        </span>
                      )}
                    </div>

                    {/* Thread navigation - Parent comment */}
                    {parentComment && (
                      <div className="mb-2 p-2 bg-purple-50 rounded border-l-2 border-purple-400">
                        <div className="text-xs text-purple-700 mb-1">
                          <span className="font-medium">Replying to:</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-purple-800">{parentComment.author}</div>
                            <div className="text-xs text-purple-600 truncate">{parentComment.plainText.slice(0, 80)}{parentComment.plainText.length > 80 ? '...' : ''}</div>
                          </div>
                          <button
                            onClick={(e) => navigateToComment(parentComment.id, e)}
                            className="ml-2 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex-shrink-0"
                            title="Go to parent comment"
                          >
                            ↑ View
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Comment text */}
                    <div 
                      className="text-gray-700 leading-relaxed mb-2"
                      dangerouslySetInnerHTML={{ __html: comment.content }}
                    />

                    {/* Thread navigation - Child comments */}
                    {comment.children && comment.children.length > 0 && (
                      <div className="mt-3 p-2 bg-blue-50 rounded border-l-2 border-blue-400">
                        <div className="text-xs font-medium text-blue-700 mb-2">
                          {comment.children.length} {comment.children.length === 1 ? 'Reply' : 'Replies'}:
                        </div>
                        <div className="space-y-2">
                          {comment.children.map((childId) => {
                            const child = getCommentById(childId);
                            if (!child) return null;
                            
                            return (
                              <div key={childId} className="flex items-start justify-between bg-white p-2 rounded">
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium text-gray-800">{child.author}</div>
                                  <div className="text-xs text-gray-600 truncate">{child.plainText.slice(0, 80)}{child.plainText.length > 80 ? '...' : ''}</div>
                                </div>
                                <button
                                  onClick={(e) => navigateToComment(child.id, e)}
                                  className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-shrink-0"
                                  title="Go to reply"
                                >
                                  ↓ View
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Selection indicator */}
                    {selectedCommentId === comment.id && (
                      <div className="mt-2 text-xs text-blue-600 font-medium">
                        ✓ Selected for review
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};