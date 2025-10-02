import { useState, useCallback } from 'react';
import type { CommentFilters, CommentFilterState, DocumentComment } from '../types';

const DEFAULT_FILTERS: CommentFilters = {
  author: '',
  dateRange: {
    start: null,
    end: null,
  },
  searchText: '',
};

/**
 * Custom hook for managing comment filters
 */
export const useCommentFilters = (): CommentFilterState => {
  const [filters, setFilters] = useState<CommentFilters>(DEFAULT_FILTERS);

  const setAuthorFilter = useCallback((author: string) => {
    setFilters(prev => ({ ...prev, author }));
  }, []);

  const setDateRangeFilter = useCallback((start: Date | null, end: Date | null) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { start, end },
    }));
  }, []);

  const setSearchTextFilter = useCallback((searchText: string) => {
    setFilters(prev => ({ ...prev, searchText }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const getFilteredComments = useCallback((comments: DocumentComment[]): DocumentComment[] => {
    return comments.filter(comment => {
      // Author filter
      if (filters.author && comment.author !== filters.author) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const commentDate = new Date(comment.date);
        if (filters.dateRange.start && commentDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end && commentDate > filters.dateRange.end) {
          return false;
        }
      }

      // Full-text search filter
      if (filters.searchText) {
        const searchTerm = filters.searchText.toLowerCase();
        const matchesText = comment.plainText.toLowerCase().includes(searchTerm);
        const matchesAuthor = comment.author.toLowerCase().includes(searchTerm);
        const matchesReference = comment.reference?.toLowerCase().includes(searchTerm) || false;
        
        if (!matchesText && !matchesAuthor && !matchesReference) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  const getUniqueAuthors = useCallback((comments: DocumentComment[]): string[] => {
    const authors = new Set(comments.map(comment => comment.author));
    return Array.from(authors).sort();
  }, []);

  return {
    filters,
    setAuthorFilter,
    setDateRangeFilter,
    setSearchTextFilter,
    resetFilters,
    getFilteredComments,
    getUniqueAuthors,
  };
};