import { describe, it, expect } from 'vitest';
import { extractParagraphsById, getParagraphIdsFromComment } from './paragraphExtractor';
import type { DocumentComment } from '../types';

describe('paragraphExtractor', () => {
  describe('extractParagraphsById', () => {
    it('should extract paragraphs by their IDs', () => {
      const html = `
        <p data-para-id="para1">First paragraph</p>
        <p data-para-id="para2">Second paragraph</p>
        <p data-para-id="para3">Third paragraph</p>
      `;
      
      const result = extractParagraphsById(html, ['para1', 'para3']);
      
      expect(result).toContain('First paragraph');
      expect(result).toContain('Third paragraph');
      expect(result).not.toContain('Second paragraph');
    });

    it('should preserve paragraph styling', () => {
      const html = `
        <p data-para-id="para1" style="color: red; font-weight: bold;">Styled paragraph</p>
        <p data-para-id="para2">Normal paragraph</p>
      `;
      
      const result = extractParagraphsById(html, ['para1']);
      
      expect(result).toContain('style="color: red; font-weight: bold;"');
      expect(result).toContain('Styled paragraph');
    });

    it('should return empty string when no paragraphs match', () => {
      const html = `
        <p data-para-id="para1">First paragraph</p>
        <p data-para-id="para2">Second paragraph</p>
      `;
      
      const result = extractParagraphsById(html, ['para3', 'para4']);
      
      expect(result).toBe('');
    });

    it('should return empty string when html is empty', () => {
      const result = extractParagraphsById('', ['para1']);
      expect(result).toBe('');
    });

    it('should return empty string when paragraphIds is empty', () => {
      const html = '<p data-para-id="para1">First paragraph</p>';
      const result = extractParagraphsById(html, []);
      expect(result).toBe('');
    });

    it('should handle multiple paragraphs with same ID gracefully', () => {
      const html = `
        <p data-para-id="para1">First occurrence</p>
        <p data-para-id="para1">Second occurrence</p>
        <p data-para-id="para2">Different paragraph</p>
      `;
      
      const result = extractParagraphsById(html, ['para1']);
      
      // Should only extract the first matching paragraph
      expect(result).toContain('First occurrence');
    });

    it('should extract paragraphs in the order they appear in HTML', () => {
      const html = `
        <p data-para-id="para1">First</p>
        <p data-para-id="para2">Second</p>
        <p data-para-id="para3">Third</p>
      `;
      
      // Request in different order
      const result = extractParagraphsById(html, ['para3', 'para1', 'para2']);
      
      // Should be extracted in the order they appear in the provided array
      const lines = result.split('\n').filter(line => line.trim());
      expect(lines[0]).toContain('Third');
      expect(lines[1]).toContain('First');
      expect(lines[2]).toContain('Second');
    });

    it('should handle complex HTML with nested elements', () => {
      const html = `
        <p data-para-id="para1">
          Paragraph with <strong>bold</strong> and <em>italic</em> text
        </p>
        <p data-para-id="para2">Normal paragraph</p>
      `;
      
      const result = extractParagraphsById(html, ['para1']);
      
      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('<em>italic</em>');
    });
  });

  describe('getParagraphIdsFromComment', () => {
    it('should return paragraphIds from comment', () => {
      const comment = {
        id: 'test-comment',
        author: 'Test Author',
        date: new Date(),
        plainText: 'Test',
        content: '<p>Test</p>',
        documentId: 'test-doc',
        paragraphIds: ['para1', 'para2']
      } as DocumentComment;
      
      const result = getParagraphIdsFromComment(comment);
      expect(result).toEqual(['para1', 'para2']);
    });

    it('should return empty array when paragraphIds is undefined', () => {
      const comment = {
        id: 'test-comment',
        author: 'Test Author',
        date: new Date(),
        plainText: 'Test',
        content: '<p>Test</p>',
        documentId: 'test-doc'
      } as DocumentComment;
      
      const result = getParagraphIdsFromComment(comment);
      expect(result).toEqual([]);
    });

    it('should return empty array when comment has empty paragraphIds', () => {
      const comment = {
        id: 'test-comment',
        author: 'Test Author',
        date: new Date(),
        plainText: 'Test',
        content: '<p>Test</p>',
        documentId: 'test-doc',
        paragraphIds: []
      } as DocumentComment;
      
      const result = getParagraphIdsFromComment(comment);
      expect(result).toEqual([]);
    });
  });
});
