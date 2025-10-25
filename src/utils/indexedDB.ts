/**
 * IndexedDB service for project persistence
 * Database name: commentopolis-db
 */

import type { Project } from '../types';

const DB_NAME = 'commentopolis-db';
const DB_VERSION = 1;
const PROJECTS_STORE = 'projects';

/**
 * Initialize IndexedDB database
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create projects object store if it doesn't exist
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        const objectStore = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
        
        // Create indexes for efficient queries
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('lastModified', 'lastModified', { unique: false });
        objectStore.createIndex('created', 'created', { unique: false });
      }
    };
  });
}

/**
 * Type for stored project data in IndexedDB
 */
interface StoredProject {
  id: string;
  name: string;
  created: string;
  lastModified: string;
  documents: Array<{
    id: string;
    name: string;
    fileHash: string;
    uploadDate: string;
    wordComments: Array<{
      id: string;
      author: string;
      date: string;
      plainText: string;
      content: string;
      documentId: string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  }>;
}

/**
 * Convert stored project to runtime Project type
 */
function deserializeProject(stored: StoredProject): Project {
  return {
    ...stored,
    created: new Date(stored.created),
    lastModified: new Date(stored.lastModified),
    documents: stored.documents.map((doc) => ({
      ...doc,
      uploadDate: new Date(doc.uploadDate),
      wordComments: doc.wordComments.map((comment) => ({
        ...comment,
        date: new Date(comment.date)
      }))
    }))
  };
}

/**
 * Get a database connection
 */
async function getDB(): Promise<IDBDatabase> {
  return initDB();
}

/**
 * Save a project to IndexedDB
 */
export async function saveProject(project: Project): Promise<void> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROJECTS_STORE], 'readwrite');
    const objectStore = transaction.objectStore(PROJECTS_STORE);
    
    // Convert dates to ISO strings for storage
    const projectToStore = {
      ...project,
      created: project.created.toISOString(),
      lastModified: project.lastModified.toISOString(),
      documents: project.documents.map(doc => ({
        ...doc,
        uploadDate: doc.uploadDate.toISOString(),
        wordComments: doc.wordComments.map(comment => ({
          ...comment,
          date: comment.date.toISOString()
        }))
      }))
    };
    
    const request = objectStore.put(projectToStore);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      reject(new Error('Failed to save project'));
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Load a project from IndexedDB by ID
 */
export async function loadProject(id: string): Promise<Project | null> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROJECTS_STORE], 'readonly');
    const objectStore = transaction.objectStore(PROJECTS_STORE);
    const request = objectStore.get(id);
    
    request.onsuccess = () => {
      if (request.result) {
        const project = deserializeProject(request.result as StoredProject);
        resolve(project);
      } else {
        resolve(null);
      }
    };
    
    request.onerror = () => {
      reject(new Error('Failed to load project'));
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * List all projects in IndexedDB
 */
export async function listProjects(): Promise<Project[]> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROJECTS_STORE], 'readonly');
    const objectStore = transaction.objectStore(PROJECTS_STORE);
    const request = objectStore.getAll();
    
    request.onsuccess = () => {
      // Convert ISO strings back to Date objects
      const results = request.result as StoredProject[];
      const projects = results.map(deserializeProject);
      resolve(projects);
    };
    
    request.onerror = () => {
      reject(new Error('Failed to list projects'));
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Delete a project from IndexedDB
 */
export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROJECTS_STORE], 'readwrite');
    const objectStore = transaction.objectStore(PROJECTS_STORE);
    const request = objectStore.delete(id);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      reject(new Error('Failed to delete project'));
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Export a project to JSON
 */
export function exportProjectToJSON(project: Project): string {
  return JSON.stringify(project, null, 2);
}

/**
 * Import a project from JSON
 */
export function importProjectFromJSON(json: string): Project {
  try {
    const data = JSON.parse(json) as StoredProject;
    
    // Validate required fields
    if (!data.id || !data.name || !data.created || !data.lastModified || !Array.isArray(data.documents)) {
      throw new Error('Invalid project format: missing required fields');
    }
    
    // Convert to Project type
    return deserializeProject(data);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw error;
  }
}
