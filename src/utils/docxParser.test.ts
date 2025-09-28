import { describe, it, expect, vi } from 'vitest';
import { parseDocxComments, isValidDocxFile } from './docxParser';
import type JSZip from 'jszip';

// Mock JSZip
vi.mock('jszip', () => {
  return {
    default: {
      loadAsync: vi.fn()
    }
  };
});

// Mock File.prototype.arrayBuffer for Node.js environment
Object.defineProperty(File.prototype, 'arrayBuffer', {
  value: function() {
    return Promise.resolve(new ArrayBuffer(0));
  },
  writable: true
});

describe('docxParser', () => {
  describe('isValidDocxFile', () => {
    it('accepts valid .docx files', () => {
      const validFile = new File(['content'], 'test.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      expect(isValidDocxFile(validFile)).toBe(true);
    });
    
    it('accepts .docx files with empty mime type', () => {
      const validFile = new File(['content'], 'test.docx', {
        type: ''
      });
      
      expect(isValidDocxFile(validFile)).toBe(true);
    });
    
    it('rejects non-.docx files', () => {
      const invalidFile = new File(['content'], 'test.txt', {
        type: 'text/plain'
      });
      
      expect(isValidDocxFile(invalidFile)).toBe(false);
    });
    
    it('rejects files with wrong extension but correct mime type', () => {
      const invalidFile = new File(['content'], 'test.txt', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      expect(isValidDocxFile(invalidFile)).toBe(false);
    });
  });

  describe('parseDocxComments', () => {
    it('returns empty comments when no comments file exists', async () => {
      const { default: JSZip } = await import('jszip');
      
      // Mock a basic document.xml to satisfy the requirement
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>Test document</w:t></w:r></w:p></w:body>
        </w:document>`;
      
      const mockDocumentFile = {
        async: vi.fn().mockResolvedValue(mockDocumentXml)
      };
      
      const mockZip = {
        file: vi.fn().mockImplementation((path: string) => {
          if (path === 'word/document.xml') {
            return mockDocumentFile;
          }
          return null; // All other files return null
        })
      } as unknown as JSZip;
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip);
      
      const file = new File(['content'], 'test.docx');
      const result = await parseDocxComments(file, 'doc-1');
      
      expect(result.comments).toEqual([]);
      expect(result.error).toBeUndefined();
      expect(result.documentXml).toBeDefined();
      expect(result.stylesXml).toBeUndefined();
      expect(result.numberingXml).toBeUndefined();
      expect(result.commentsXml).toBeUndefined();
      expect(result.commentsExtendedXml).toBeUndefined();
    });
    
    it('returns error when required document.xml is missing', async () => {
      const { default: JSZip } = await import('jszip');
      const mockZip = {
        file: vi.fn().mockReturnValue(null) // All files return null
      } as unknown as JSZip;
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip);
      
      const file = new File(['content'], 'test.docx');
      const result = await parseDocxComments(file, 'doc-1');
      
      expect(result.comments).toEqual([]);
      expect(result.error).toBe('Required document.xml not found in .docx file');
    });
    
    it('handles parsing errors gracefully', async () => {
      const { default: JSZip } = await import('jszip');
      
      vi.mocked(JSZip.loadAsync).mockRejectedValue(new Error('Invalid zip file'));
      
      const file = new File(['content'], 'test.docx');
      const result = await parseDocxComments(file, 'doc-1');
      
      expect(result.comments).toEqual([]);
      expect(result.error).toBe('Invalid zip file');
    });
    
    it('parses comments from valid XML', async () => {
      const { default: JSZip } = await import('jszip');
      
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>Test document</w:t></w:r></w:p></w:body>
        </w:document>`;
      
      const mockCommentsXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:comment w:id="0" w:author="John Doe" w:initials="JD" w:date="2023-01-01T10:00:00Z">
            <w:p><w:r><w:t>This is a test comment</w:t></w:r></w:p>
          </w:comment>
        </w:comments>`;
      
      const mockStylesXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:type="paragraph" w:styleId="Normal">
            <w:name w:val="Normal"/>
          </w:style>
        </w:styles>`;
      
      const mockDocumentFile = {
        async: vi.fn().mockResolvedValue(mockDocumentXml)
      };
      
      const mockCommentsFile = {
        async: vi.fn().mockResolvedValue(mockCommentsXml)
      };
      
      const mockStylesFile = {
        async: vi.fn().mockResolvedValue(mockStylesXml)
      };
      
      const mockZip = {
        file: vi.fn().mockImplementation((path: string) => {
          switch (path) {
            case 'word/document.xml':
              return mockDocumentFile;
            case 'word/comments.xml':
              return mockCommentsFile;
            case 'word/styles.xml':
              return mockStylesFile;
            default:
              return null;
          }
        })
      } as unknown as JSZip;
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip);
      
      const file = new File(['content'], 'test.docx');
      const result = await parseDocxComments(file, 'doc-1');
      
      expect(result.comments).toHaveLength(1);
      expect(result.comments[0]).toMatchObject({
        id: 'doc-1-0',
        author: 'John Doe',
        initial: 'JD',
        text: 'This is a test comment',
        documentId: 'doc-1',
        reference: 'Comment 0'
      });
      expect(result.error).toBeUndefined();
      expect(result.documentXml).toBeDefined();
      expect(result.commentsXml).toBeDefined();
      expect(result.stylesXml).toBeDefined();
      expect(result.numberingXml).toBeUndefined();
      expect(result.commentsExtendedXml).toBeUndefined();
    });
    
    it('parses all XML files including optional ones', async () => {
      const { default: JSZip } = await import('jszip');
      
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>Test document</w:t></w:r></w:p></w:body>
        </w:document>`;
      
      const mockNumberingXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:abstractNum w:abstractNumId="0">
            <w:lvl w:ilvl="0">
              <w:numFmt w:val="bullet"/>
            </w:lvl>
          </w:abstractNum>
        </w:numbering>`;
      
      const mockCommentsExtendedXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:commentsExtended xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:commentExtended w:id="0">
            <w:extData>Extended comment data</w:extData>
          </w:commentExtended>
        </w:commentsExtended>`;
      
      const mockZip = {
        file: vi.fn().mockImplementation((path: string) => {
          const xmlContent = {
            'word/document.xml': mockDocumentXml,
            'word/numbering.xml': mockNumberingXml,
            'word/commentsExtended.xml': mockCommentsExtendedXml
          }[path];
          
          return xmlContent ? {
            async: vi.fn().mockResolvedValue(xmlContent)
          } : null;
        })
      } as unknown as JSZip;
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip);
      
      const file = new File(['content'], 'test.docx');
      const result = await parseDocxComments(file, 'doc-1');
      
      expect(result.comments).toEqual([]);
      expect(result.error).toBeUndefined();
      expect(result.documentXml).toBeDefined();
      expect(result.numberingXml).toBeDefined();
      expect(result.commentsExtendedXml).toBeDefined();
      expect(result.stylesXml).toBeUndefined();
      expect(result.commentsXml).toBeUndefined();
    });
  });
});