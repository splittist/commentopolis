import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommentList } from './CommentList';
import type { DocumentComment, UploadedDocument } from '../types';

// Mock the useDocumentContext hook
const mockSetSelectedComment = vi.fn();
const mockUseDocumentContext = vi.fn();

vi.mock('../hooks/useDocumentContext', () => ({
  useDocumentContext: () => mockUseDocumentContext(),
}));

describe('CommentList', () => {
  const mockDocuments: UploadedDocument[] = [
    {
      id: 'doc1',
      name: 'Test Document 1.docx',
      file: new File([''], 'test1.docx'),
      uploadDate: new Date('2023-01-01'),
      size: 1000,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
    {
      id: 'doc2',
      name: 'Test Document 2.docx',
      file: new File([''], 'test2.docx'),
      uploadDate: new Date('2023-01-02'),
      size: 2000,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
  ];

  const mockComments: DocumentComment[] = [
    {
      id: 'comment1',
      author: 'John Doe',
      initial: 'JD',
      date: new Date('2023-01-01T10:00:00Z'),
      text: 'This is the first comment',
      documentId: 'doc1',
      reference: 'Comment 1',
    },
    {
      id: 'comment2',
      author: 'Jane Smith',
      initial: 'JS',
      date: new Date('2023-01-01T11:00:00Z'),
      text: 'This is the second comment',
      documentId: 'doc1',
      reference: 'Comment 2',
    },
    {
      id: 'comment3',
      author: 'Bob Johnson',
      initial: 'BJ',
      date: new Date('2023-01-02T09:00:00Z'),
      text: 'This is a comment from another document',
      documentId: 'doc2',
      reference: 'Comment 3',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      comments: mockComments,
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
    });
  });

  it('should render empty state when no comments are available', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: [],
      activeDocumentId: null,
      comments: [],
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
    });

    render(<CommentList />);

    expect(screen.getByText('No comments found')).toBeInTheDocument();
    expect(screen.getByText('Upload a .docx document to see extracted comments')).toBeInTheDocument();
  });

  it('should render all comments when no active document is selected', () => {
    render(<CommentList />);

    expect(screen.getByText('Comments (3)')).toBeInTheDocument();
    expect(screen.getByText('This is the first comment')).toBeInTheDocument();
    expect(screen.getByText('This is the second comment')).toBeInTheDocument();
    expect(screen.getByText('This is a comment from another document')).toBeInTheDocument();
  });

  it('should render only comments from active document when one is selected', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: 'doc1',
      comments: mockComments,
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
    });

    render(<CommentList />);

    expect(screen.getByText('Comments (Test Document 1.docx)')).toBeInTheDocument();
    expect(screen.getByText('This is the first comment')).toBeInTheDocument();
    expect(screen.getByText('This is the second comment')).toBeInTheDocument();
    expect(screen.queryByText('This is a comment from another document')).not.toBeInTheDocument();
  });

  it('should handle comment selection', () => {
    render(<CommentList />);

    const firstComment = screen.getByText('This is the first comment').closest('div');
    expect(firstComment).toBeInTheDocument();

    fireEvent.click(firstComment!);
    expect(mockSetSelectedComment).toHaveBeenCalledWith('comment1');
  });

  it('should show selected comment with visual indicator', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      comments: mockComments,
      selectedCommentId: 'comment1',
      setSelectedComment: mockSetSelectedComment,
    });

    render(<CommentList />);

    expect(screen.getByText('✓ Selected for review')).toBeInTheDocument();
  });

  it('should allow deselection of selected comment', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      comments: mockComments,
      selectedCommentId: 'comment1',
      setSelectedComment: mockSetSelectedComment,
    });

    render(<CommentList />);

    const firstComment = screen.getByText('This is the first comment').closest('div');
    fireEvent.click(firstComment!);
    expect(mockSetSelectedComment).toHaveBeenCalledWith(null);
  });

  it('should render author initials and names correctly', () => {
    render(<CommentList />);

    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('JS')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should display comment references', () => {
    render(<CommentList />);

    expect(screen.getByText('Comment 1')).toBeInTheDocument();
    expect(screen.getByText('Comment 2')).toBeInTheDocument();
    expect(screen.getByText('Comment 3')).toBeInTheDocument();
  });

  it('should handle sorting by date descending (default)', () => {
    render(<CommentList />);

    const commentElements = screen.getAllByText(/This is/);
    // Should be sorted by date descending (newest first)
    expect(commentElements[0]).toHaveTextContent('This is a comment from another document'); // 2023-01-02
    expect(commentElements[1]).toHaveTextContent('This is the second comment'); // 2023-01-01 11:00
    expect(commentElements[2]).toHaveTextContent('This is the first comment'); // 2023-01-01 10:00
  });

  it('should allow sorting by author ascending', () => {
    render(<CommentList />);

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'author-asc' } });

    const commentElements = screen.getAllByText(/This is/);
    // Should be sorted by author A-Z
    expect(commentElements[0]).toHaveTextContent('This is a comment from another document'); // Bob Johnson
    expect(commentElements[1]).toHaveTextContent('This is the second comment'); // Jane Smith
    expect(commentElements[2]).toHaveTextContent('This is the first comment'); // John Doe
  });

  it('should show document groupings when multiple documents have comments', () => {
    render(<CommentList />);

    expect(screen.getByText('📄 Test Document 1.docx (2)')).toBeInTheDocument();
    expect(screen.getByText('📄 Test Document 2.docx (1)')).toBeInTheDocument();
  });

  it('should display empty state for documents with no comments', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: 'doc1',
      comments: [],
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
    });

    render(<CommentList />);

    expect(screen.getByText('No comments found')).toBeInTheDocument();
    expect(screen.getByText('No comments were found in the selected document(s)')).toBeInTheDocument();
  });
});