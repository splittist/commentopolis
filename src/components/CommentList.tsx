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
            {docComments.map((comment) => (
              <div
                key={comment.id}
                onClick={() => handleCommentClick(comment.id)}
                className={`bg-white p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedCommentId === comment.id
                    ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Comment header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {comment.initial || comment.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{comment.author}</div>
                      <div className="text-xs text-gray-500">{formatDate(comment.date)}</div>
                    </div>
                  </div>
                  {comment.reference && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {comment.reference}
                    </span>
                  )}
                </div>

                {/* Comment text */}
                <div className="text-gray-700 leading-relaxed">
                  {comment.text}
                </div>

                {/* Selection indicator */}
                {selectedCommentId === comment.id && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    ✓ Selected for review
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};