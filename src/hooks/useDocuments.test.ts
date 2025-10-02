import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDocuments } from './useDocuments';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the docx parser
vi.mock('../utils/docxParser', () => ({
  parseDocxComments: vi.fn(),
  isValidDocxFile: vi.fn(),
}));

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid-123'),
  },
});

// Mock File.prototype.arrayBuffer for Node.js environment
Object.defineProperty(File.prototype, 'arrayBuffer', {
  value: function() {
    return Promise.resolve(new ArrayBuffer(0));
  },
  writable: true
});

describe('useDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty documents array and comments', () => {
    const { result } = renderHook(() => useDocuments());
    
    expect(result.current.documents).toEqual([]);
    expect(result.current.comments).toEqual([]);
    expect(result.current.activeDocumentId).toBeNull();
  });

  it('adds valid .docx file and processes comments', async () => {
    const { parseDocxComments, isValidDocxFile } = await import('../utils/docxParser');
    const { toast } = await import('react-hot-toast');
    
    vi.mocked(isValidDocxFile).mockReturnValue(true);
    vi.mocked(parseDocxComments).mockResolvedValue({
      comments: [{
        id: 'mock-uuid-123-1',
        author: 'Test Author',
        initial: 'TA',
        date: new Date('2023-01-01'),
        plainText: 'Test comment',
        content: '<p>Test comment</p>',
        documentId: 'mock-uuid-123',
        reference: 'Comment 1'
      }],
      footnotes: [], endnotes: [], error: undefined
    });

    const { result } = renderHook(() => useDocuments());
    
    const mockFile = new File(['test content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    await act(async () => {
      await result.current.addDocument(mockFile);
    });

    // Wait for processing to complete
    await waitFor(() => {
      expect(result.current.documents[0]?.isProcessing).toBe(false);
    });

    expect(result.current.documents).toHaveLength(1);
    expect(result.current.documents[0]).toMatchObject({
      id: 'mock-uuid-123',
      name: 'test.docx',
      file: mockFile,
      size: mockFile.size,
      isProcessing: false,
    });
    
    expect(result.current.comments).toHaveLength(1);
    expect(result.current.comments[0]).toMatchObject({
      id: 'mock-uuid-123-1',
      author: 'Test Author',
      plainText: 'Test comment',
    });

    expect(toast.success).toHaveBeenCalledWith('Document "test.docx" uploaded successfully');
    expect(toast.success).toHaveBeenCalledWith('Extracted 1 comment(s) from "test.docx"');
  });

  it('rejects non-.docx files', async () => {
    const { isValidDocxFile } = await import('../utils/docxParser');
    const { toast } = await import('react-hot-toast');
    
    vi.mocked(isValidDocxFile).mockReturnValue(false);
    
    const { result } = renderHook(() => useDocuments());
    
    const mockFile = new File(['test content'], 'test.txt', {
      type: 'text/plain'
    });

    await act(async () => {
      await result.current.addDocument(mockFile);
    });

    expect(result.current.documents).toHaveLength(0);
    expect(toast.error).toHaveBeenCalledWith('Only .docx files are supported');
  });

  it('prevents duplicate file uploads', async () => {
    const { parseDocxComments, isValidDocxFile } = await import('../utils/docxParser');
    const { toast } = await import('react-hot-toast');
    
    vi.mocked(isValidDocxFile).mockReturnValue(true);
    vi.mocked(parseDocxComments).mockResolvedValue({
      comments: [],
      footnotes: [], endnotes: [], error: undefined
    });

    const { result } = renderHook(() => useDocuments());
    
    const mockFile = new File(['test content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    await act(async () => {
      await result.current.addDocument(mockFile);
    });

    await act(async () => {
      await result.current.addDocument(mockFile);
    });

    expect(result.current.documents).toHaveLength(1);
    expect(toast.error).toHaveBeenCalledWith('Document already uploaded');
  });

  it('handles parsing errors gracefully', async () => {
    const { parseDocxComments, isValidDocxFile } = await import('../utils/docxParser');
    const { toast } = await import('react-hot-toast');
    
    vi.mocked(isValidDocxFile).mockReturnValue(true);
    vi.mocked(parseDocxComments).mockResolvedValue({
      comments: [],
      footnotes: [], endnotes: [], error: 'Invalid document structure'
    });

    const { result } = renderHook(() => useDocuments());
    
    const mockFile = new File(['test content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    await act(async () => {
      await result.current.addDocument(mockFile);
    });

    // Wait for processing to complete
    await waitFor(() => {
      expect(result.current.documents[0]?.isProcessing).toBe(false);
    });

    expect(result.current.documents[0].processingError).toBe('Invalid document structure');
    expect(toast.error).toHaveBeenCalledWith('Error parsing "test.docx": Invalid document structure');
  });

  it('removes document and associated comments correctly', async () => {
    const { parseDocxComments, isValidDocxFile } = await import('../utils/docxParser');
    
    vi.mocked(isValidDocxFile).mockReturnValue(true);
    vi.mocked(parseDocxComments).mockResolvedValue({
      comments: [{
        id: 'mock-uuid-123-1',
        author: 'Test Author',
        initial: 'TA',
        date: new Date('2023-01-01'),
        plainText: 'Test comment',
        content: '<p>Test comment</p>',
        documentId: 'mock-uuid-123',
        reference: 'Comment 1'
      }],
      footnotes: [], endnotes: [], error: undefined
    });

    const { result } = renderHook(() => useDocuments());
    
    const mockFile = new File(['test content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    await act(async () => {
      await result.current.addDocument(mockFile);
    });

    // Wait for processing to complete
    await waitFor(() => {
      expect(result.current.documents[0]?.isProcessing).toBe(false);
    });

    const documentId = result.current.documents[0].id;

    act(() => {
      result.current.removeDocument(documentId);
    });

    expect(result.current.documents).toHaveLength(0);
    expect(result.current.comments).toHaveLength(0);
  });

  it('sets active document', async () => {
    const { parseDocxComments, isValidDocxFile } = await import('../utils/docxParser');
    
    vi.mocked(isValidDocxFile).mockReturnValue(true);
    vi.mocked(parseDocxComments).mockResolvedValue({
      comments: [],
      footnotes: [], endnotes: [], error: undefined
    });

    const { result } = renderHook(() => useDocuments());
    
    const mockFile = new File(['test content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    await act(async () => {
      await result.current.addDocument(mockFile);
    });

    const documentId = result.current.documents[0].id;

    act(() => {
      result.current.setActiveDocument(documentId);
    });

    expect(result.current.activeDocumentId).toBe(documentId);
  });

  it('handles document selection functions', async () => {
    const { parseDocxComments, isValidDocxFile } = await import('../utils/docxParser');
    
    vi.mocked(isValidDocxFile).mockReturnValue(true);
    vi.mocked(parseDocxComments).mockResolvedValue({
      comments: [],
      footnotes: [], endnotes: [], error: undefined
    });

    // Mock crypto.randomUUID to return predictable IDs
    let uuidCounter = 0;
    const mockRandomUUID = vi.fn(() => `doc-${++uuidCounter}`);
    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      value: mockRandomUUID,
      writable: true
    });

    const { result } = renderHook(() => useDocuments());
    
    // Add multiple documents
    const mockFile1 = new File(['test content 1'], 'test1.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    const mockFile2 = new File(['test content 2'], 'test2.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    await act(async () => {
      await result.current.addDocument(mockFile1);
    });
    
    await act(async () => {
      await result.current.addDocument(mockFile2);
    });

    const doc1Id = result.current.documents[0].id;
    const doc2Id = result.current.documents[1].id;

    // Initially no documents selected
    expect(result.current.selectedDocumentIds).toEqual([]);

    // Select first document
    act(() => {
      result.current.selectDocument(doc1Id);
    });
    expect(result.current.selectedDocumentIds).toEqual([doc1Id]);

    // Select second document
    act(() => {
      result.current.selectDocument(doc2Id);
    });
    expect(result.current.selectedDocumentIds).toEqual([doc1Id, doc2Id]);

    // Deselect first document
    act(() => {
      result.current.deselectDocument(doc1Id);
    });
    expect(result.current.selectedDocumentIds).toEqual([doc2Id]);

    // Select all documents
    act(() => {
      result.current.selectAllDocuments();
    });
    expect(result.current.selectedDocumentIds).toEqual([doc1Id, doc2Id]);

    // Deselect all documents
    act(() => {
      result.current.deselectAllDocuments();
    });
    expect(result.current.selectedDocumentIds).toEqual([]);

    // Test toggle functionality
    act(() => {
      result.current.toggleDocumentSelection(doc1Id);
    });
    expect(result.current.selectedDocumentIds).toEqual([doc1Id]);

    act(() => {
      result.current.toggleDocumentSelection(doc1Id);
    });
    expect(result.current.selectedDocumentIds).toEqual([]);
  });
});