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

// Document upload and management
export interface UploadedDocument {
  id: string;
  name: string;
  file: File;
  uploadDate: Date;
  size: number;
  type: string;
}

export interface DocumentStateManager {
  documents: UploadedDocument[];
  activeDocumentId: string | null;
  addDocument: (file: File) => void;
  removeDocument: (id: string) => void;
  setActiveDocument: (id: string | null) => void;
}