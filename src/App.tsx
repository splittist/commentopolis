import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          Commentopolis
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Comment-centric document exploration
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Welcome to Your React + TypeScript + Tailwind App
          </h2>
          <div className="flex flex-col items-center space-y-4">
            <button 
              onClick={() => setCount((count) => count + 1)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Count is {count}
            </button>
            <p className="text-gray-600">
              Edit <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/App.tsx</code> and save to test HMR
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2 text-blue-600">⚡ Vite</h3>
            <p className="text-gray-600">Lightning fast build tool and dev server</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2 text-blue-600">⚛️ React + TypeScript</h3>
            <p className="text-gray-600">Modern React with full TypeScript support</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2 text-blue-600">🎨 Tailwind CSS</h3>
            <p className="text-gray-600">Utility-first CSS framework for styling</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
