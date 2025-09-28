import JSZip from 'jszip';
import type { DocumentComment } from '../types';

export interface DocxParseResult {
  comments: DocumentComment[];
  error?: string;
  // Additional XML DOM objects
  documentXml?: Document;
  stylesXml?: Document;
  numberingXml?: Document;
  commentsXml?: Document;
  commentsExtendedXml?: Document;
}

/**
 * Parse XML string into DOM object with error handling
 */
function parseXmlToDom(xmlText: string, filename: string): Document | undefined {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.warn(`XML parsing error in ${filename}:`, parserError.textContent);
      return undefined;
    }
    
    return xmlDoc;
  } catch (error) {
    console.error(`Error parsing XML for ${filename}:`, error);
    return undefined;
  }
}

/**
 * Parse XML text to extract comment data
 */
function parseCommentsXml(xmlText: string, documentId: string): DocumentComment[] {
  const comments: DocumentComment[] = [];
  
  const xmlDoc = parseXmlToDom(xmlText, 'comments.xml');
  if (!xmlDoc) {
    return comments;
  }
  
  try {
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
 * Parse a .docx file to extract comments and additional XML parts
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
    
    // Define XML files to extract
    const xmlFiles = {
      document: 'word/document.xml',
      styles: 'word/styles.xml',
      numbering: 'word/numbering.xml',
      comments: 'word/comments.xml',
      commentsExtended: 'word/commentsExtended.xml'
    };
    
    // Extract XML files asynchronously
    const xmlExtractionPromises = Object.entries(xmlFiles).map(async ([key, filePath]) => {
      const zipFile = zip.file(filePath);
      if (zipFile) {
        try {
          const xmlContent = await zipFile.async('text');
          return { key, content: xmlContent, path: filePath };
        } catch (error) {
          console.warn(`Error extracting ${filePath}:`, error);
          return { key, content: null, path: filePath };
        }
      }
      return { key, content: null, path: filePath };
    });
    
    // Wait for all XML extractions to complete
    const extractedXmls = await Promise.all(xmlExtractionPromises);
    
    // Parse XML strings to DOM objects
    const result: DocxParseResult = {
      comments: [],
      error: undefined
    };
    
    extractedXmls.forEach(({ key, content, path }) => {
      if (content) {
        const xmlDoc = parseXmlToDom(content, path);
        if (xmlDoc) {
          switch (key) {
            case 'document':
              result.documentXml = xmlDoc;
              break;
            case 'styles':
              result.stylesXml = xmlDoc;
              break;
            case 'numbering':
              result.numberingXml = xmlDoc;
              break;
            case 'comments':
              result.commentsXml = xmlDoc;
              // Parse comments for backward compatibility
              result.comments = parseCommentsXml(content, documentId);
              break;
            case 'commentsExtended':
              result.commentsExtendedXml = xmlDoc;
              break;
          }
        }
      } else {
        // Log missing optional files (all except document.xml are optional)
        if (key !== 'document') {
          console.log(`Optional file ${path} not found in .docx archive`);
        }
      }
    });
    
    // Check if required document.xml is missing
    if (!result.documentXml) {
      return {
        comments: [],
        error: 'Required document.xml not found in .docx file'
      };
    }
    
    return result;
    
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