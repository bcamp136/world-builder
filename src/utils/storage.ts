import type { WorldElement, WorldProject } from '../types'

export interface StoredData {
  projects: WorldProject[]
  currentProjectId?: string
  elements: WorldElement[]
}

export interface ProjectData {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  elements: WorldElement[]
  version: string
}

// File System Access API type declarations
declare global {
  interface Window {
    showSaveFilePicker(options?: {
      suggestedName?: string
      types?: Array<{
        description: string
        accept: Record<string, string[]>
      }>
    }): Promise<FileSystemFileHandle>
    
    showOpenFilePicker(options?: {
      types?: Array<{
        description: string
        accept: Record<string, string[]>
      }>
      multiple?: boolean
    }): Promise<FileSystemFileHandle[]>
  }
}

// File handle storage for opened projects
let currentProjectFileHandle: FileSystemFileHandle | null = null
let currentProjectPath: string | null = null

// File System Access API support detection
export function isFileSystemAccessSupported(): boolean {
  return 'showSaveFilePicker' in window && 'showOpenFilePicker' in window
}

// Utility functions for file operations
export async function saveProjectToFile(projectData: ProjectData, fileHandle?: FileSystemFileHandle): Promise<FileSystemFileHandle> {
  try {
    let handle = fileHandle
    
    if (!handle && isFileSystemAccessSupported()) {
      // Show save dialog
      handle = await window.showSaveFilePicker({
        suggestedName: `${projectData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`,
        types: [{
          description: 'World Builder Project',
          accept: { 'application/json': ['.json'] }
        }]
      })
    }
    
    if (handle) {
      // Use File System Access API
      const writable = await handle.createWritable()
      await writable.write(JSON.stringify(projectData, null, 2))
      await writable.close()
      currentProjectFileHandle = handle
      currentProjectPath = handle.name
      return handle
    } else {
      // Fallback: download file
      downloadProjectFile(projectData)
      throw new Error('File System Access API not supported, file downloaded instead')
    }
  } catch (error) {
    console.error('Failed to save project file:', error)
    // Fallback: download file
    downloadProjectFile(projectData)
    throw error
  }
}

export async function loadProjectFromFile(): Promise<ProjectData | null> {
  try {
    if (!isFileSystemAccessSupported()) {
      throw new Error('File System Access API not supported')
    }
    
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{
        description: 'World Builder Project',
        accept: { 'application/json': ['.json'] }
      }],
      multiple: false
    })
    
    const file = await fileHandle.getFile()
    const text = await file.text()
    const projectData: ProjectData = JSON.parse(text)
    
    // Convert date strings back to Date objects
    projectData.createdAt = new Date(projectData.createdAt)
    projectData.updatedAt = new Date(projectData.updatedAt)
    if (projectData.elements) {
      projectData.elements.forEach((element: WorldElement) => {
        element.createdAt = new Date(element.createdAt)
        element.updatedAt = new Date(element.updatedAt)
      })
    }
    
    currentProjectFileHandle = fileHandle
    currentProjectPath = fileHandle.name
    return projectData
  } catch (error) {
    console.error('Failed to load project file:', error)
    return null
  }
}

// Fallback: Download/Upload functionality
export function downloadProjectFile(projectData: ProjectData): void {
  const dataStr = JSON.stringify(projectData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${projectData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function uploadProjectFile(onLoad: (projectData: ProjectData) => void): void {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const projectData: ProjectData = JSON.parse(e.target?.result as string)
          
          // Convert date strings back to Date objects
          projectData.createdAt = new Date(projectData.createdAt)
          projectData.updatedAt = new Date(projectData.updatedAt)
          if (projectData.elements) {
            projectData.elements.forEach((element: WorldElement) => {
              element.createdAt = new Date(element.createdAt)
              element.updatedAt = new Date(element.updatedAt)
            })
          }
          
          onLoad(projectData)
        } catch (error) {
          console.error('Failed to parse project file:', error)
          alert('Invalid project file format')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

// File-based storage functions (compatibility layer)
export async function saveToStorage(data: StoredData, projectId?: string): Promise<void> {
  if (projectId && currentProjectFileHandle) {
    // Auto-save to existing file
    const project = data.projects.find(p => p.id === projectId) || {
      id: projectId,
      name: 'Untitled Project',
      description: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const projectData: ProjectData = {
      id: projectId,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: new Date(),
      elements: data.elements,
      version: '1.0.0'
    }
    
    try {
      const writable = await currentProjectFileHandle.createWritable()
      await writable.write(JSON.stringify(projectData, null, 2))
      await writable.close()
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }
}

export function loadFromStorage(): StoredData {
  // For file-based storage, this returns empty data
  // Actual loading happens through file dialogs
  return {
    projects: [],
    elements: [],
    currentProjectId: undefined
  }
}

export function clearStorage(): void {
  // Clear current file handle reference
  currentProjectFileHandle = null
  currentProjectPath = null
}

// Project management functions
export function createProject(name: string, description?: string): WorldProject {
  return {
    id: crypto.randomUUID(),
    name,
    description,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export function getCurrentProjectName(): string | null {
  return currentProjectPath
}

export function hasUnsavedChanges(): boolean {
  // In file-based system, we can implement change tracking here
  return false
}

// Auto-save hook for file-based storage
export function useAutoSave(elements: WorldElement[], currentProject?: WorldProject) {
  const save = async () => {
    if (currentProject && currentProjectFileHandle) {
      const projectData: ProjectData = {
        id: currentProject.id,
        name: currentProject.name,
        description: currentProject.description,
        createdAt: currentProject.createdAt,
        updatedAt: new Date(),
        elements,
        version: '1.0.0'
      }
      
      try {
        const writable = await currentProjectFileHandle.createWritable()
        await writable.write(JSON.stringify(projectData, null, 2))
        await writable.close()
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }
  }

  return { save }
}
