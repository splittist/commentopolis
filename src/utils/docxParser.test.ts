import { describe, it, expect, vi } from 'vitest';
import { parseDocxComments, isValidDocxFile } from './docxParser';

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
      const mockZip = {
        file: vi.fn().mockReturnValue(null)
      };
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip);
      
      const file = new File(['content'], 'test.docx');
      const result = await parseDocxComments(file, 'doc-1');
      
      expect(result.comments).toEqual([]);
      expect(result.error).toBeUndefined();
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
      
      const mockCommentsXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:comment w:id="0" w:author="John Doe" w:initials="JD" w:date="2023-01-01T10:00:00Z">
            <w:p><w:r><w:t>This is a test comment</w:t></w:r></w:p>
          </w:comment>
        </w:comments>`;
      
      const mockCommentsFile = {
        async: vi.fn().mockResolvedValue(mockCommentsXml)
      };
      
      const mockZip = {
        file: vi.fn().mockReturnValue(mockCommentsFile)
      };
      
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
    });
  });
});