import JSZip from 'jszip';
import type { DocumentComment } from '../types';

export interface DocxParseResult {
  comments: DocumentComment[];
  error?: string;
}

/**
 * Parse XML text to extract comment data
 */
function parseCommentsXml(xmlText: string, documentId: string): DocumentComment[] {
  const comments: DocumentComment[] = [];
  
  try {
    // Create a simple parser for the comments XML
    // Note: This is a basic implementation. In production, you might want to use a proper XML parser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.warn('XML parsing error:', parserError.textContent);
      return comments;
    }
    
    // Find all comment elements
    const commentElements = xmlDoc.querySelectorAll('w\\:comment, comment');
    
    commentElements.forEach((commentEl, index) => {
      try {
        const id = commentEl.getAttribute('w:id') || commentEl.getAttribute('id') || `comment-${index}`;
        const author = commentEl.getAttribute('w:author') || commentEl.getAttribute('author') || 'Unknown';
        const initial = commentEl.getAttribute('w:initials') || commentEl.getAttribute('initials') || '';
        const dateStr = commentEl.getAttribute('w:date') || commentEl.getAttribute('date') || '';
        
        // Extract comment text from nested elements
        const textElements = commentEl.querySelectorAll('w\\:t, t');
        const text = Array.from(textElements)
          .map(el => el.textContent || '')
          .join(' ')
          .trim();
        
        if (text) {
          comments.push({
            id: `${documentId}-${id}`,
            author,
            initial,
            date: dateStr ? new Date(dateStr) : new Date(),
            text,
            documentId,
            reference: `Comment ${id}`
          });
        }
      } catch (error) {
        console.warn('Error parsing individual comment:', error);
      }
    });
    
  } catch (error) {
    console.error('Error parsing comments XML:', error);
  }
  
  return comments;
}

/**
 * Parse a .docx file to extract comments
 */
export async function parseDocxComments(
  file: File, 
  documentId: string
): Promise<DocxParseResult> {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the docx file as a zip archive
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // Look for comments file
    const commentsFile = zip.file('word/comments.xml');
    
    if (!commentsFile) {
      // No comments found in the document
      return {
        comments: [],
        error: undefined
      };
    }
    
    // Extract comments XML content
    const commentsXml = await commentsFile.async('text');
    
    // Parse the comments XML
    const comments = parseCommentsXml(commentsXml, documentId);
    
    return {
      comments,
      error: undefined
    };
    
  } catch (error) {
    console.error('Error parsing docx file:', error);
    return {
      comments: [],
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    };
  }
}

/**
 * Check if a file is a valid .docx file
 */
export function isValidDocxFile(file: File): boolean {
  const validExtensions = ['.docx'];
  const validMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const hasValidExtension = validExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  const hasValidMimeType = validMimeTypes.includes(file.type) || file.type === '';
  
  return hasValidExtension && hasValidMimeType;
}