import React from 'react';
import type { PanelState } from '../types';
import { Panel } from './Panel';
import { DocumentUpload } from './DocumentUpload';
import { DocumentList } from './DocumentList';
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
      
      <div className="pt-4 border-t border-gray-200">
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800">Navigation</h3>
          <nav className="space-y-1">
            <a href="#" className="block px-3 py-2 rounded-md hover:bg-gray-200 text-sm">
              📂 Documents
            </a>
            <a href="#" className="block px-3 py-2 rounded-md hover:bg-gray-200 text-sm">
              🔍 Search
            </a>
            <a href="#" className="block px-3 py-2 rounded-md hover:bg-gray-200 text-sm">
              ⚡ Recent
            </a>
            <a href="#" className="block px-3 py-2 rounded-md hover:bg-gray-200 text-sm">
              ⭐ Favorites
            </a>
          </nav>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-200">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>
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
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3">Document Templates</h3>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <h4 className="font-medium text-gray-800">Project Overview</h4>
            <p className="text-sm text-gray-600 mt-1">Main project documentation and guidelines</p>
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <span>📄 12 files</span>
              <span className="mx-2">•</span>
              <span>Last updated 2h ago</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <h4 className="font-medium text-gray-800">API Reference</h4>
            <p className="text-sm text-gray-600 mt-1">Complete API documentation and examples</p>
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <span>📄 8 files</span>
              <span className="mx-2">•</span>
              <span>Last updated 1d ago</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <h4 className="font-medium text-gray-800">User Guides</h4>
            <p className="text-sm text-gray-600 mt-1">Step-by-step guides for end users</p>
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <span>📄 5 files</span>
              <span className="mx-2">•</span>
              <span>Last updated 3d ago</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-200 text-sm">
            ➕ New Document
          </button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-200 text-sm">
            📤 Import Files
          </button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-200 text-sm">
            🗂️ Organize
          </button>
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