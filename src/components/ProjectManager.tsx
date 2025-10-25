import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDocumentContext } from '../hooks/useDocumentContext';
import { useProjectStorage } from '../hooks/useProjectStorage';
import type { Project } from '../types';

interface ProjectManagerProps {
  className?: string;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ className = '' }) => {
  const { documents, comments } = useDocumentContext();
  const { 
    saveProject, 
    loadProject, 
    listProjects, 
    deleteProject, 
    exportProject, 
    importProject 
  } = useProjectStorage();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load available projects when load dialog is opened
  const loadAvailableProjects = useCallback(async () => {
    try {
      setLoading(true);
      const projects = await listProjects();
      setAvailableProjects(projects.sort((a, b) => 
        b.lastModified.getTime() - a.lastModified.getTime()
      ));
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  }, [listProjects]);

  useEffect(() => {
    if (showLoadDialog) {
      loadAvailableProjects();
    }
  }, [showLoadDialog, loadAvailableProjects]);

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      return;
    }

    try {
      await saveProject(projectName.trim(), documents);
      setProjectName('');
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleLoadProject = async (projectId: string) => {
    try {
      const project = await loadProject(projectId);
      if (project) {
        // Note: In a full implementation, this would restore the full document state
        // For now, we just show success message
        setShowLoadDialog(false);
      }
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (window.confirm(`Are you sure you want to delete "${projectName}"?`)) {
      try {
        await deleteProject(projectId);
        loadAvailableProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleExportProject = async (project: Project) => {
    try {
      exportProject(project);
    } catch (error) {
      console.error('Error exporting project:', error);
    }
  };

  const handleImportProject = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importProject(text);
      if (showLoadDialog) {
        loadAvailableProjects();
      }
    } catch (error) {
      console.error('Error importing project:', error);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasDocuments = documents.length > 0;
  const hasComments = comments.length > 0;

  return (
    <div className={className}>
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-800 text-sm">Project</h3>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={!hasDocuments}
            className={`
              px-3 py-2 text-sm rounded-lg transition-colors duration-200
              ${hasDocuments
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
            title={hasDocuments ? 'Save current project' : 'No documents to save'}
          >
            💾 Save
          </button>

          <button
            onClick={() => setShowLoadDialog(true)}
            className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
          >
            📂 Load
          </button>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
        >
          📥 Import JSON
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportProject}
          className="hidden"
        />
      </div>

      {/* Save Project Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Save Project</h2>
            
            <div className="mb-4">
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveProject()}
                placeholder="Enter project name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <p>This project contains:</p>
              <ul className="list-disc list-inside mt-2">
                <li>{documents.length} document(s)</li>
                <li>{hasComments ? comments.length : 0} comment(s)</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setProjectName('');
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProject}
                disabled={!projectName.trim()}
                className={`
                  px-4 py-2 text-sm rounded-lg transition-colors duration-200
                  ${projectName.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Project Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Load Project</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-600">Loading projects...</div>
              </div>
            ) : availableProjects.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-600">No saved projects found</div>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {availableProjects.map((project) => (
                  <div
                    key={project.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          <p>Created: {project.created.toLocaleDateString()}</p>
                          <p>Last modified: {project.lastModified.toLocaleDateString()}</p>
                          <p>{project.documents.length} document(s)</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleLoadProject(project.id)}
                          className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors duration-200"
                          title="Load project"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleExportProject(project)}
                          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
                          title="Export to JSON"
                        >
                          Export
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id, project.name)}
                          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200"
                          title="Delete project"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setShowLoadDialog(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
