import React, { useState, useEffect } from 'react';
import { useCommentFilterContext } from '../hooks/useCommentFilterContext';
import { useDocumentContext } from '../hooks/useDocumentContext';
import { useDebounce } from '../hooks/useDebounce';

interface CommentFiltersProps {
  className?: string;
}

/**
 * CommentFilters component for filtering comments in the left panel
 */
export const CommentFilters: React.FC<CommentFiltersProps> = ({ className = '' }) => {
  const { filters, setAuthorFilter, setDateRangeFilter, setSearchTextFilter, setHashtagFilter, resetFilters, getUniqueAuthors, getUniqueHashtags } = useCommentFilterContext();
  const { comments } = useDocumentContext();
  
  // Local state for search input to handle debouncing
  const [searchInput, setSearchInput] = useState(filters.searchText);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update the filter when debounced search changes
  useEffect(() => {
    setSearchTextFilter(debouncedSearch);
  }, [debouncedSearch, setSearchTextFilter]);

  // Get unique authors for dropdown
  const uniqueAuthors = getUniqueAuthors(comments);

  // Get unique hashtags for dropdown
  const uniqueHashtags = getUniqueHashtags(comments);

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // Parse date from input
  const parseDateFromInput = (dateString: string): Date | null => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  const handleReset = () => {
    setSearchInput('');
    resetFilters();
  };

  // Check if any filters are active
  const hasActiveFilters = filters.author || filters.dateRange.start || filters.dateRange.end || filters.searchText || filters.hashtag;

  if (comments.length === 0) {
    return null; // Don't show filters if there are no comments
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Comment Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Author Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Author
        </label>
        <select
          value={filters.author}
          onChange={(e) => setAuthorFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All authors</option>
          {uniqueAuthors.map(author => (
            <option key={author} value={author}>
              {author}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="date"
              value={formatDateForInput(filters.dateRange.start)}
              onChange={(e) => setDateRangeFilter(
                parseDateFromInput(e.target.value),
                filters.dateRange.end
              )}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Start date"
            />
          </div>
          <div>
            <input
              type="date"
              value={formatDateForInput(filters.dateRange.end)}
              onChange={(e) => setDateRangeFilter(
                filters.dateRange.start,
                parseDateFromInput(e.target.value)
              )}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="End date"
            />
          </div>
        </div>
      </div>

      {/* Full-text Search */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Search Comments
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search in comments, authors, references..."
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Hashtag Filter */}
      {uniqueHashtags.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Hashtag
          </label>
          <select
            value={filters.hashtag}
            onChange={(e) => setHashtagFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All hashtags</option>
            {uniqueHashtags.map(hashtag => (
              <option key={hashtag} value={hashtag}>
                #{hashtag}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Filter Status */}
      {hasActiveFilters && (
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
          Active filters: {[
            filters.author && `Author: ${filters.author}`,
            (filters.dateRange.start || filters.dateRange.end) && 'Date range',
            filters.searchText && `Search: "${filters.searchText}"`,
            filters.hashtag && `Hashtag: #${filters.hashtag}`
          ].filter(Boolean).join(', ')}
        </div>
      )}
    </div>
  );
};