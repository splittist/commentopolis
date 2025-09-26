import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDocuments } from './useDocuments';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid-123'),
  },
});

describe('useDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty documents array', () => {
    const { result } = renderHook(() => useDocuments());
    
    expect(result.current.documents).toEqual([]);
    expect(result.current.activeDocumentId).toBeNull();
  });

  it('adds valid .docx file', () => {
    const { result } = renderHook(() => useDocuments());
    
    const mockFile = new File(['test content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    act(() => {
      result.current.addDocument(mockFile);
    });

    expect(result.current.documents).toHaveLength(1);
    expect(result.current.documents[0]).toMatchObject({
      id: 'mock-uuid-123',
      name: 'test.docx',
      file: mockFile,
      size: mockFile.size,
    });
  });

  it('rejects non-.docx files', async () => {
    const { toast } = await import('react-hot-toast');
    const { result } = renderHook(() => useDocuments());
    
    const mockFile = new File(['test content'], 'test.txt', {
      type: 'text/plain'
    });

    act(() => {
      result.current.addDocument(mockFile);
    });

    expect(result.current.documents).toHaveLength(0);
    expect(toast.error).toHaveBeenCalledWith('Only .docx files are supported');
  });

  it('prevents duplicate file uploads', async () => {
    const { toast } = await import('react-hot-toast');
    const { result } = renderHook(() => useDocuments());
    
    const mockFile = new File(['test content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    act(() => {
      result.current.addDocument(mockFile);
    });

    act(() => {
      result.current.addDocument(mockFile);
    });

    expect(result.current.documents).toHaveLength(1);
    expect(toast.error).toHaveBeenCalledWith('Document already uploaded');
  });

  it('removes document correctly', () => {
    const { result } = renderHook(() => useDocuments());
    
    const mockFile = new File(['test content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    act(() => {
      result.current.addDocument(mockFile);
    });

    const documentId = result.current.documents[0].id;

    act(() => {
      result.current.removeDocument(documentId);
    });

    expect(result.current.documents).toHaveLength(0);
  });

  it('sets active document', () => {
    const { result } = renderHook(() => useDocuments());
    
    const mockFile = new File(['test content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    act(() => {
      result.current.addDocument(mockFile);
    });

    const documentId = result.current.documents[0].id;

    act(() => {
      result.current.setActiveDocument(documentId);
    });

    expect(result.current.activeDocumentId).toBe(documentId);
  });
});