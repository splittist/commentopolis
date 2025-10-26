import type { ReportConfig, DocumentComment, MetaComment, UploadedDocument } from '../types';

/**
 * Interface for comment lookup
 */
export interface CommentLookup {
  wordComments: DocumentComment[];
  metaComments: MetaComment[];
  documents: UploadedDocument[];
}

/**
 * Generate a human-readable report from the given configuration
 */
export function generateHumanReport(
  config: ReportConfig,
  lookup: CommentLookup
): string {
  const lines: string[] = [];
  
  // Add title and metadata
  lines.push(config.title);
  
  const generatedDate = config.generatedDate || new Date();
  lines.push(`Generated ${formatDate(generatedDate)}`);
  lines.push('');
  
  // Add document list if there are documents
  const documentSet = new Set<string>();
  config.sections.forEach(section => {
    section.commentIds.forEach(commentId => {
      const wordComment = lookup.wordComments.find(c => c.id === commentId);
      if (wordComment) {
        documentSet.add(wordComment.documentId);
      }
    });
  });
  
  if (documentSet.size > 0) {
    lines.push('Documents:');
    documentSet.forEach(docId => {
      const doc = lookup.documents.find(d => d.id === docId);
      if (doc) {
        lines.push(`- ${doc.name}`);
      }
    });
    lines.push('');
  }
  
  // Process each section
  config.sections.forEach((section, index) => {
    if (index > 0) {
      lines.push('');
    }
    
    lines.push(section.title.toUpperCase());
    lines.push('');
    
    // Process each comment in the section
    section.commentIds.forEach(commentId => {
      // Check if it's a word comment
      const wordComment = lookup.wordComments.find(c => c.id === commentId);
      if (wordComment) {
        lines.push(...formatWordComment(wordComment, lookup));
        lines.push('');
        return;
      }
      
      // Check if it's a meta-comment
      const metaComment = lookup.metaComments.find(c => c.id === commentId);
      if (metaComment) {
        lines.push(...formatMetaComment(metaComment, lookup));
        lines.push('');
        return;
      }
    });
  });
  
  // Add "Questions for Follow-up" section if requested
  if (config.includeQuestions) {
    const questionComments = findQuestionComments(config, lookup);
    if (questionComments.length > 0) {
      lines.push('');
      lines.push('QUESTIONS FOR FOLLOW-UP');
      lines.push('');
      
      questionComments.forEach(question => {
        lines.push(`- ${question.text}`);
      });
    }
  }
  
  return lines.join('\n');
}

/**
 * Format a word comment with attribution
 */
function formatWordComment(
  comment: DocumentComment,
  lookup: CommentLookup
): string[] {
  const lines: string[] = [];
  
  // Get document name
  const doc = lookup.documents.find(d => d.id === comment.documentId);
  const docName = doc?.name || 'Unknown Document';
  
  // Format attribution line
  const dateStr = formatDate(comment.date);
  lines.push(`${comment.author} (${docName}, ${dateStr}):`);
  
  // Add comment text (strip HTML tags for clean prose)
  const cleanText = stripHtmlTags(comment.content);
  lines.push(`"${cleanText}"`);
  
  // Add linked comments context if present
  if (comment.parentId) {
    const parentComment = lookup.wordComments.find(c => c.paraId === comment.parentId);
    if (parentComment) {
      lines.push('');
      lines.push(`[In response to ${parentComment.author}:]`);
      const parentText = stripHtmlTags(parentComment.content);
      lines.push(`"${parentText}"`);
    }
  }
  
  return lines;
}

/**
 * Format a meta-comment with "My Analysis:" prefix
 */
function formatMetaComment(
  metaComment: MetaComment,
  lookup: CommentLookup
): string[] {
  const lines: string[] = [];
  
  lines.push('My Analysis:');
  lines.push(metaComment.text);
  
  // Add linked comments context if relevant
  if (metaComment.linkedComments.length > 0) {
    lines.push('');
    lines.push('[Based on comments from:');
    
    metaComment.linkedComments.forEach(linkedId => {
      const wordComment = lookup.wordComments.find(c => c.id === linkedId);
      if (wordComment) {
        const doc = lookup.documents.find(d => d.id === wordComment.documentId);
        const docName = doc?.name || 'Unknown Document';
        lines.push(`- ${wordComment.author} (${docName})`);
      } else {
        const linkedMetaComment = lookup.metaComments.find(c => c.id === linkedId);
        if (linkedMetaComment) {
          lines.push(`- ${linkedMetaComment.author} (Meta-comment)`);
        }
      }
    });
    
    lines.push(']');
  }
  
  return lines;
}

/**
 * Find all question-type meta-comments included in the report
 */
function findQuestionComments(
  config: ReportConfig,
  lookup: CommentLookup
): MetaComment[] {
  const questionComments: MetaComment[] = [];
  
  config.sections.forEach(section => {
    section.commentIds.forEach(commentId => {
      const metaComment = lookup.metaComments.find(c => c.id === commentId);
      if (metaComment && metaComment.type === 'question') {
        questionComments.push(metaComment);
      }
    });
  });
  
  return questionComments;
}

/**
 * Format a date for human-readable display
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
}

/**
 * Strip HTML tags from text for clean prose output
 */
function stripHtmlTags(html: string): string {
  // Use DOMParser to safely parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Get text content and clean up whitespace
  let text = doc.body.textContent || '';
  
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Generate a default report config from selected comments
 */
export function generateDefaultReportConfig(
  title: string,
  selectedCommentIds: string[],
  _metaComments: MetaComment[]
): ReportConfig {
  // Create a single section with all selected comments
  const sections = selectedCommentIds.length > 0 ? [
    {
      title: 'Analysis',
      commentIds: selectedCommentIds
    }
  ] : [];
  
  return {
    title,
    sections,
    includeQuestions: true,
    generatedDate: new Date()
  };
}
