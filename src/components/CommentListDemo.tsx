import React, { useState, useEffect } from 'react';
import type { DocumentComment, UploadedDocument } from '../types';
import { useDocumentContext } from '../hooks/useDocumentContext';

// Sample data for demonstration
const sampleDocuments: UploadedDocument[] = [
  {
    id: 'demo-doc1',
    name: 'Meeting Notes Q4 2023.docx',
    file: new File([''], 'meeting-notes.docx'),
    uploadDate: new Date('2023-12-01'),
    size: 15420,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  {
    id: 'demo-doc2',
    name: 'Project Proposal.docx',
    file: new File([''], 'project-proposal.docx'),
    uploadDate: new Date('2023-12-05'),
    size: 28350,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
];

const sampleComments: DocumentComment[] = [
  {
    id: 'demo-comment1',
    paraId: 'demo-para1', // Add paraId for consistency
    author: 'Sarah Johnson',
    initial: 'SJ',
    date: new Date('2023-12-01T14:30:00Z'),
    plainText: 'We should consider the budget implications of this proposal. The current estimates might be too optimistic given the market conditions.',
    content: '<p>We should consider the budget implications of this proposal. The current estimates might be too optimistic given the market conditions.</p>',
    documentId: 'demo-doc1',
    reference: 'Page 2, Paragraph 3',
    done: false,
    children: ['demo-para6'], // Use paraId for children
  },
  {
    id: 'demo-comment2',
    paraId: 'demo-para2',
    author: 'Michael Chen',
    initial: 'MC',
    date: new Date('2023-12-01T15:45:00Z'),
    plainText: 'Great point about the timeline. However, I think we can accelerate the delivery if we prioritize the core features first.',
    content: '<p>Great point about the timeline. However, I think we can accelerate the delivery if we prioritize the core features first.</p>',
    documentId: 'demo-doc1',
    reference: 'Page 3, Table 1',
    done: true, // This comment is marked as done
    children: [],
  },
  {
    id: 'demo-comment3',
    paraId: 'demo-para3',
    author: 'Emily Rodriguez',
    initial: 'ER',
    date: new Date('2023-12-02T09:15:00Z'),
    plainText: 'The technical architecture looks solid, but we need to ensure compatibility with our existing systems.',
    content: '<p>The technical architecture looks solid, but we need to ensure compatibility with our existing systems.</p>',
    documentId: 'demo-doc2',
    reference: 'Section 4.2',
    done: false,
    children: ['demo-para7'], // Use paraId for children
  },
  {
    id: 'demo-comment4',
    paraId: 'demo-para4',
    author: 'David Kim',
    initial: 'DK',
    date: new Date('2023-12-02T11:20:00Z'),
    plainText: 'I agree with the risk assessment. We should add more contingency measures for the high-risk items.',
    content: '<p>I agree with the risk assessment. We should add more contingency measures for the high-risk items.</p>',
    documentId: 'demo-doc2',
    reference: 'Risk Matrix',
    done: true, // This comment is marked as done
    children: [],
  },
  {
    id: 'demo-comment5',
    paraId: 'demo-para5',
    author: 'Lisa Wang',
    initial: 'LW',
    date: new Date('2023-12-03T16:10:00Z'),
    plainText: 'This section needs more detail. Can we expand on the implementation strategy?',
    content: '<p>This section needs more detail. Can we expand on the implementation strategy?</p>',
    documentId: 'demo-doc1',
    reference: 'Page 5, Implementation',
    done: false,
    children: [],
  },
  {
    id: 'demo-comment6',
    paraId: 'demo-para6',
    author: 'Michael Chen',
    initial: 'MC',
    date: new Date('2023-12-01T16:00:00Z'),
    plainText: 'Good point Sarah. I\'ve reviewed the latest market data and agree we should be more conservative. Let me update the projections.',
    content: '<p>Good point Sarah. I\'ve reviewed the latest market data and agree we should be more conservative. Let me update the projections.</p>',
    documentId: 'demo-doc1',
    reference: 'Page 2, Paragraph 3',
    parentId: 'demo-para1', // Use paraId for parent reference
    done: false,
    children: [],
  },
  {
    id: 'demo-comment7',
    paraId: 'demo-para7',
    author: 'David Kim',
    initial: 'DK',
    date: new Date('2023-12-02T10:30:00Z'),
    plainText: 'I can help with the compatibility testing. Let\'s schedule a technical review meeting.',
    content: '<p>I can help with the compatibility testing. Let\'s schedule a technical review meeting.</p>',
    documentId: 'demo-doc2',
    reference: 'Section 4.2',
    parentId: 'demo-para3', // Use paraId for parent reference
    done: true, // This reply is done
    children: [],
  },
];

interface CommentListDemoProps {
  className?: string;
}

/**
 * Demo component showing CommentList with sample data
 */
export const CommentListDemo: React.FC<CommentListDemoProps> = ({ className = '' }) => {
  const [showDemo, setShowDemo] = useState(false);
  const [originalState, setOriginalState] = useState<{
    documents: UploadedDocument[];
    comments: DocumentComment[];
    activeDocumentId: string | null;
  } | null>(null);

  // This is a hack for demo purposes - we'll temporarily modify the context
  // In a real app, this would be handled differently
  const { documents: contextDocuments, comments: contextComments, activeDocumentId, addDemoComments, removeDemoComments, addDemoDocuments, removeDemoDocuments } = useDocumentContext();

  useEffect(() => {
    if (showDemo && !originalState) {
      // Store original state
      setOriginalState({
        documents: [...contextDocuments],
        comments: [...contextComments],
        activeDocumentId,
      });
      
      // Inject demo data (this is a demo hack)
      // In production, this would be handled through proper state management
      if (contextDocuments.length === 0) {
        // Only show demo if there are no real documents
        console.log('Demo mode activated with sample data');
        // Add demo comments and documents to global context
        if (addDemoComments) {
          addDemoComments(sampleComments);
        }
        if (addDemoDocuments) {
          addDemoDocuments(sampleDocuments);
        }
      }
    } else if (!showDemo && originalState) {
      // Clean up demo data when hiding demo
      if (removeDemoComments) {
        removeDemoComments();
      }
      if (removeDemoDocuments) {
        removeDemoDocuments();
      }
      setOriginalState(null);
    }
  }, [showDemo, originalState, contextDocuments, contextComments, activeDocumentId, addDemoComments, removeDemoComments, addDemoDocuments, removeDemoDocuments]);

  if (!showDemo) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Comment Display Demo</h3>
          <p className="text-gray-600 mb-4">
            See how extracted comments from .docx documents are displayed with interactive features
          </p>
          <button
            onClick={() => setShowDemo(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            🚀 Load Demo Comments
          </button>
          <p className="text-xs text-gray-500 mt-3">
            Features: sorting, selection, document grouping, and responsive layout
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-800">
              🚀 <strong>Demo Mode:</strong> Showing sample comments from mock documents
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Demonstrating: comment cards, sorting, selection, hover effects, and document grouping
            </p>
          </div>
          <button
            onClick={() => setShowDemo(false)}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Hide Demo
          </button>
        </div>
      </div>
      
      {/* Demo CommentList with hardcoded props */}
      <DemoCommentList />
    </div>
  );
};

// Standalone demo version that doesn't rely on context
const DemoCommentList: React.FC = () => {
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'document-order' | 'date-desc' | 'date-asc' | 'author-asc' | 'author-desc'>('document-order');
  
  // Get access to the global context to sync selected comment
  const { setSelectedComment } = useDocumentContext();

  // Simulate the CommentList logic but with our demo data
  const filteredComments = activeDocumentId 
    ? sampleComments.filter(comment => comment.documentId === activeDocumentId)
    : sampleComments;

  const sortedComments = [...filteredComments].sort((a, b) => {
    switch (sortBy) {
      case 'document-order': {
        // Sort by comment ID which represents document order
        // Comment IDs follow pattern: documentId-sequentialNumber
        const getIdNumber = (id: string) => {
          const parts = id.split('-');
          const lastPart = parts[parts.length - 1];
          const num = parseInt(lastPart, 10);
          return isNaN(num) ? 0 : num;
        };
        
        const numA = getIdNumber(a.id);
        const numB = getIdNumber(b.id);
        
        // If both have valid numbers, sort by them
        if (numA !== numB) {
          return numA - numB;
        }
        
        // Fall back to string comparison if numbers are equal
        return a.id.localeCompare(b.id);
      }
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'author-asc':
        return a.author.localeCompare(b.author);
      case 'author-desc':
        return b.author.localeCompare(a.author);
      default:
        return 0;
    }
  });

  const getDocumentName = (documentId: string): string => {
    const doc = sampleDocuments.find(d => d.id === documentId);
    return doc?.name || 'Unknown Document';
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const handleCommentClick = (commentId: string) => {
    const newSelectedId = commentId === selectedCommentId ? null : commentId;
    setSelectedCommentId(newSelectedId);
    // Also update the global context so RightPanel can show the comment details
    setSelectedComment(newSelectedId);
  };

  const groupedComments = activeDocumentId 
    ? { [activeDocumentId]: sortedComments }
    : sampleComments.reduce((groups, comment) => {
        if (!groups[comment.documentId]) {
          groups[comment.documentId] = [];
        }
        groups[comment.documentId].push(comment);
        return groups;
      }, {} as Record<string, DocumentComment[]>);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Comments {activeDocumentId ? `(${getDocumentName(activeDocumentId)})` : `(${sortedComments.length})`}
          </h2>
          <select
            value={activeDocumentId || ''}
            onChange={(e) => setActiveDocumentId(e.target.value || null)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Documents</option>
            {sampleDocuments.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.name}</option>
            ))}
          </select>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="document-order">Document order</option>
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="author-asc">Author A-Z</option>
          <option value="author-desc">Author Z-A</option>
        </select>
      </div>

      {/* Comments list */}
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-auto">
        {Object.entries(groupedComments).map(([documentId, docComments]) => (
          <div key={documentId}>
            {/* Document header (only show if multiple documents) */}
            {!activeDocumentId && Object.keys(groupedComments).length > 1 && (
              <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b border-gray-200 mb-3 rounded-t-lg">
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
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: comment.content }}
                />

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