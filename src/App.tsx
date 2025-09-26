import { Toaster } from 'react-hot-toast';
import { usePanelState } from './hooks/usePanelState';
import { LeftPanel, RightPanel, CenterPanel } from './components';
import { DocumentProvider } from './contexts/DocumentContext';

function App() {
  const { 
    leftPanel, 
    rightPanel, 
    toggleLeftPanel, 
    toggleRightPanel 
  } = usePanelState();

  return (
    <DocumentProvider>
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
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </DocumentProvider>
  );
}

export default App
