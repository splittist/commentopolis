import React from 'react';
import { useDocumentContext } from '../hooks/useDocumentContext';

interface DocumentListProps {
  className?: string;
  maxHeight?: string;
  showDetails?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({ 
  className = '', 
  maxHeight = 'max-h-64',
  showDetails = true 
}) => {
  const { documents, activeDocumentId, setActiveDocument, removeDocument } = useDocumentContext();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (documents.length === 0) {
    return (
      <div className={`${className} text-center py-8`}>
        <div className="text-4xl mb-2">📄</div>
        <p className="text-sm text-gray-500">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className={`${className} space-y-2`}>
      <div className={`${maxHeight} overflow-y-auto space-y-2`}>
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`
              p-3 rounded-lg border cursor-pointer transition-colors duration-200
              ${activeDocumentId === doc.id 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
            onClick={() => setActiveDocument(doc.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">📄</span>
                  <h4 className="font-medium text-gray-800 truncate text-sm">
                    {doc.name}
                  </h4>
                  {activeDocumentId === doc.id && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                
                {showDetails && (
                  <div className="flex items-center mt-1 text-xs text-gray-500 gap-2">
                    <span>{formatFileSize(doc.size)}</span>
                    <span>•</span>
                    <span>{formatDate(doc.uploadDate)}</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeDocument(doc.id);
                }}
                className="ml-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                title="Remove document"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};