import React from 'react';
import type { PanelState } from '../types';
import { Panel } from './Panel';
import { CommentDetails } from './CommentDetails';
import { useDocumentContext } from '../hooks/useDocumentContext';

interface RightPanelProps {
  state: PanelState;
  onToggle: () => void;
}

/**
 * Right Panel component with state-specific content
 */
export const RightPanel: React.FC<RightPanelProps> = ({ state, onToggle }) => {
  const { documents, comments, selectedCommentId } = useDocumentContext();
  
  // Find the selected comment
  const selectedComment = selectedCommentId 
    ? comments.find(comment => comment.id === selectedCommentId) || null
    : null;
  
  // Helper function to get document name by ID
  const getDocumentName = (documentId: string): string => {
    const doc = documents.find(d => d.id === documentId);
    return doc?.name || 'Unknown Document';
  };

  // Helper function to get comment by ID or paraId
  const getCommentById = (idOrParaId: string) => {
    // First try to find by regular ID
    let comment = comments.find(comment => comment.id === idOrParaId);
    if (comment) return comment;
    
    // If not found, try to find by paraId
    comment = comments.find(comment => comment.paraId === idOrParaId);
    return comment || null;
  };
  const renderMinimizedContent = () => (
    <div className="flex flex-col items-center space-y-4 p-2">
      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
        <span className="text-blue-600">💬</span>
      </div>
      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
        <span className="text-yellow-600">📝</span>
      </div>
      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
        <span className="text-red-600">⚙️</span>
      </div>
    </div>
  );

  const renderNormalContent = () => {
    // If a comment is selected, show comment details
    if (selectedComment) {
      // Get the document HTML for extracting referenced paragraphs
      const document = documents.find(d => d.id === selectedComment.documentId);
      const documentHtml = document?.transformedContent?.html || '';
      
      return (
        <div className="p-4">
          <CommentDetails 
            comment={selectedComment} 
            getDocumentName={getDocumentName}
            getCommentById={getCommentById}
            documentHtml={documentHtml}
          />
        </div>
      );
    }

    // Default tools and notes view
    return (
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800">Tools</h3>
          <div className="space-y-1">
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-200 text-sm">
              💬 Comments
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-200 text-sm">
              📝 Notes
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-200 text-sm">
              🏷️ Tags
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-200 text-sm">
              ⚙️ Settings
            </button>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2">Recent Notes</h4>
          <div className="space-y-2">
            <div className="bg-yellow-50 p-2 rounded text-xs">
              <p className="text-gray-700">Meeting notes from...</p>
              <span className="text-gray-500">2h ago</span>
            </div>
            <div className="bg-blue-50 p-2 rounded text-xs">
              <p className="text-gray-700">Ideas for improvement</p>
              <span className="text-gray-500">1d ago</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFocusedContent = () => {
    // If a comment is selected, show comment details with expanded view
    if (selectedComment) {
      // Get the document HTML for extracting referenced paragraphs
      const document = documents.find(d => d.id === selectedComment.documentId);
      const documentHtml = document?.transformedContent?.html || '';
      
      return (
        <div className="p-4">
          <CommentDetails 
            comment={selectedComment} 
            getDocumentName={getDocumentName}
            getCommentById={getCommentById}
            documentHtml={documentHtml}
          />
        </div>
      );
    }

    // Default expanded view with comment center and tools
    return (
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Comment Center</h2>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  JD
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">John Doe</span>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    This section needs clarification. Could we add more examples?
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <button className="text-xs text-blue-600 hover:text-blue-800">Reply</button>
                    <button className="text-xs text-gray-500 hover:text-gray-700">👍 2</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  SM
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">Sarah Miller</span>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    Great work on the new features! The UI looks much cleaner now.
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <button className="text-xs text-blue-600 hover:text-blue-800">Reply</button>
                    <button className="text-xs text-gray-500 hover:text-gray-700">👍 5</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Add Comment</h3>
          <div className="space-y-3">
            <textarea 
              placeholder="Write your comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <button className="hover:text-gray-700">📎</button>
                <button className="hover:text-gray-700">😊</button>
              </div>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                Post
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">My Notes</h3>
          <div className="space-y-2">
            <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
              <p className="text-sm text-gray-700">Remember to update the documentation after implementing the new feature.</p>
              <span className="text-xs text-gray-500">Today, 10:30 AM</span>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
              <p className="text-sm text-gray-700">Ideas for improving user experience: 1) Add keyboard shortcuts, 2) Implement auto-save</p>
              <span className="text-xs text-gray-500">Yesterday, 3:15 PM</span>
            </div>
          </div>
          
          <button className="w-full mt-3 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600">
            ➕ Add new note
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (state) {
      case 'minimized':
        return renderMinimizedContent();
      case 'normal':
        return renderNormalContent();
      case 'focused':
        return renderFocusedContent();
      default:
        return renderNormalContent();
    }
  };

  return (
    <Panel state={state} position="right" onToggle={onToggle}>
      {renderContent()}
    </Panel>
  );
};