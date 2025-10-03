import JSZip from 'jszip';
import type { DocumentComment, DocumentFootnote } from '../types';
import { transformDocumentToHtml, type TransformedContent } from './docxHtmlTransformer';

export interface DocxParseResult {
  comments: DocumentComment[];
  footnotes: DocumentFootnote[];
  endnotes: DocumentFootnote[];
  error?: string;
  // Additional XML DOM objects
  documentXml?: Document;
  stylesXml?: Document;
  numberingXml?: Document;
  commentsXml?: Document;
  commentsExtendedXml?: Document;
  commentsIdsXml?: Document;
  footnotesXml?: Document;
  endnotesXml?: Document;
  // Extended comment data for processing
  extendedData?: Record<string, { done?: boolean; parentId?: string }>;
  durableIds?: Record<string, string>;
  // Transformed HTML content
  transformedContent?: TransformedContent;
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
        
        // Extract content from nested paragraphs and runs
        const paragraphElements = commentEl.querySelectorAll('w\\:p, p');
        
        // Extract paraId from last paragraph (w14:paraId or w:paraId)
        let paraId: string | undefined;
        if (paragraphElements.length > 0) {
          const lastPara = paragraphElements[paragraphElements.length - 1];
          const paraIdAttr = lastPara.getAttribute('w14:paraId') || 
                            lastPara.getAttribute('w:paraId') ||
                            lastPara.getAttribute('paraId');
          if (paraIdAttr) {
            paraId = paraIdAttr;
          }
        }
        
        // Build HTML content
        const htmlParts: string[] = [];
        const textParts: string[] = [];
        
        paragraphElements.forEach(pEl => {
          const runElements = pEl.querySelectorAll('w\\:r, r');
          
          const runContent = Array.from(runElements).map(rEl => {
            const textElements = rEl.querySelectorAll('w\\:t, t');
            return Array.from(textElements)
              .map(tEl => tEl.textContent || '')
              .join('');
          }).join('');
          
          if (runContent.trim()) {
            htmlParts.push(`<p>${runContent.trim()}</p>`);
            textParts.push(runContent.trim());
          }
        });
        
        const content = htmlParts.join('');
        const plainText = textParts.join(' ');
        
