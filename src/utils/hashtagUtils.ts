/**
 * Utility functions for extracting and working with hashtags in comments
 */

/**
 * Regular expression to match hashtags
 * Matches # followed by alphanumeric characters (no spaces)
 * Word boundaries ensure we don't match partial words
 */
const HASHTAG_REGEX = /#([a-zA-Z0-9]+)\b/g;

/**
 * Extract all hashtags from a text string
 * @param text - The text to scan for hashtags
 * @returns Array of hashtags (without the # symbol), lowercased for consistency
 */
export function extractHashtags(text: string): string[] {
  const hashtags: string[] = [];
  const matches = text.matchAll(HASHTAG_REGEX);
  
  for (const match of matches) {
    if (match[1]) {
      // Store hashtags in lowercase for case-insensitive matching
      hashtags.push(match[1].toLowerCase());
    }
  }
  
  return hashtags;
}

/**
 * Check if a text contains a specific hashtag
 * @param text - The text to search in
 * @param hashtag - The hashtag to search for (with or without # symbol)
 * @returns true if the hashtag is found, false otherwise
 */
export function hasHashtag(text: string, hashtag: string): boolean {
  const normalizedHashtag = hashtag.startsWith('#') ? hashtag.slice(1) : hashtag;
  const hashtags = extractHashtags(text);
  return hashtags.includes(normalizedHashtag.toLowerCase());
}

/**
 * Get unique hashtags from an array of texts
 * @param texts - Array of text strings to scan
 * @returns Sorted array of unique hashtags (without # symbol)
 */
export function getUniqueHashtags(texts: string[]): string[] {
  const allHashtags = texts.flatMap(text => extractHashtags(text));
  const uniqueHashtags = Array.from(new Set(allHashtags));
  return uniqueHashtags.sort();
}
