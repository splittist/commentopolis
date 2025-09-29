/**
 * DOCX to HTML Transformer
 * Converts Word document runs and paragraphs from XML to HTML format
 */
import type { DocumentFootnote } from '../types';

export interface TransformedContent {
  html: string;
  plainText: string;
}

export interface RunProperties {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean | string; // boolean for simple underline, string for underline types like 'single', 'double', 'none'
  fontSize?: string;
  color?: string;
  fontFamily?: string;
  highlight?: string;
  strikethrough?: boolean;
  doubleStrikethrough?: boolean;
  allCaps?: boolean;
  smallCaps?: boolean;
  verticalAlign?: 'superscript' | 'subscript';
  // Tracked changes properties
  revision?: {
    type: 'insertion' | 'deletion' | 'moveFrom' | 'moveTo';
    author?: string;
    date?: string;
    id?: string;
  };
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

export interface TableProperties {
  alignment?: 'left' | 'center' | 'right';
  width?: string;
  border?: {
    style?: string;
    width?: string;
    color?: string;
  };
}

export interface TableCellProperties {
  width?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  verticalAlignment?: 'top' | 'middle' | 'bottom';
  background?: string;
  border?: {
    top?: { style?: string; width?: string; color?: string; };
    bottom?: { style?: string; width?: string; color?: string; };
    left?: { style?: string; width?: string; color?: string; };
    right?: { style?: string; width?: string; color?: string; };
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

  // Underline - handle different types
  const underlineElement = rPrElement.querySelector('w\\:u, u');
  if (underlineElement) {
    const val = underlineElement.getAttribute('w:val') || underlineElement.getAttribute('val');
    if (val) {
      // Store the underline type for more sophisticated handling
      props.underline = val;
    } else {
      // Default to true for simple underline elements
      props.underline = true;
    }
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

  // Highlight
  const highlightElement = rPrElement.querySelector('w\\:highlight, highlight');
  if (highlightElement) {
    const val = highlightElement.getAttribute('w:val') || highlightElement.getAttribute('val');
    if (val && val !== 'none') {
      props.highlight = val;
    }
  }

  // Strikethrough
  if (rPrElement.querySelector('w\\:strike, strike')) {
    props.strikethrough = true;
  }

  // Double strikethrough
  if (rPrElement.querySelector('w\\:dstrike, dstrike')) {
    props.doubleStrikethrough = true;
  }

  // All capitals
  if (rPrElement.querySelector('w\\:caps, caps')) {
    props.allCaps = true;
  }

  // Small caps
  if (rPrElement.querySelector('w\\:smallCaps, smallCaps')) {
    props.smallCaps = true;
  }

  // Vertical alignment (superscript/subscript)
  const vertAlignElement = rPrElement.querySelector('w\\:vertAlign, vertAlign');
  if (vertAlignElement) {
    const val = vertAlignElement.getAttribute('w:val') || vertAlignElement.getAttribute('val');
    if (val === 'superscript' || val === 'subscript') {
      props.verticalAlign = val;
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
 * Extract table properties from Word XML table properties element
 */
function extractTableProperties(tblPrElement: Element | null): TableProperties {
  const props: TableProperties = {};
  
  if (!tblPrElement) return props;

  // Table alignment
  const jcElement = tblPrElement.querySelector('w\\:jc, jc');
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
        default:
          props.alignment = 'left';
      }
    }
  }

  // Table width
  const tblWElement = tblPrElement.querySelector('w\\:tblW, tblW');
  if (tblWElement) {
    const wVal = tblWElement.getAttribute('w:w') || tblWElement.getAttribute('w');
    const type = tblWElement.getAttribute('w:type') || tblWElement.getAttribute('type');
    if (wVal && type) {
      if (type === 'pct') {
        // Percentage width
        props.width = `${parseInt(wVal) / 50}%`; // Word uses 50ths of a percent
      } else if (type === 'dxa') {
        // Twips width
        props.width = `${twipsToPixels(parseInt(wVal))}px`;
      }
    }
  }

  return props;
}

/**
 * Extract table cell properties from Word XML table cell properties element
 */
function extractTableCellProperties(tcPrElement: Element | null): TableCellProperties {
  const props: TableCellProperties = {};
  
  if (!tcPrElement) return props;

  // Cell width
  const tcWElement = tcPrElement.querySelector('w\\:tcW, tcW');
  if (tcWElement) {
    const wVal = tcWElement.getAttribute('w:w') || tcWElement.getAttribute('w');
    const type = tcWElement.getAttribute('w:type') || tcWElement.getAttribute('type');
    if (wVal && type) {
      if (type === 'pct') {
        props.width = `${parseInt(wVal) / 50}%`;
      } else if (type === 'dxa') {
        props.width = `${twipsToPixels(parseInt(wVal))}px`;
      }
    }
  }

  // Vertical alignment
  const vAlignElement = tcPrElement.querySelector('w\\:vAlign, vAlign');
  if (vAlignElement) {
    const val = vAlignElement.getAttribute('w:val') || vAlignElement.getAttribute('val');
    if (val) {
      switch (val) {
        case 'center':
          props.verticalAlignment = 'middle';
          break;
        case 'bottom':
          props.verticalAlignment = 'bottom';
          break;
        default:
          props.verticalAlignment = 'top';
      }
    }
  }

  // Background color
  const shdElement = tcPrElement.querySelector('w\\:shd, shd');
  if (shdElement) {
    const fill = shdElement.getAttribute('w:fill') || shdElement.getAttribute('fill');
    if (fill && fill !== 'auto' && fill !== 'ffffff') {
      props.background = `#${fill}`;
    }
  }

  return props;
}

/**
 * Apply run properties to create inline CSS styles
 */
function createRunStyles(props: RunProperties): string {
  const styles: string[] = [];
  const decorations: string[] = [];

  if (props.bold) styles.push('font-weight: bold');
  if (props.italic) styles.push('font-style: italic');
  
  // Enhanced underline handling
  if (props.underline) {
    if (typeof props.underline === 'string') {
      switch (props.underline) {
        case 'single':
          decorations.push('underline');
          break;
        case 'double':
          decorations.push('underline');
          break;
        case 'none':
          // Explicitly no underline - this overrides any other decorations
          styles.push('text-decoration: none');
          break;
        default:
          // Fallback for other underline types
          decorations.push('underline');
      }
    } else {
      // Boolean true - simple underline
      decorations.push('underline');
    }
  }

  // Strikethrough handling
  if (props.strikethrough || props.doubleStrikethrough) {
    decorations.push('line-through');
  }

  // Combine text decorations if we have any
  if (decorations.length > 0) {
    styles.push(`text-decoration: ${decorations.join(' ')}`);
  }

  // Add text-decoration-style after text-decoration for double underlines
  if (props.underline === 'double') {
    styles.push('text-decoration-style: double');
  }

  if (props.fontSize) styles.push(`font-size: ${props.fontSize}`);
  if (props.color) styles.push(`color: ${props.color}`);
  if (props.fontFamily) styles.push(`font-family: "${props.fontFamily}"`);
  
  // Highlight (background color)
  if (props.highlight) {
    // Map common Word highlight colors to CSS colors
    const highlightColorMap: { [key: string]: string } = {
      'yellow': '#ffff00',
      'brightGreen': '#00ff00',
      'turquoise': '#40e0d0',
      'pink': '#ffc0cb',
      'blue': '#0000ff',
      'red': '#ff0000',
      'darkBlue': '#000080',
      'teal': '#008080',
      'green': '#008000',
      'violet': '#ee82ee',
      'darkRed': '#8b0000',
      'darkYellow': '#8b8000',
      'gray25': '#c0c0c0',
      'gray50': '#808080',
      'black': '#000000'
    };
    
    const highlightColor = highlightColorMap[props.highlight] || props.highlight;
    styles.push(`background-color: ${highlightColor}`);
  }

  // Text transform for caps
  if (props.allCaps) {
    styles.push('text-transform: uppercase');
  } else if (props.smallCaps) {
    styles.push('font-variant: small-caps');
  }

  // Vertical alignment for super/subscript
  if (props.verticalAlign) {
    if (props.verticalAlign === 'superscript') {
      styles.push('vertical-align: super; font-size: smaller');
    } else if (props.verticalAlign === 'subscript') {
      styles.push('vertical-align: sub; font-size: smaller');
    }
  }

  // Tracked changes styling
  if (props.revision) {
    switch (props.revision.type) {
      case 'insertion':
        styles.push('color: #008000; text-decoration: underline');
        break;
      case 'deletion':
        styles.push('color: #ff0000; text-decoration: line-through');
        break;
      case 'moveFrom':
        styles.push('color: #0000ff; text-decoration: line-through');
        break;
      case 'moveTo':
        styles.push('color: #0000ff; text-decoration: underline');
        break;
    }
  }

  return styles.join('; ');
}

/**
 * Convert twips to pixels (assuming 96 DPI)
 * Twips are a unit used in Word documents (1/20th of a point)
 * The formula: twips / 20 * 96 / 72 converts to pixels at 96 DPI
 */
export function twipsToPixels(twips: number): number {
  return Math.round(twips / 20 * 96 / 72);
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
      const leftPx = twipsToPixels(props.indentation.left);
      styles.push(`margin-left: ${leftPx}px`);
    }
    
    if (props.indentation.right) {
      const rightPx = twipsToPixels(props.indentation.right);
      styles.push(`margin-right: ${rightPx}px`);
    }
    
    if (props.indentation.firstLine) {
      const firstLinePx = twipsToPixels(props.indentation.firstLine);
      styles.push(`text-indent: ${firstLinePx}px`);
    }
  }

