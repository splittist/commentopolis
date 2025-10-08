import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCommentFilters } from './useCommentFilters';
import type { DocumentComment } from '../types';

describe('useCommentFilters', () => {
  const mockComments: DocumentComment[] = [
    {
      id: 'comment1',
      author: 'John Doe',
      date: new Date('2023-01-01T10:00:00Z'),
      plainText: 'This is a test comment about implementation #budget',
      content: '<p>This is a test comment about implementation #budget</p>',
      documentId: 'doc1',
      reference: 'Page 1',
    },
    {
      id: 'comment2',
      author: 'Jane Smith',
      date: new Date('2023-01-02T11:00:00Z'),
      plainText: 'Another comment about the project #timeline',
      content: '<p>Another comment about the project #timeline</p>',
      documentId: 'doc1',
      reference: 'Page 2',
    },
    {
      id: 'comment3',
      author: 'John Doe',
      date: new Date('2023-01-03T12:00:00Z'),
      plainText: 'Final comment on the design #budget #review',
      content: '<p>Final comment on the design #budget #review</p>',
      documentId: 'doc2',
    },
  ];

  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useCommentFilters());

    expect(result.current.filters.author).toBe('');
    expect(result.current.filters.dateRange.start).toBeNull();
    expect(result.current.filters.dateRange.end).toBeNull();
    expect(result.current.filters.searchText).toBe('');
    expect(result.current.filters.hashtag).toBe('');
  });

  it('should filter comments by author', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setAuthorFilter('John Doe');
    });

    const filteredComments = result.current.getFilteredComments(mockComments);
    expect(filteredComments).toHaveLength(2);
    expect(filteredComments.every(comment => comment.author === 'John Doe')).toBe(true);
  });

  it('should filter comments by search text', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setSearchTextFilter('implementation');
    });

    const filteredComments = result.current.getFilteredComments(mockComments);
    expect(filteredComments).toHaveLength(1);
    expect(filteredComments[0].plainText).toContain('implementation');
  });

  it('should filter comments by date range', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setDateRangeFilter(
        new Date('2023-01-01'),
        new Date('2023-01-02T23:59:59') // Include the end of the day
      );
    });

    const filteredComments = result.current.getFilteredComments(mockComments);
    expect(filteredComments).toHaveLength(2);
  });

  it('should apply multiple filters together', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setAuthorFilter('John Doe');
      result.current.setSearchTextFilter('design');
    });

    const filteredComments = result.current.getFilteredComments(mockComments);
    expect(filteredComments).toHaveLength(1);
    expect(filteredComments[0].author).toBe('John Doe');
    expect(filteredComments[0].plainText).toContain('design');
  });

  it('should reset all filters', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setAuthorFilter('John Doe');
      result.current.setSearchTextFilter('test');
      result.current.setHashtagFilter('budget');
      result.current.setDateRangeFilter(new Date('2023-01-01'), new Date('2023-01-02'));
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filters.author).toBe('');
    expect(result.current.filters.dateRange.start).toBeNull();
    expect(result.current.filters.dateRange.end).toBeNull();
    expect(result.current.filters.searchText).toBe('');
    expect(result.current.filters.hashtag).toBe('');
  });

  it('should get unique authors from comments', () => {
    const { result } = renderHook(() => useCommentFilters());

    const uniqueAuthors = result.current.getUniqueAuthors(mockComments);
    expect(uniqueAuthors).toEqual(['Jane Smith', 'John Doe']);
  });

  it('should search in author names and references', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setSearchTextFilter('Jane');
    });

    const filteredComments = result.current.getFilteredComments(mockComments);
    expect(filteredComments).toHaveLength(1);
    expect(filteredComments[0].author).toBe('Jane Smith');
  });

  it('should handle empty search text', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setSearchTextFilter('');
    });

    const filteredComments = result.current.getFilteredComments(mockComments);
    expect(filteredComments).toHaveLength(3);
  });

  it('should filter comments by hashtag', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setHashtagFilter('budget');
    });

    const filteredComments = result.current.getFilteredComments(mockComments);
    expect(filteredComments).toHaveLength(2);
    expect(filteredComments.every(comment => comment.plainText.includes('#budget'))).toBe(true);
  });

  it('should filter comments by hashtag with # symbol', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setHashtagFilter('#budget');
    });

    const filteredComments = result.current.getFilteredComments(mockComments);
    expect(filteredComments).toHaveLength(2);
  });

  it('should be case-insensitive for hashtag filter', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setHashtagFilter('BUDGET');
    });

    const filteredComments = result.current.getFilteredComments(mockComments);
    expect(filteredComments).toHaveLength(2);
  });

  it('should get unique hashtags from comments', () => {
    const { result } = renderHook(() => useCommentFilters());

    const uniqueHashtags = result.current.getUniqueHashtags(mockComments);
    expect(uniqueHashtags).toEqual(['budget', 'review', 'timeline']);
  });

  it('should combine hashtag filter with other filters', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setAuthorFilter('John Doe');
      result.current.setHashtagFilter('budget');
    });

    const filteredComments = result.current.getFilteredComments(mockComments);
    expect(filteredComments).toHaveLength(2);
    expect(filteredComments.every(comment => 
      comment.author === 'John Doe' && comment.plainText.includes('#budget')
    )).toBe(true);
  });
});