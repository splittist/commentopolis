/**
 * DOCX to HTML Transformer
 * Converts Word document runs and paragraphs from XML to HTML format
 */

export interface TransformedContent {
  html: string;
  plainText: string;
}

export interface RunProperties {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: string;
  color?: string;
  fontFamily?: string;
}

export interface ParagraphProperties {
  alignment?: 'left' | 'center' | 'right' | 'justify';
  indentation?: {
    left?: number;
    right?: number;
    firstLine?: number;
  };
  spacing?: {
    before?: number;
    after?: number;
    lineSpacing?: number;
  };
}

/**
 * Extract run properties from Word XML run properties element
 */
function extractRunProperties(rPrElement: Element | null): RunProperties {
  const props: RunProperties = {};
  
  if (!rPrElement) return props;

  // Bold
  if (rPrElement.querySelector('w\\:b, b')) {
    props.bold = true;
  }

  // Italic
  if (rPrElement.querySelector('w\\:i, i')) {
    props.italic = true;
  }

  // Underline
  if (rPrElement.querySelector('w\\:u, u')) {
    props.underline = true;
  }

  // Font size
  const szElement = rPrElement.querySelector('w\\:sz, sz');
  if (szElement) {
    const val = szElement.getAttribute('w:val') || szElement.getAttribute('val');
    if (val) {
      // Word font size is in half-points, convert to points
      props.fontSize = `${Math.round(parseInt(val) / 2)}pt`;
    }
  }

  // Font color
  const colorElement = rPrElement.querySelector('w\\:color, color');
  if (colorElement) {
    const val = colorElement.getAttribute('w:val') || colorElement.getAttribute('val');
    if (val && val !== 'auto') {
      props.color = `#${val}`;
    }
  }

  // Font family
  const rFontsElement = rPrElement.querySelector('w\\:rFonts, rFonts');
  if (rFontsElement) {
    const ascii = rFontsElement.getAttribute('w:ascii') || 
                  rFontsElement.getAttribute('ascii');
    if (ascii) {
      props.fontFamily = ascii;
    }
  }

  return props;
}

/**
 * Extract paragraph properties from Word XML paragraph properties element
 */
function extractParagraphProperties(pPrElement: Element | null): ParagraphProperties {
  const props: ParagraphProperties = {};
  
  if (!pPrElement) return props;

  // Alignment
  const jcElement = pPrElement.querySelector('w\\:jc, jc');
  if (jcElement) {
    const val = jcElement.getAttribute('w:val') || jcElement.getAttribute('val');
    if (val) {
      switch (val) {
        case 'center':
          props.alignment = 'center';
          break;
        case 'right':
          props.alignment = 'right';
          break;
        case 'both':
          props.alignment = 'justify';
          break;
        default:
          props.alignment = 'left';
      }
    }
  }

  // Indentation
  const indElement = pPrElement.querySelector('w\\:ind, ind');
  if (indElement) {
    props.indentation = {};
    
    const left = indElement.getAttribute('w:left') || indElement.getAttribute('left');
    if (left) {
      props.indentation.left = parseInt(left);
    }
    
    const right = indElement.getAttribute('w:right') || indElement.getAttribute('right');
    if (right) {
      props.indentation.right = parseInt(right);
    }
    
    const firstLine = indElement.getAttribute('w:firstLine') || 
                      indElement.getAttribute('firstLine');
    if (firstLine) {
      props.indentation.firstLine = parseInt(firstLine);
    }
  }

  return props;
}

/**
 * Apply run properties to create inline CSS styles
 */
function createRunStyles(props: RunProperties): string {
  const styles: string[] = [];

  if (props.bold) styles.push('font-weight: bold');
  if (props.italic) styles.push('font-style: italic');
  if (props.underline) styles.push('text-decoration: underline');
  if (props.fontSize) styles.push(`font-size: ${props.fontSize}`);
  if (props.color) styles.push(`color: ${props.color}`);
  if (props.fontFamily) styles.push(`font-family: "${props.fontFamily}"`);

  return styles.join('; ');
}

/**
 * Apply paragraph properties to create inline CSS styles
 */
function createParagraphStyles(props: ParagraphProperties): string {
  const styles: string[] = [];

  if (props.alignment) {
    styles.push(`text-align: ${props.alignment}`);
  }

  if (props.indentation) {
    if (props.indentation.left) {
      // Convert from twips to pixels (assuming 96 DPI)
      const leftPx = Math.round(props.indentation.left / 20 * 96 / 72);
      styles.push(`margin-left: ${leftPx}px`);
    }
    
    if (props.indentation.right) {
      const rightPx = Math.round(props.indentation.right / 20 * 96 / 72);
      styles.push(`margin-right: ${rightPx}px`);
    }
    
    if (props.indentation.firstLine) {
      const firstLinePx = Math.round(props.indentation.firstLine / 20 * 96 / 72);
      styles.push(`text-indent: ${firstLinePx}px`);
    }
  }

  return styles.join('; ');
}

/**
 * Transform a Word run element to HTML
 */
function transformRun(runElement: Element): string {
  // Get run properties
  const rPrElement = runElement.querySelector('w\\:rPr, rPr');
  const runProps = extractRunProperties(rPrElement);

  // Get text content
  const textElements = runElement.querySelectorAll('w\\:t, t');
  const text = Array.from(textElements)
    .map(el => el.textContent || '')
    .join('');

  if (!text.trim()) {
    return '';
  }

  // Apply formatting
  const styles = createRunStyles(runProps);
  
  if (styles) {
    return `<span style="${styles}">${escapeHtml(text)}</span>`;
  }
  
  return escapeHtml(text);
}

/**
 * Transform a Word paragraph element to HTML
 */
function transformParagraph(paragraphElement: Element): string {
  // Get paragraph properties
  const pPrElement = paragraphElement.querySelector('w\\:pPr, pPr');
  const paragraphProps = extractParagraphProperties(pPrElement);

  // Transform all runs in the paragraph
  const runElements = paragraphElement.querySelectorAll('w\\:r, r');
  const runContent = Array.from(runElements)
    .map(run => transformRun(run))
    .filter(content => content.trim())
    .join('');

  if (!runContent.trim()) {
    return '<p></p>'; // Empty paragraph
  }

  // Apply paragraph styling
  const styles = createParagraphStyles(paragraphProps);
  
  if (styles) {
    return `<p style="${styles}">${runContent}</p>`;
  }
  
  return `<p>${runContent}</p>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Transform Word document XML to HTML
 */
export function transformDocumentToHtml(documentXml: Document): TransformedContent {
  // Find all paragraph elements in the document body
  const body = documentXml.querySelector('w\\:body, body');
  if (!body) {
    return {
      html: '<p>No document content found.</p>',
      plainText: 'No document content found.'
    };
  }

  const paragraphElements = body.querySelectorAll('w\\:p, p');
  
  if (paragraphElements.length === 0) {
    return {
      html: '<p>No paragraphs found in document.</p>',
      plainText: 'No paragraphs found in document.'
    };
  }

  // Transform each paragraph
  const htmlParts = Array.from(paragraphElements)
    .map(p => transformParagraph(p))
    .filter(html => html.trim());

  const html = htmlParts.join('\n');
  
  // Extract plain text for search/indexing
  const plainText = Array.from(paragraphElements)
    .map(p => {
      const textElements = p.querySelectorAll('w\\:t, t');
      return Array.from(textElements)
        .map(el => el.textContent || '')
        .join('');
    })
    .filter(text => text.trim())
    .join('\n');

  return {
    html: html || '<p>No content to display.</p>',
    plainText: plainText || 'No content to display.'
  };
}