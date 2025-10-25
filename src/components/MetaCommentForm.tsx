import React, { useState } from 'react';
import type { MetaComment } from '../types';

interface MetaCommentFormProps {
  onSubmit: (metaComment: Omit<MetaComment, 'id' | 'created'>) => void;
  onCancel: () => void;
}

/**
 * Form component for creating new meta-comments
 */
export const MetaCommentForm: React.FC<MetaCommentFormProps> = ({ onSubmit, onCancel }) => {
  const [type, setType] = useState<MetaComment['type']>('synthesis');
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('Current User');
  const [includeInReport, setIncludeInReport] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      return;
    }

    onSubmit({
      type,
      text: text.trim(),
      author,
      linkedComments: [],
      tags: [], // Will be extracted from text
      includeInReport
    });

    // Reset form
    setText('');
    setIncludeInReport(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">✨</span>
        <h3 className="text-lg font-semibold text-purple-900">Create Meta-Comment</h3>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as MetaComment['type'])}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="synthesis">💡 Synthesis</option>
          <option value="link">🔗 Link</option>
          <option value="question">❓ Question</option>
          <option value="observation">👁️ Observation</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comment Text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your meta-comment... Use #hashtags to categorize"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Tip: Use #hashtags to categorize your meta-comments
        </p>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Author
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeInReport}
            onChange={(e) => setIncludeInReport(e.target.checked)}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <span className="text-sm text-gray-700">Include in Report</span>
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Create Meta-Comment
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
