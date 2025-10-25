import React, { useState } from 'react';
import { Panel } from './Panel';
import { CommentList } from './CommentList';
import { CommentListDemo } from './CommentListDemo';
import { DocumentViewer } from './DocumentViewer';
import { MetaCommentForm } from './MetaCommentForm';
import { useDocumentContext } from '../hooks/useDocumentContext';

/**
 * Center Panel component - main content area
 */
export const CenterPanel: React.FC = () => {
  const { documents, activeDocumentId, addMetaComment } = useDocumentContext();
  const [showDemo, setShowDemo] = useState(false);
  const [showMetaCommentForm, setShowMetaCommentForm] = useState(false);

  // Show CommentList if there are documents uploaded, otherwise show welcome
  const showComments = documents.length > 0;
  
  // Find the active document if one is set
  const activeDocument = activeDocumentId 
    ? documents.find(doc => doc.id === activeDocumentId)
    : null;
  
  // Show document content if there's an active document with transformed content
  const showDocumentContent = activeDocument && activeDocument.transformedContent;

  return (
    <Panel state="normal" position="center">
      <div className="p-8 h-full flex flex-col">
        {/* Main content area */}
        <div className="flex-1 bg-gray-50 rounded-lg p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {showDocumentContent && activeDocument ? (
              <DocumentViewer document={activeDocument} />
            ) : showComments ? (
              <>
                {/* Add Meta-Comment Button */}
                {!showMetaCommentForm && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowMetaCommentForm(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                    >
                      <span className="text-lg">✨</span>
                      Create Meta-Comment
                    </button>
                  </div>
                )}
                
                {/* Meta-Comment Form */}
                {showMetaCommentForm && (
                  <MetaCommentForm
                    onSubmit={(metaComment) => {
                      addMetaComment(metaComment);
                      setShowMetaCommentForm(false);
                    }}
                    onCancel={() => setShowMetaCommentForm(false)}
                  />
                )}
                
                {/* Comment List */}
                <CommentList />
              </>
            ) : showDemo ? (
              <CommentListDemo />
            ) : (
              <>
                {/* Demo section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Comment Display Demo</h3>
                  <p className="text-gray-600 mb-4">
                    See how extracted comments from .docx documents are displayed in the center panel.
                  </p>
                  <button
                    onClick={() => setShowDemo(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🚀 Try Comment Display Demo
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
};