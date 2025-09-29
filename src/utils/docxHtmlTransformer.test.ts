import { describe, it, expect } from 'vitest';
import { transformDocumentToHtml } from './docxHtmlTransformer';

// Helper function to create XML DOM from string
function createXmlDocument(xmlString: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'application/xml');
}

describe('docxHtmlTransformer', () => {
  describe('transformDocumentToHtml', () => {
    it('should handle empty document', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p>No document content found.</p>');
      expect(result.plainText).toBe('No document content found.');
    });

    it('should handle document with no paragraphs', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p>No paragraphs found in document.</p>');
      expect(result.plainText).toBe('No paragraphs found in document.');
    });

    it('should transform simple paragraph with plain text', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>Hello, World!</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p>Hello, World!</p>');
      expect(result.plainText).toBe('Hello, World!');
    });

    it('should transform paragraph with multiple runs', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>Hello, </w:t>
              </w:r>
              <w:r>
                <w:t>World!</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p>Hello, World!</p>');
      expect(result.plainText).toBe('Hello, World!');
    });

    it('should transform multiple paragraphs', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>First paragraph.</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:r>
                <w:t>Second paragraph.</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p>First paragraph.</p>\n<p>Second paragraph.</p>');
      expect(result.plainText).toBe('First paragraph.\nSecond paragraph.');
    });

    it('should transform run with bold formatting', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:b />
                </w:rPr>
                <w:t>Bold text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="font-weight: bold">Bold text</span></p>');
      expect(result.plainText).toBe('Bold text');
    });

    it('should transform run with italic formatting', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:i />
                </w:rPr>
                <w:t>Italic text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="font-style: italic">Italic text</span></p>');
      expect(result.plainText).toBe('Italic text');
    });

    it('should transform run with underline formatting', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:u w:val="single" />
                </w:rPr>
                <w:t>Underlined text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="text-decoration: underline">Underlined text</span></p>');
      expect(result.plainText).toBe('Underlined text');
    });

    it('should transform run with multiple formatting properties', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:b />
                  <w:i />
                  <w:u w:val="single" />
                  <w:sz w:val="24" />
                  <w:color w:val="FF0000" />
                </w:rPr>
                <w:t>Formatted text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      const expectedStyle = 'font-weight: bold; font-style: italic; text-decoration: underline; font-size: 12pt; color: #FF0000';
      expect(result.html).toBe(`<p><span style="${expectedStyle}">Formatted text</span></p>`);
      expect(result.plainText).toBe('Formatted text');
    });

    it('should transform run with font family', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Arial" />
                </w:rPr>
                <w:t>Arial text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="font-family: "Arial"">Arial text</span></p>');
      expect(result.plainText).toBe('Arial text');
    });

    it('should transform paragraph with center alignment', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:jc w:val="center" />
              </w:pPr>
              <w:r>
                <w:t>Centered text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p style="text-align: center">Centered text</p>');
      expect(result.plainText).toBe('Centered text');
    });

    it('should transform paragraph with right alignment', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:jc w:val="right" />
              </w:pPr>
              <w:r>
                <w:t>Right-aligned text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p style="text-align: right">Right-aligned text</p>');
      expect(result.plainText).toBe('Right-aligned text');
    });

    it('should transform paragraph with justify alignment', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:jc w:val="both" />
              </w:pPr>
              <w:r>
                <w:t>Justified text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p style="text-align: justify">Justified text</p>');
      expect(result.plainText).toBe('Justified text');
    });

    it('should handle empty runs and paragraphs', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t></w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:r>
                <w:t>Non-empty paragraph</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p></p>\n<p>Non-empty paragraph</p>');
      expect(result.plainText).toBe('Non-empty paragraph');
    });

    it('should escape HTML special characters', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>&lt;script&gt;alert('test')&lt;/script&gt;</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p>&lt;script&gt;alert(\'test\')&lt;/script&gt;</p>');
      expect(result.plainText).toBe('<script>alert(\'test\')</script>');
    });

    it('should work with namespaced and non-namespaced elements', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <document>
          <body>
            <p>
              <r>
                <rPr>
                  <b />
                </rPr>
                <t>Bold text without namespace</t>
              </r>
            </p>
          </body>
        </document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="font-weight: bold">Bold text without namespace</span></p>');
      expect(result.plainText).toBe('Bold text without namespace');
    });
  });
});