import { describe, it, expect } from 'vitest';
import { generateHumanReport, generateDefaultReportConfig } from './reportGenerator';
import type { ReportConfig, DocumentComment, MetaComment, UploadedDocument } from '../types';

describe('reportGenerator', () => {
  // Sample data for testing
  const sampleDocuments: UploadedDocument[] = [
    {
      id: 'doc-1',
      name: 'budget-proposal.docx',
      file: new File([], 'budget-proposal.docx'),
      uploadDate: new Date('2024-10-15'),
      size: 1024,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    },
    {
      id: 'doc-2',
      name: 'timeline.docx',
      file: new File([], 'timeline.docx'),
      uploadDate: new Date('2024-10-16'),
      size: 2048,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
  ];

  const sampleWordComments: DocumentComment[] = [
    {
      id: 'comment-1',
      author: 'Legal Department',
      date: new Date('2024-10-15'),
      plainText: 'Payment terms must remain Net-30...',
      content: '<p>Payment terms must remain Net-30...</p>',
      documentId: 'doc-1'
    },
    {
      id: 'comment-2',
      author: 'Finance Team',
      date: new Date('2024-10-16'),
      plainText: 'Budget increase needed for Q4',
      content: '<p>Budget increase needed for Q4</p>',
      documentId: 'doc-1'
    },
    {
      id: 'comment-3',
      paraId: 'para-3',
      author: 'Project Manager',
      date: new Date('2024-10-17'),
      plainText: 'Timeline looks aggressive',
      content: '<p>Timeline looks <strong>aggressive</strong></p>',
      documentId: 'doc-2'
    },
    {
      id: 'comment-4',
      paraId: 'para-4',
      parentId: 'para-3',
      author: 'Tech Lead',
      date: new Date('2024-10-18'),
      plainText: 'Agreed, we need more time',
      content: '<p>Agreed, we need more time</p>',
      documentId: 'doc-2'
    }
  ];

  const sampleMetaComments: MetaComment[] = [
    {
      id: 'meta-1',
      type: 'synthesis',
      text: 'There is a conflict between payment terms and project timeline that needs resolution.',
      author: 'Analyst',
      created: new Date('2024-10-20'),
      linkedComments: ['comment-1', 'comment-3'],
      tags: ['conflict'],
      includeInReport: true
    },
    {
      id: 'meta-2',
      type: 'question',
      text: 'Should we prioritize payment terms or timeline flexibility?',
      author: 'Analyst',
      created: new Date('2024-10-20'),
      linkedComments: [],
      tags: ['decision'],
      includeInReport: true
    },
    {
      id: 'meta-3',
      type: 'observation',
      text: 'Finance concerns are consistent across multiple documents.',
      author: 'Analyst',
      created: new Date('2024-10-21'),
      linkedComments: ['comment-2'],
      tags: ['finance'],
      includeInReport: false
    }
  ];

  describe('generateHumanReport', () => {
    it('should generate a report with title and date', () => {
      const config: ReportConfig = {
        title: 'Test Report',
        sections: [],
        includeQuestions: false,
        generatedDate: new Date('2024-10-24')
      };

      const report = generateHumanReport(config, {
        wordComments: [],
        metaComments: [],
        documents: []
      });

      expect(report).toContain('Test Report');
      expect(report).toContain('Generated October 24, 2024');
    });

    it('should include document list in metadata', () => {
      const config: ReportConfig = {
        title: 'Test Report',
        sections: [
          {
            title: 'Section 1',
            commentIds: ['comment-1', 'comment-2']
          }
        ],
        includeQuestions: false
      };

      const report = generateHumanReport(config, {
        wordComments: sampleWordComments,
        metaComments: [],
        documents: sampleDocuments
      });

      expect(report).toContain('Documents:');
      expect(report).toContain('budget-proposal.docx');
    });

    it('should format word comments with author, document, and date attribution', () => {
      const config: ReportConfig = {
        title: 'Test Report',
        sections: [
          {
            title: 'Critical Issue',
            commentIds: ['comment-1']
          }
        ],
        includeQuestions: false
      };

      const report = generateHumanReport(config, {
        wordComments: sampleWordComments,
        metaComments: [],
        documents: sampleDocuments
      });

      expect(report).toContain('CRITICAL ISSUE');
      expect(report).toContain('Legal Department (budget-proposal.docx, October 15, 2024):');
      expect(report).toContain('"Payment terms must remain Net-30..."');
    });

    it('should format meta-comments with "My Analysis:" prefix', () => {
      const config: ReportConfig = {
        title: 'Test Report',
        sections: [
          {
            title: 'Analysis',
            commentIds: ['meta-1']
          }
        ],
        includeQuestions: false
      };

      const report = generateHumanReport(config, {
        wordComments: sampleWordComments,
        metaComments: sampleMetaComments,
        documents: sampleDocuments
      });

      expect(report).toContain('My Analysis:');
      expect(report).toContain('There is a conflict between payment terms and project timeline');
    });

    it('should show linked comments context for meta-comments', () => {
      const config: ReportConfig = {
        title: 'Test Report',
        sections: [
          {
            title: 'Analysis',
            commentIds: ['meta-1']
          }
        ],
        includeQuestions: false
      };

      const report = generateHumanReport(config, {
        wordComments: sampleWordComments,
        metaComments: sampleMetaComments,
        documents: sampleDocuments
      });

      expect(report).toContain('[Based on comments from:');
      expect(report).toContain('Legal Department (budget-proposal.docx)');
      expect(report).toContain('Project Manager (timeline.docx)');
    });

    it('should show linked comments context for word comments with parent', () => {
      const config: ReportConfig = {
        title: 'Test Report',
        sections: [
          {
            title: 'Responses',
            commentIds: ['comment-4']
          }
        ],
        includeQuestions: false
      };

      const report = generateHumanReport(config, {
        wordComments: sampleWordComments,
        metaComments: [],
        documents: sampleDocuments
      });

      expect(report).toContain('[In response to Project Manager:]');
      expect(report).toContain('"Timeline looks aggressive"');
    });

    it('should include "Questions for Follow-up" section when requested', () => {
      const config: ReportConfig = {
        title: 'Test Report',
        sections: [
          {
            title: 'Analysis',
            commentIds: ['meta-1', 'meta-2']
          }
        ],
        includeQuestions: true
      };

      const report = generateHumanReport(config, {
        wordComments: sampleWordComments,
        metaComments: sampleMetaComments,
        documents: sampleDocuments
      });

      expect(report).toContain('QUESTIONS FOR FOLLOW-UP');
      expect(report).toContain('Should we prioritize payment terms or timeline flexibility?');
    });

    it('should not include questions section when includeQuestions is false', () => {
      const config: ReportConfig = {
        title: 'Test Report',
        sections: [
          {
            title: 'Analysis',
            commentIds: ['meta-1', 'meta-2']
          }
        ],
        includeQuestions: false
      };

      const report = generateHumanReport(config, {
        wordComments: sampleWordComments,
        metaComments: sampleMetaComments,
        documents: sampleDocuments
      });

      expect(report).not.toContain('QUESTIONS FOR FOLLOW-UP');
    });

    it('should organize content into user-defined sections', () => {
      const config: ReportConfig = {
        title: 'Multi-Section Report',
        sections: [
          {
            title: 'Legal Issues',
            commentIds: ['comment-1']
          },
          {
            title: 'Timeline Concerns',
            commentIds: ['comment-3']
          }
        ],
        includeQuestions: false
      };

      const report = generateHumanReport(config, {
        wordComments: sampleWordComments,
        metaComments: [],
        documents: sampleDocuments
      });

      expect(report).toContain('LEGAL ISSUES');
      expect(report).toContain('TIMELINE CONCERNS');
      
      // Check ordering
      const legalIndex = report.indexOf('LEGAL ISSUES');
      const timelineIndex = report.indexOf('TIMELINE CONCERNS');
      expect(legalIndex).toBeLessThan(timelineIndex);
    });

    it('should strip HTML tags for clean prose output', () => {
      const config: ReportConfig = {
        title: 'Test Report',
        sections: [
          {
            title: 'Section',
            commentIds: ['comment-3']
          }
        ],
        includeQuestions: false
      };

      const report = generateHumanReport(config, {
        wordComments: sampleWordComments,
        metaComments: [],
        documents: sampleDocuments
      });

      // Should not contain HTML tags
      expect(report).not.toContain('<strong>');
      expect(report).not.toContain('</strong>');
      expect(report).toContain('Timeline looks aggressive');
    });

    it('should generate complete sample output structure', () => {
      const config: ReportConfig = {
        title: 'Payment Terms Analysis - Q4 Product Launch Review',
        sections: [
          {
            title: 'Critical Issue: Payment/Timeline Conflict',
            commentIds: ['comment-1', 'meta-1']
          }
        ],
        includeQuestions: true,
        generatedDate: new Date('2024-10-24')
      };

      const report = generateHumanReport(config, {
        wordComments: sampleWordComments,
        metaComments: sampleMetaComments,
        documents: sampleDocuments
      });

      // Check key elements of sample output
      expect(report).toContain('Payment Terms Analysis - Q4 Product Launch Review');
      expect(report).toContain('Generated October 24, 2024');
      expect(report).toContain('CRITICAL ISSUE: PAYMENT/TIMELINE CONFLICT');
      expect(report).toContain('Legal Department (budget-proposal.docx');
      expect(report).toContain('My Analysis:');
    });
  });

  describe('generateDefaultReportConfig', () => {
    it('should create a config with provided title', () => {
      const config = generateDefaultReportConfig(
        'Test Report',
        [],
        []
      );

      expect(config.title).toBe('Test Report');
    });

    it('should create a single section with all selected comments', () => {
      const config = generateDefaultReportConfig(
        'Test Report',
        ['comment-1', 'meta-1'],
        sampleMetaComments
      );

      expect(config.sections).toHaveLength(1);
      expect(config.sections[0].title).toBe('Analysis');
      expect(config.sections[0].commentIds).toEqual(['comment-1', 'meta-1']);
    });

    it('should enable questions by default', () => {
      const config = generateDefaultReportConfig(
        'Test Report',
        [],
        []
      );

      expect(config.includeQuestions).toBe(true);
    });

    it('should set generated date to current date', () => {
      const config = generateDefaultReportConfig(
        'Test Report',
        [],
        []
      );

      expect(config.generatedDate).toBeInstanceOf(Date);
      // Check it's recent (within last second)
      const now = new Date();
      const diff = now.getTime() - config.generatedDate!.getTime();
      expect(diff).toBeLessThan(1000);
    });
  });
});
