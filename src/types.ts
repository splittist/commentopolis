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