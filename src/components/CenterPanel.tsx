import React from 'react';
import { Panel } from './Panel';

/**
 * Center Panel component - main content area
 */
export const CenterPanel: React.FC = () => {
  return (
    <Panel state="normal" position="center">
      <div className="p-8 h-full flex flex-col">
        {/* Main content area */}
        <div className="flex-1 bg-gray-50 rounded-lg p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Welcome to the Three-Panel Interface
              </h2>
              <p className="text-gray-600 mb-4">
                This is the main content area where your primary work happens. The left and right panels 
                can be toggled between three states: minimized, normal, and focused.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Left Panel</h3>
                  <p className="text-blue-700 text-sm">
                    Contains navigation, search, and document explorer features.
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Right Panel</h3>
                  <p className="text-green-700 text-sm">
                    Features comments, notes, and collaboration tools.
                  </p>
                </div>
              </div>
            </div>

            {/* Sample content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Document Content</h3>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4">
                  This is where your main document content would appear. The three-panel layout 
                  adapts responsively to different screen sizes and panel states.
                </p>
                
                <h4 className="text-lg font-medium text-gray-800 mb-2">Features:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                  <li>Responsive design that adapts to desktop, tablet, and mobile</li>
                  <li>Smooth transitions between panel states</li>
                  <li>Minimum width maintained for usability</li>
                  <li>Independent left and right panel state management</li>
                </ul>

                <h4 className="text-lg font-medium text-gray-800 mb-2">Panel States:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 p-3 rounded text-center">
                    <div className="font-medium text-gray-800">Minimized</div>
                    <div className="text-sm text-gray-600">~60px width</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-center">
                    <div className="font-medium text-gray-800">Normal</div>
                    <div className="text-sm text-gray-600">~250-300px width</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-center">
                    <div className="font-medium text-gray-800">Focused</div>
                    <div className="text-sm text-gray-600">~400-500px width</div>
                  </div>
                </div>

                <p className="text-gray-700">
                  Try clicking the toggle buttons in the left and right panels to see how 
                  the layout adapts dynamically. The center panel will always maintain 
                  enough width to be usable while the side panels expand and contract.
                </p>
              </div>
            </div>

            {/* Interactive demo section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Interactive Demo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Responsive Behavior</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Resize your browser window to see how the panels adapt to different screen sizes.
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>• Desktop (≥1024px): Both panels normal by default</div>
                    <div>• Tablet (768-1023px): Panels minimized, one can be focused</div>
                    <div>• Mobile (&lt;768px): Both panels minimized</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Panel Controls</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Use the toggle buttons in each panel header to cycle through states.
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>• Click once: minimized → normal</div>
                    <div>• Click twice: normal → focused</div>
                    <div>• Click thrice: focused → minimized</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
};