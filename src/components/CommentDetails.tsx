import React from 'react';
import type { DocumentComment } from '../types';

interface CommentDetailsProps {
  comment: DocumentComment | null;
  getDocumentName?: (documentId: string) => string;
}

/**
 * CommentDetails component for displaying detailed information about a selected comment
 */
export const CommentDetails: React.FC<CommentDetailsProps> = ({ 
  comment, 
  getDocumentName 
}) => {
  // Empty state when no comment is selected
  if (!comment) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-400 text-4xl mb-4">💬</div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Select a comment to view details
        </h3>
        <p className="text-sm text-gray-500">
          Click on any comment in the center panel to see its details here.
        </p>
      </div>
    );
  }

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Comment Details</h2>
        <div className="h-px bg-gray-200"></div>
      </div>

      {/* Comment Information */}
      <div className="space-y-4">
        {/* Author Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {comment.initial || comment.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{comment.author}</div>
            <div className="text-sm text-gray-500">{formatDate(comment.date)}</div>
          </div>
        </div>

        {/* Document Info */}
        {getDocumentName && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Document:</span>
            </div>
            <div className="text-sm text-gray-800 mt-1">
              📄 {getDocumentName(comment.documentId)}
            </div>
          </div>
        )}

        {/* Referenced Paragraph */}
        {comment.reference && (
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <div className="text-sm font-medium text-blue-800 mb-2">
              Referenced Paragraph
            </div>
            <div className="text-sm text-blue-700">
              {comment.reference}
            </div>
          </div>
        )}

        {/* Comment Text */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Comment
          </div>
          <div className="text-gray-800 leading-relaxed">
            {comment.text}
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              <span className="font-medium">Comment ID:</span> {comment.id}
            </div>
            {comment.initial && (
              <div>
                <span className="font-medium">Initials:</span> {comment.initial}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};