        if (content && plainText) {
          comments.push({
            id: `${documentId}-${id}`,
            paraId,
            author,
            initial,
            date: dateStr ? new Date(dateStr) : new Date(),
            plainText,
            content,
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
 * Parse commentsIds.xml to extract durable IDs
 */
function parseCommentsIdsXml(xmlText: string): Record<string, string> {
  const durableIds: Record<string, string> = {};
  
  const xmlDoc = parseXmlToDom(xmlText, 'commentsIds.xml');
  if (!xmlDoc) {
    return durableIds;
  }
  
  try {
    // Find all commentId elements
    const commentIdElements = xmlDoc.querySelectorAll('w16cid\\:commentId, commentId');
    
    commentIdElements.forEach(commentIdEl => {
      try {
        // Get paraId (maps to w14:paraId from comments.xml)
        const paraId = commentIdEl.getAttribute('w16cid:paraId') || 
                      commentIdEl.getAttribute('paraId');
        
        // Get durableId
        const durableId = commentIdEl.getAttribute('w16cid:durableId') || 
                         commentIdEl.getAttribute('durableId');
        
        if (paraId && durableId) {
          durableIds[paraId] = durableId;
        }
      } catch (error) {
        console.warn('Error parsing individual commentId:', error);
      }
    });
    
  } catch (error) {
    console.error('Error parsing commentsIds XML:', error);
  }
  
  return durableIds;
}

/**
 * Parse commentsExtended.xml to extract done status and threading information
 */
function parseCommentsExtendedXml(xmlText: string): Record<string, { done?: boolean; parentId?: string }> {
  const extendedData: Record<string, { done?: boolean; parentId?: string }> = {};
  
  const xmlDoc = parseXmlToDom(xmlText, 'commentsExtended.xml');
  if (!xmlDoc) {
    return extendedData;
  }
  
  try {
    // Find all commentEx elements
    const commentExtendedElements = xmlDoc.querySelectorAll('w15\\:commentEx, commentEx');
    
    commentExtendedElements.forEach(commentExtEl => {
      try {
        // Try w15 format first (w15:paraId), then fall back to older formats
        const id = commentExtEl.getAttribute('w15:paraId') || 
                   commentExtEl.getAttribute('paraId') ||
                   commentExtEl.getAttribute('w:id') || 
                   commentExtEl.getAttribute('id');
        if (!id) return;
        
        const data: { done?: boolean; parentId?: string } = {};
        
        // Check for done status - w15:done attribute or older w:resolved attribute
        const doneAttr = commentExtEl.getAttribute('w15:done') || 
                        commentExtEl.getAttribute('done') ||
                        commentExtEl.getAttribute('w:resolved') || 
                        commentExtEl.getAttribute('resolved');
        
        if (doneAttr) {
          data.done = doneAttr === '1' || doneAttr === 'true' || doneAttr === 'yes';
        }
        
        // Check for parent comment reference - w15:paraIdParent or older w:parentCommentId
        const parentAttr = commentExtEl.getAttribute('w15:paraIdParent') || 
                          commentExtEl.getAttribute('paraIdParent') ||
                          commentExtEl.getAttribute('w:parentCommentId') || 
                          commentExtEl.getAttribute('parentCommentId');
        
        if (parentAttr) {
          data.parentId = parentAttr;
        }
        
        if (Object.keys(data).length > 0) {
          extendedData[id] = data;
        }
      } catch (error) {
        console.warn('Error parsing individual commentEx:', error);
      }
    });
    
  } catch (error) {
    console.error('Error parsing commentsExtended XML:', error);
  }
  
  return extendedData;
}

/**
 * Apply extended comment data to enhance basic comments with threading and status
 */
function enhanceCommentsWithExtendedData(
  comments: DocumentComment[], 
  extendedData: Record<string, { done?: boolean; parentId?: string }>,
  durableIds: Record<string, string>
): DocumentComment[] {
  // Create a map for quick lookups by paraId
  const commentMap = new Map<string, DocumentComment>();
  
  // First pass: apply extended data and build comment map
  const enhancedComments = comments.map(comment => {
    // Match extended data using paraId (from w14:paraId in comments.xml)
    // which corresponds to w15:paraId in commentsExtended.xml
    const extended = comment.paraId ? extendedData[comment.paraId] : undefined;
    const durableId = comment.paraId ? durableIds[comment.paraId] : undefined;
    
    const enhanced = {
      ...comment,
      durableId,
      done: extended?.done || false,
      parentId: extended?.parentId, // This is the parent's paraId
      children: [] as string[]
    };
    
    // Store in map by paraId for parent/child linking
    if (enhanced.paraId) {
      commentMap.set(enhanced.paraId, enhanced);
    }
    return enhanced;
  });
  
  // Second pass: build children arrays for threading
  enhancedComments.forEach(comment => {
    if (comment.parentId && comment.paraId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(comment.paraId);
      }
    }
  });
  
  return enhancedComments;
}
function parseFootnotesEndnotesXml(
  xmlText: string, 
  documentId: string, 
  type: 'footnote' | 'endnote'
): DocumentFootnote[] {
  const notes: DocumentFootnote[] = [];
  
  const xmlDoc = parseXmlToDom(xmlText, `${type}s.xml`);
  if (!xmlDoc) {
    return notes;
  }
  
  try {
    // Find all footnote/endnote elements
    const noteElements = xmlDoc.querySelectorAll(`w\\:${type}, ${type}`);
    
    noteElements.forEach((noteEl, index) => {
      try {
        const id = noteEl.getAttribute('w:id') || noteEl.getAttribute('id') || `${type}-${index}`;
        const noteType = noteEl.getAttribute('w:type') || noteEl.getAttribute('type') || 'normal';
        
        // Skip separator and continuation separator footnotes - they're formatting elements
        if (noteType === 'separator' || noteType === 'continuationSeparator') {
          return;
        }
        
        // Extract content from nested paragraphs and runs
        const paragraphElements = noteEl.querySelectorAll('w\\:p, p');
        
        // Build HTML content
        const htmlParts: string[] = [];
        const textParts: string[] = [];
        
        paragraphElements.forEach(pEl => {
          const runElements = pEl.querySelectorAll('w\\:r, r');
          
          const runContent = Array.from(runElements).map(rEl => {
            const textElements = rEl.querySelectorAll('w\\:t, t');
            return Array.from(textElements)
              .map(tEl => tEl.textContent || '')
              .join('');
          }).join('');
          
          if (runContent.trim()) {
            htmlParts.push(`<p>${runContent.trim()}</p>`);
            textParts.push(runContent.trim());
          }
        });
        
        const content = htmlParts.join('');
        const plainText = textParts.join(' ');
        
        if (content && plainText) {
          notes.push({
            id: `${documentId}-${type}-${id}`,
            type,
            content,
            plainText,
            documentId,
            noteType: noteType as 'normal' | 'separator' | 'continuationSeparator'
          });
        }
      } catch (error) {
        console.warn(`Error parsing individual ${type}:`, error);
      }
    });
    
  } catch (error) {
    console.error(`Error parsing ${type}s XML:`, error);
  }
  
  return notes;
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
      commentsExtended: 'word/commentsExtended.xml',
      commentsIds: 'word/commentsIds.xml',
      footnotes: 'word/footnotes.xml',
      endnotes: 'word/endnotes.xml'
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
      footnotes: [],
      endnotes: [],
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
              // Store extended data for later enhancement
              result.extendedData = parseCommentsExtendedXml(content);
              break;
            case 'commentsIds':
              result.commentsIdsXml = xmlDoc;
              // Store durable IDs for later enhancement
              result.durableIds = parseCommentsIdsXml(content);
              break;
            case 'footnotes':
              result.footnotesXml = xmlDoc;
              // Parse footnotes
              result.footnotes = parseFootnotesEndnotesXml(content, documentId, 'footnote');
              break;
            case 'endnotes':
              result.endnotesXml = xmlDoc;
              // Parse endnotes
              result.endnotes = parseFootnotesEndnotesXml(content, documentId, 'endnote');
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
    
    // Enhance comments with extended data and/or durable IDs if available
    if ((result.extendedData || result.durableIds) && result.comments.length > 0) {
      result.comments = enhanceCommentsWithExtendedData(
        result.comments, 
        result.extendedData || {},
        result.durableIds || {}
      );
    }
    
    // Check if required document.xml is missing
    if (!result.documentXml) {
      return {
        comments: [],
        footnotes: [],
        endnotes: [],
        error: 'Required document.xml not found in .docx file'
      };
    }

    // Transform document content to HTML
    try {
      result.transformedContent = transformDocumentToHtml(
        result.documentXml, 
        result.footnotes, 
        result.endnotes,
        result.numberingXml,
        result.stylesXml
      );
    } catch (error) {
      console.warn('Error transforming document to HTML:', error);
      // Don't fail the entire parse operation if HTML transformation fails
      result.transformedContent = {
        html: '<p>Error transforming document content to HTML.</p>',
        plainText: 'Error transforming document content to HTML.'
      };
    }
    
    return result;
    
  } catch (error) {
    console.error('Error parsing docx file:', error);
    return {
      comments: [],
      footnotes: [],
      endnotes: [],
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