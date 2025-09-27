// Panel states for left and right panels
export type PanelState = 'minimized' | 'normal' | 'focused';

// Configuration for panel dimensions
export interface PanelConfig {
  minimized: string;
  normal: string;
  focused: string;
}

// Panel state management
export interface PanelStateManager {
  leftPanel: PanelState;
  rightPanel: PanelState;
  setLeftPanel: (state: PanelState) => void;
  setRightPanel: (state: PanelState) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
}

// Comment data extracted from .docx files
export interface DocumentComment {
  id: string;
  author: string;
  initial?: string;
  date: Date;
  text: string;
  documentId: string;
  reference?: string; // Reference to the commented text/location
}

// Document upload and management
export interface UploadedDocument {
  id: string;
  name: string;
  file: File;
  uploadDate: Date;
  size: number;
  type: string;
  comments?: DocumentComment[]; // Comments extracted from the document
  isProcessing?: boolean; // Flag to indicate if document is being parsed
  processingError?: string; // Error message if parsing failed
}

export interface DocumentStateManager {
  documents: UploadedDocument[];
  activeDocumentId: string | null; // Keep for backward compatibility, will be deprecated
  selectedDocumentIds: string[]; // New: array of selected document IDs
  comments: DocumentComment[]; // All comments from all documents
  selectedCommentId: string | null; // Currently selected comment for right panel
  addDocument: (file: File) => void;
  removeDocument: (id: string) => void;
  setActiveDocument: (id: string | null) => void; // Keep for backward compatibility
  setSelectedComment: (id: string | null) => void;
  // New methods for multiple selection
  selectDocument: (id: string) => void;
  deselectDocument: (id: string) => void;
  selectAllDocuments: () => void;
  deselectAllDocuments: () => void;
  toggleDocumentSelection: (id: string) => void;
}