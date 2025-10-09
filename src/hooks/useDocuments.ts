import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import type { UploadedDocument, DocumentStateManager, DocumentComment } from '../types';
import { parseDocxComments, isValidDocxFile } from '../utils/docxParser';

/**
 * Custom hook for managing document uploads and state
 */
export const useDocuments = (): DocumentStateManager => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [selectedCommentIds, setSelectedCommentIds] = useState<string[]>([]);

  const addDocument = useCallback(async (file: File) => {
    // Validate file type
    if (!isValidDocxFile(file)) {
      toast.error('Only .docx files are supported');
      return;
    }

    // Check for duplicates
    const existingDoc = documents.find(doc => doc.name === file.name && doc.size === file.size);
    if (existingDoc) {
      toast.error('Document already uploaded');
      return;
    }

    const documentId = crypto.randomUUID();
    const newDocument: UploadedDocument = {
      id: documentId,
      name: file.name,
      file,
      uploadDate: new Date(),
      size: file.size,
      type: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      comments: [],
      isProcessing: true,
    };

    // Add document immediately with processing flag
    setDocuments(prev => [...prev, newDocument]);
    toast.success(`Document "${file.name}" uploaded successfully`);

    // Parse comments asynchronously
    try {
      const parseResult = await parseDocxComments(file, documentId);
      
      // Update document with parsed comments and XML metadata
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              comments: parseResult.comments,
              footnotes: parseResult.footnotes || [],
              endnotes: parseResult.endnotes || [],
              isProcessing: false,
              processingError: parseResult.error,
              xmlMetadata: {
                documentXml: parseResult.documentXml,
                stylesXml: parseResult.stylesXml,
                numberingXml: parseResult.numberingXml,
                commentsXml: parseResult.commentsXml,
                commentsExtendedXml: parseResult.commentsExtendedXml,
                footnotesXml: parseResult.footnotesXml,
                endnotesXml: parseResult.endnotesXml,
              },
              transformedContent: parseResult.transformedContent
            }
          : doc
      ));

      // Add comments to global comments array
      if (parseResult.comments.length > 0) {
        setComments(prev => [...prev, ...parseResult.comments]);
        toast.success(`Extracted ${parseResult.comments.length} comment(s) from "${file.name}"`);
      } else if (!parseResult.error) {
        toast(`No comments found in "${file.name}"`);
      }

      // Show success message for footnotes/endnotes if found
      const totalNotes = (parseResult.footnotes?.length || 0) + (parseResult.endnotes?.length || 0);
      if (totalNotes > 0) {
        toast.success(`Found ${parseResult.footnotes?.length || 0} footnote(s) and ${parseResult.endnotes?.length || 0} endnote(s) in "${file.name}"`);
      }

      // Show error if parsing failed
      if (parseResult.error) {
        toast.error(`Error parsing "${file.name}": ${parseResult.error}`);
      }

    } catch (error) {
      console.error('Unexpected error during document processing:', error);
      
      // Update document with error state
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              isProcessing: false,
              processingError: error instanceof Error ? error.message : 'Unknown error'
            }
          : doc
      ));
      
      toast.error(`Failed to process "${file.name}"`);
    }
  }, [documents]);

  const removeDocument = useCallback((id: string) => {
    const docToRemove = documents.find(doc => doc.id === id);
    
    // Remove document
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    
    // Remove associated comments
    setComments(prev => prev.filter(comment => comment.documentId !== id));
    
    // Remove from selected documents
    setSelectedDocumentIds(prev => prev.filter(docId => docId !== id));
    
    if (activeDocumentId === id) {
      setActiveDocumentId(null);
    }
    
    if (docToRemove) {
      toast.success(`Document "${docToRemove.name}" removed`);
    }
  }, [documents, activeDocumentId]);

  const setActiveDocument = useCallback((id: string | null) => {
    setActiveDocumentId(id);
    if (id) {
      const doc = documents.find(d => d.id === id);
      if (doc) {
        toast.success(`Active document: ${doc.name}`);
      }
    }
  }, [documents]);

  const setSelectedComment = useCallback((id: string | null) => {
    setSelectedCommentId(id);
    // When setting a single comment (backward compatibility), clear multi-selection
    if (id) {
      setSelectedCommentIds([id]);
    } else {
      setSelectedCommentIds([]);
    }
  }, []);

  // New methods for multiple comment selection
  const selectComment = useCallback((id: string) => {
    setSelectedCommentIds(prev => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
    // Update single selection for backward compatibility (use last selected)
    setSelectedCommentId(id);
  }, []);

  const deselectComment = useCallback((id: string) => {
    setSelectedCommentIds(prev => {
      const newSelection = prev.filter(commentId => commentId !== id);
      // Update single selection for backward compatibility
      if (newSelection.length > 0) {
        setSelectedCommentId(newSelection[newSelection.length - 1]);
      } else {
        setSelectedCommentId(null);
      }
      return newSelection;
    });
  }, []);

  const toggleCommentSelection = useCallback((id: string, multiSelect: boolean = false) => {
    setSelectedCommentIds(prev => {
      if (multiSelect) {
        // Multi-select mode: toggle the comment in the selection
        if (prev.includes(id)) {
          const newSelection = prev.filter(commentId => commentId !== id);
          // Update single selection for backward compatibility
          if (newSelection.length > 0) {
            setSelectedCommentId(newSelection[newSelection.length - 1]);
          } else {
            setSelectedCommentId(null);
          }
          return newSelection;
        } else {
          setSelectedCommentId(id);
          return [...prev, id];
        }
      } else {
        // Single select mode: replace the selection
        setSelectedCommentId(id === prev[0] && prev.length === 1 ? null : id);
        return id === prev[0] && prev.length === 1 ? [] : [id];
      }
    });
  }, []);

  const clearSelectedComments = useCallback(() => {
    setSelectedCommentIds([]);
    setSelectedCommentId(null);
  }, []);

  // New methods for multiple document selection
  const selectDocument = useCallback((id: string) => {
    setSelectedDocumentIds(prev => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
  }, []);

  const deselectDocument = useCallback((id: string) => {
    setSelectedDocumentIds(prev => prev.filter(docId => docId !== id));
  }, []);

  const selectAllDocuments = useCallback(() => {
    setSelectedDocumentIds(documents.map(doc => doc.id));
  }, [documents]);

  const deselectAllDocuments = useCallback(() => {
    setSelectedDocumentIds([]);
  }, []);

  const toggleDocumentSelection = useCallback((id: string) => {
    setSelectedDocumentIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(docId => docId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  // Demo support methods
  const addDemoComments = useCallback((demoComments: DocumentComment[]) => {
    setComments(prev => [...prev, ...demoComments]);
  }, []);

  const removeDemoComments = useCallback(() => {
    // Remove comments that have demo IDs (start with 'demo-')
    setComments(prev => prev.filter(comment => !comment.id.startsWith('demo-')));
  }, []);

  const addDemoDocuments = useCallback((demoDocuments: UploadedDocument[]) => {
    setDocuments(prev => [...prev, ...demoDocuments]);
  }, []);

  const removeDemoDocuments = useCallback(() => {
    // Remove documents that have demo IDs (start with 'demo-')
    setDocuments(prev => prev.filter(doc => !doc.id.startsWith('demo-')));
  }, []);

  return {
    documents,
    activeDocumentId,
    selectedDocumentIds,
    comments,
    selectedCommentId,
    selectedCommentIds,
    addDocument,
    removeDocument,
    setActiveDocument,
    setSelectedComment,
    selectComment,
    deselectComment,
    toggleCommentSelection,
    clearSelectedComments,
    selectDocument,
    deselectDocument,
    selectAllDocuments,
    deselectAllDocuments,
    toggleDocumentSelection,
    addDemoComments,
    removeDemoComments,
    addDemoDocuments,
    removeDemoDocuments,
  };
};