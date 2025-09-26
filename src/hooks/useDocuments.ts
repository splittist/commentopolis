import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import type { UploadedDocument, DocumentStateManager } from '../types';

/**
 * Custom hook for managing document uploads and state
 */
export const useDocuments = (): DocumentStateManager => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  const addDocument = useCallback((file: File) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.docx')) {
      toast.error('Only .docx files are supported');
      return;
    }

    // Check for duplicates
    const existingDoc = documents.find(doc => doc.name === file.name && doc.size === file.size);
    if (existingDoc) {
      toast.error('Document already uploaded');
      return;
    }

    const newDocument: UploadedDocument = {
      id: crypto.randomUUID(),
      name: file.name,
      file,
      uploadDate: new Date(),
      size: file.size,
      type: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    setDocuments(prev => [...prev, newDocument]);
    toast.success(`Document "${file.name}" uploaded successfully`);
  }, [documents]);

  const removeDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (activeDocumentId === id) {
      setActiveDocumentId(null);
    }
    toast.success('Document removed');
  }, [activeDocumentId]);

  const setActiveDocument = useCallback((id: string | null) => {
    setActiveDocumentId(id);
    if (id) {
      const doc = documents.find(d => d.id === id);
      if (doc) {
        toast.success(`Active document: ${doc.name}`);
      }
    }
  }, [documents]);

  return {
    documents,
    activeDocumentId,
    addDocument,
    removeDocument,
    setActiveDocument,
  };
};