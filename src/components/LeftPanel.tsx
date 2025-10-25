import React from 'react';
import type { PanelState } from '../types';
import { Panel } from './Panel';
import { DocumentUpload } from './DocumentUpload';
import { DocumentList } from './DocumentList';
import { CommentFilters } from './CommentFilters';
import { ProjectManager } from './ProjectManager';
import { useDocumentContext } from '../hooks/useDocumentContext';

interface LeftPanelProps {
  state: PanelState;
  onToggle: () => void;
}

/**
 * Left Panel component with state-specific content
 */
export const LeftPanel: React.FC<LeftPanelProps> = ({ state, onToggle }) => {
  const { documents } = useDocumentContext();

  const renderMinimizedContent = () => (
    <div className="flex flex-col items-center space-y-4 p-2">
      {/* App indicator */}
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <span className="text-white text-xs font-bold">C</span>
      </div>
      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
        <span className="text-blue-600">📂</span>
      </div>
      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
        <span className="text-green-600">🔍</span>
      </div>
      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
        <span className="text-purple-600">⚡</span>
      </div>
      {documents.length > 0 && (
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
          <span className="text-orange-600 text-xs font-semibold">{documents.length}</span>
        </div>
      )}
    </div>
  );

  const renderNormalContent = () => (
    <div className="p-4 space-y-4">
      {/* App Header */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">
          Commentopolis
        </h1>
      </div>
      
      {/* Project Management */}
      <ProjectManager />
      
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-800">Documents</h3>
        <DocumentUpload className="mb-4" />
      </div>
      
      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Uploaded Documents</h4>
          <DocumentList maxHeight="max-h-32" showDetails={false} />
        </div>
      )}

      {/* Comment Filters - positioned below document list */}
      {documents.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <CommentFilters />
        </div>
      )}
    </div>
  );

  const renderFocusedContent = () => (
    <div className="p-4 space-y-6">
      {/* App Header */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">
          Commentopolis
        </h1>
      </div>
      
      {/* Project Management */}
      <ProjectManager />
      
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Document Center</h2>
        
        <div className="space-y-4">
          <DocumentUpload />
          
          {documents.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Uploaded Documents</h3>
              <DocumentList maxHeight="max-h-64" showDetails={true} />
            </div>
          )}

          {/* Comment Filters - positioned below document list */}
          {documents.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <CommentFilters />
            </div>
          )}
        </div>
      </div>
    </div>
  );

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
    <Panel state={state} position="left" onToggle={onToggle}>
      {renderContent()}
    </Panel>
  );
};