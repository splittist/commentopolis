import React from 'react';
import type { MetaComment } from '../types';

interface MetaCommentItemProps {
  metaComment: MetaComment;
  isSelected: boolean;
  onClick: (id: string, event: React.MouseEvent) => void;
  onUpdate?: (id: string, updates: Partial<MetaComment>) => void;
  onDelete?: (id: string) => void;
}

const typeIcons: Record<MetaComment['type'], string> = {
  synthesis: '💡',
  link: '🔗',
  question: '❓',
  observation: '👁️'
};

const typeLabels: Record<MetaComment['type'], string> = {
  synthesis: 'Synthesis',
  link: 'Link',
  question: 'Question',
  observation: 'Observation'
};

/**
 * Component for displaying a single meta-comment
 */
export const MetaCommentItem: React.FC<MetaCommentItemProps> = ({
  metaComment,
  isSelected,
  onClick,
  onUpdate,
  onDelete
}) => {
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const handleToggleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdate) {
      onUpdate(metaComment.id, { includeInReport: !metaComment.includeInReport });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm('Delete this meta-comment?')) {
      onDelete(metaComment.id);
    }
  };

  return (
    <div
      onClick={(e) => onClick(metaComment.id, e)}
      className={`bg-purple-50 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-purple-500 ring-2 ring-purple-200 shadow-md'
          : 'border-purple-200 hover:border-purple-300'
      }`}
    >
      <div className="p-4">
        {/* Meta-comment header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-lg">
              {typeIcons[metaComment.type]}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-800">{metaComment.author}</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                  ✨ {typeLabels[metaComment.type]}
                </span>
                {metaComment.includeInReport && (
                  <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                    📄 In Report
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(metaComment.created)}
                {metaComment.modified && ` (edited ${formatDate(metaComment.modified)})`}
              </div>
            </div>
          </div>
        </div>

        {/* Meta-comment text */}
        <div className="text-gray-700 leading-relaxed mb-2 whitespace-pre-wrap">
          {metaComment.text}
        </div>

        {/* Hashtags */}
        {metaComment.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {metaComment.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Linked comments indicator */}
        {metaComment.linkedComments.length > 0 && (
          <div className="text-xs text-purple-600 mb-2">
            🔗 Links to {metaComment.linkedComments.length} comment{metaComment.linkedComments.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-purple-200">
          <button
            onClick={handleToggleReport}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              metaComment.includeInReport
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {metaComment.includeInReport ? '✓ In Report' : 'Add to Report'}
          </button>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