  return styles.join('; ');
}

/**
 * Apply table properties to create inline CSS styles
 */
function createTableStyles(props: TableProperties): string {
  const styles: string[] = [];

  // Default table styles
  styles.push('border-collapse: collapse');
  styles.push('width: 100%');

  if (props.alignment) {
    if (props.alignment === 'center') {
      styles.push('margin-left: auto');
      styles.push('margin-right: auto');
    } else if (props.alignment === 'right') {
      styles.push('margin-left: auto');
    }
  }

  if (props.width) {
    styles.push(`width: ${props.width}`);
  }

  return styles.join('; ');
}

/**
 * Apply table cell properties to create inline CSS styles
 */
function createTableCellStyles(props: TableCellProperties): string {
  const styles: string[] = [];

  // Default cell styles
  styles.push('border: 1px solid #ddd');
  styles.push('padding: 8px');

  if (props.width) {
    styles.push(`width: ${props.width}`);
  }

  if (props.alignment) {
    styles.push(`text-align: ${props.alignment}`);
  }

  if (props.verticalAlignment) {
    styles.push(`vertical-align: ${props.verticalAlignment}`);
  }

  if (props.background) {
    styles.push(`background-color: ${props.background}`);
  }

  return styles.join('; ');
}

/**
 * Extract revision/tracked change information from an element or its ancestors
 */
function extractRevisionInfo(element: Element): RunProperties['revision'] | null {
  // Check if the element itself is a tracked change element
  if (element.tagName.match(/^(w:)?ins$/i)) {
    return {
      type: 'insertion',
      author: element.getAttribute('w:author') || element.getAttribute('author') || undefined,
      date: element.getAttribute('w:date') || element.getAttribute('date') || undefined,
      id: element.getAttribute('w:id') || element.getAttribute('id') || undefined
    };
  }
  
  if (element.tagName.match(/^(w:)?del$/i)) {
    return {
      type: 'deletion',
      author: element.getAttribute('w:author') || element.getAttribute('author') || undefined,
      date: element.getAttribute('w:date') || element.getAttribute('date') || undefined,
      id: element.getAttribute('w:id') || element.getAttribute('id') || undefined
    };
  }
  
  if (element.tagName.match(/^(w:)?moveFrom$/i)) {
    return {
      type: 'moveFrom',
      author: element.getAttribute('w:author') || element.getAttribute('author') || undefined,
      date: element.getAttribute('w:date') || element.getAttribute('date') || undefined,
      id: element.getAttribute('w:id') || element.getAttribute('id') || undefined
    };
  }
  
  if (element.tagName.match(/^(w:)?moveTo$/i)) {
    return {
      type: 'moveTo',
      author: element.getAttribute('w:author') || element.getAttribute('author') || undefined,
      date: element.getAttribute('w:date') || element.getAttribute('date') || undefined,
      id: element.getAttribute('w:id') || element.getAttribute('id') || undefined
    };
  }

  // Check parent elements for tracked changes (runs can be nested inside revision elements)
  let parent = element.parentElement;
  while (parent) {
    const parentRevision = extractRevisionInfo(parent);
    if (parentRevision) {
      return parentRevision;
    }
    parent = parent.parentElement;
  }
  
  return null;
}

/**
 * Create footnote/endnote context for transformation
 */
interface NoteContext {
  footnotes: Map<string, DocumentFootnote>;
  endnotes: Map<string, DocumentFootnote>;
}

/**
 * Create note context from footnotes and endnotes arrays
 */
function createNoteContext(footnotes: DocumentFootnote[], endnotes: DocumentFootnote[]): NoteContext {
  const footnoteMap = new Map<string, DocumentFootnote>();
  const endnoteMap = new Map<string, DocumentFootnote>();
  
  footnotes.forEach(note => {
    // Extract the original ID from our prefixed ID
    const originalId = note.id.split('-').pop() || note.id;
    footnoteMap.set(originalId, note);
  });
  
  endnotes.forEach(note => {
    // Extract the original ID from our prefixed ID  
    const originalId = note.id.split('-').pop() || note.id;
    endnoteMap.set(originalId, note);
  });
  
  return { footnotes: footnoteMap, endnotes: endnoteMap };
}

/**
 * Transform a Word run element to HTML
 */
function transformRun(runElement: Element, noteContext: NoteContext): string {
  // Check if this run is inside a tracked change element
  const revisionInfo = extractRevisionInfo(runElement);
  
  // Get run properties
  const rPrElement = runElement.querySelector('w\\:rPr, rPr');
  const runProps = extractRunProperties(rPrElement);
  
  // Apply revision info to run properties
  if (revisionInfo) {
    runProps.revision = revisionInfo;
  }

  // Check for footnote/endnote references
  const footnoteRef = runElement.querySelector('w\\:footnoteReference, footnoteReference');
  if (footnoteRef) {
    const id = footnoteRef.getAttribute('w:id') || footnoteRef.getAttribute('id');
    if (id && noteContext.footnotes.has(id)) {
      return `<sup><a href="#footnote-${id}" id="footnote-ref-${id}" class="footnote-link">${id}</a></sup>`;
    }
  }

  const endnoteRef = runElement.querySelector('w\\:endnoteReference, endnoteReference');
  if (endnoteRef) {
    const id = endnoteRef.getAttribute('w:id') || endnoteRef.getAttribute('id');
    if (id && noteContext.endnotes.has(id)) {
      return `<sup><a href="#endnote-${id}" id="endnote-ref-${id}" class="endnote-link">${id}</a></sup>`;
    }
  }

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
function transformParagraph(paragraphElement: Element, noteContext: NoteContext): string {
  // Get paragraph properties
  const pPrElement = paragraphElement.querySelector('w\\:pPr, pPr');
  const paragraphProps = extractParagraphProperties(pPrElement);

  // Transform all runs in the paragraph, including those within tracked change elements
  const allRunElements = paragraphElement.querySelectorAll('w\\:r, r');
  
  // Note: Tracked change elements are handled through the extractRevisionInfo function
  // which checks parent elements for revision information

  const runContent = Array.from(allRunElements)
    .map(run => transformRun(run, noteContext))
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
 * Transform a Word table cell element to HTML
 */
function transformTableCell(cellElement: Element, noteContext: NoteContext): string {
  // Get cell properties
  const tcPrElement = cellElement.querySelector('w\\:tcPr, tcPr');
  const cellProps = extractTableCellProperties(tcPrElement);

  // Transform all paragraphs in the cell
  const paragraphElements = cellElement.querySelectorAll('w\\:p, p');
  
  let cellContent = '';
  if (paragraphElements.length > 0) {
    cellContent = Array.from(paragraphElements)
      .map(p => transformParagraph(p, noteContext))
      .filter(html => html.trim())
      .join('\n');
  }

  if (!cellContent.trim()) {
    cellContent = '<p></p>'; // Empty cell
  }

  // Apply cell styling
  const styles = createTableCellStyles(cellProps);
  
  return `<td style="${styles}">${cellContent}</td>`;
}

/**
 * Transform a Word table row element to HTML
 */
function transformTableRow(rowElement: Element, noteContext: NoteContext): string {
  // Transform all cells in the row
  const cellElements = rowElement.querySelectorAll('w\\:tc, tc');
  
  const cellContent = Array.from(cellElements)
    .map(cell => transformTableCell(cell, noteContext))
    .filter(html => html.trim())
    .join('');

  if (!cellContent.trim()) {
    return '<tr><td></td></tr>'; // Empty row with at least one cell
  }

  return `<tr>${cellContent}</tr>`;
}

/**
 * Transform a Word table element to HTML
 */
function transformTable(tableElement: Element, noteContext: NoteContext): string {
  // Get table properties
  const tblPrElement = tableElement.querySelector('w\\:tblPr, tblPr');
  const tableProps = extractTableProperties(tblPrElement);

  // Transform all rows in the table
  const rowElements = tableElement.querySelectorAll('w\\:tr, tr');
  
  const rowContent = Array.from(rowElements)
    .map(row => transformTableRow(row, noteContext))
    .filter(html => html.trim())
    .join('\n');

  if (!rowContent.trim()) {
    return '<table><tr><td></td></tr></table>'; // Empty table with minimal structure
  }

  // Apply table styling
  const styles = createTableStyles(tableProps);
  
  return `<table style="${styles}">\n${rowContent}\n</table>`;
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
export function transformDocumentToHtml(
  documentXml: Document,
  footnotes: DocumentFootnote[] = [],
  endnotes: DocumentFootnote[] = []
): TransformedContent {
  // Create note context for footnotes and endnotes
  const noteContext = createNoteContext(footnotes, endnotes);
  
  // Find all paragraph and table elements in the document body
  const body = documentXml.querySelector('w\\:body, body');
  if (!body) {
    return {
      html: '<p>No document content found.</p>',
      plainText: 'No document content found.'
    };
  }

  // Get all direct children that are paragraphs or tables
  const contentElements = Array.from(body.children).filter(element => {
    const tagName = element.tagName.toLowerCase();
    return tagName.match(/^(w:)?p$/) || tagName.match(/^(w:)?tbl$/);
  });
  
  if (contentElements.length === 0) {
    return {
      html: '<p>No content found in document.</p>',
      plainText: 'No content found in document.'
    };
  }

  // Transform each content element (paragraph or table)
  const htmlParts = contentElements
    .map(element => {
      const tagName = element.tagName.toLowerCase();
      if (tagName.match(/^(w:)?p$/)) {
        return transformParagraph(element, noteContext);
      } else if (tagName.match(/^(w:)?tbl$/)) {
        return transformTable(element, noteContext);
      }
      return '';
    })
    .filter(html => html.trim());

  let html = htmlParts.join('\n');
  
  // Add footnotes at the end of the document
  if (footnotes.length > 0) {
    const footnoteHtml = footnotes
      .filter(note => note.noteType === 'normal') // Only show normal footnotes, not separators
      .map(note => {
        const id = note.id.split('-').pop() || note.id;
        return `<div class="footnote" id="footnote-${id}">
          <a href="#footnote-ref-${id}" class="footnote-backlink">${id}.</a> ${note.content}
        </div>`;
      })
      .join('\n');
    
    if (footnoteHtml) {
      html += '\n<div class="footnotes">\n<hr class="footnotes-separator">\n' + footnoteHtml + '\n</div>';
    }
  }
  
  // Add endnotes at the end of the document (after footnotes)
  if (endnotes.length > 0) {
    const endnoteHtml = endnotes
      .filter(note => note.noteType === 'normal') // Only show normal endnotes, not separators
      .map(note => {
        const id = note.id.split('-').pop() || note.id;
        return `<div class="endnote" id="endnote-${id}">
          <a href="#endnote-ref-${id}" class="endnote-backlink">${id}.</a> ${note.content}
        </div>`;
      })
      .join('\n');
    
    if (endnoteHtml) {
      html += '\n<div class="endnotes">\n<hr class="endnotes-separator">\n' + endnoteHtml + '\n</div>';
    }
  }
  
  // Extract plain text for search/indexing (including footnotes/endnotes)
  const paragraphElements = body.querySelectorAll('w\\:p, p');
  const mainText = Array.from(paragraphElements)
    .map(p => {
      const textElements = p.querySelectorAll('w\\:t, t');
      return Array.from(textElements)
        .map(el => el.textContent || '')
        .join('');
    })
    .filter(text => text.trim())
    .join('\n');
  
  const footnoteText = footnotes.map(note => note.plainText).join(' ');
  const endnoteText = endnotes.map(note => note.plainText).join(' ');
  
  const plainText = [mainText, footnoteText, endnoteText]
    .filter(text => text.trim())
    .join('\n');

  return {
    html: html || '<p>No content to display.</p>',
    plainText: plainText || 'No content to display.'
  };
}