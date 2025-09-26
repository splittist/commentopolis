import { usePanelState } from './hooks/usePanelState';
import { LeftPanel, RightPanel, CenterPanel } from './components';

function App() {
  const { 
    leftPanel, 
    rightPanel, 
    toggleLeftPanel, 
    toggleRightPanel 
  } = usePanelState();

  return (
    <div className="min-h-screen bg-gray-100 flex overflow-hidden">
      <LeftPanel 
        state={leftPanel}
        onToggle={toggleLeftPanel}
      />
      
      <CenterPanel />
      
      <RightPanel 
        state={rightPanel}
        onToggle={toggleRightPanel}
      />
    </div>
  );
}

export default App
