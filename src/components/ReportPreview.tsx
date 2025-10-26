import React, { useState } from 'react';
import toast from 'react-hot-toast';
import type { ReportConfig, DocumentComment, MetaComment, UploadedDocument } from '../types';
import { generateHumanReport, generateDefaultReportConfig } from '../utils/reportGenerator';

interface ReportPreviewProps {
  selectedCommentIds: string[];
  wordComments: DocumentComment[];
  metaComments: MetaComment[];
  documents: UploadedDocument[];
  onClose?: () => void;
}

/**
 * Component for previewing and copying report to clipboard
 */
export const ReportPreview: React.FC<ReportPreviewProps> = ({
  selectedCommentIds,
  wordComments,
  metaComments,
  documents,
  onClose
}) => {
  const [reportTitle, setReportTitle] = useState('Analysis Report');
  const [includeQuestions, setIncludeQuestions] = useState(true);

  // Generate the report config and text
  const reportConfig: ReportConfig = {
    ...generateDefaultReportConfig(reportTitle, selectedCommentIds, metaComments),
    includeQuestions
  };

  const reportText = generateHumanReport(reportConfig, {
    wordComments,
    metaComments,
    documents
  });

  // Handle copy to clipboard
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      toast.success('Report copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  // Count different types of comments
  const wordCommentCount = selectedCommentIds.filter(id => 
    wordComments.some(c => c.id === id)
  ).length;
  const metaCommentCount = selectedCommentIds.filter(id => 
    metaComments.some(c => c.id === id)
  ).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">📄 Report Generator</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded p-1 transition-colors"
              aria-label="Close report preview"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-sm text-purple-100">
          Generate clean, readable report text from selected comments
        </p>
      </div>

      {/* Configuration */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Title
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter report title"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeQuestions"
              checked={includeQuestions}
              onChange={(e) => setIncludeQuestions(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="includeQuestions" className="text-sm text-gray-700">
              Include "Questions for Follow-up" section
            </label>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-xs text-gray-600 pt-2 border-t border-gray-200">
            <div>
              <span className="font-medium">Word Comments:</span> {wordCommentCount}
            </div>
            <div>
              <span className="font-medium">Meta-Comments:</span> {metaCommentCount}
            </div>
            <div>
              <span className="font-medium">Documents:</span> {new Set(
                selectedCommentIds
                  .map(id => wordComments.find(c => c.id === id)?.documentId)
                  .filter(Boolean)
              ).size}
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
            {reportText}
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white p-4 border-t border-gray-200 rounded-b-lg">
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleCopyToClipboard}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
          >
            <span>📋</span>
            <span>Copy to Clipboard</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-right">
          Format is clean prose suitable for email or Word documents
        </p>
      </div>
    </div>
  );
};
