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
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

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
      
      // Update document with parsed comments
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              comments: parseResult.comments,
              isProcessing: false,
              processingError: parseResult.error
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
  }, []);

  return {
    documents,
    activeDocumentId,
    comments,
    selectedCommentId,
    addDocument,
    removeDocument,
    setActiveDocument,
    setSelectedComment,
  };
};