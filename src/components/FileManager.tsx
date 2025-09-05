import { useState } from 'react'
import {
  Group,
  Button,
  Menu,
  ActionIcon,
  Text,
  Stack,
  Alert
} from '@mantine/core'
import { modals } from '@mantine/modals'
import {
  IconFolder,
  IconFolderOpen,
  IconDeviceFloppy,
  IconDownload,
  IconUpload,
  IconDots,
  IconInfoCircle
} from '@tabler/icons-react'
import {
  isFileSystemAccessSupported,
  saveProjectToFile,
  loadProjectFromFile,
  downloadProjectFile,
  uploadProjectFile,
  getCurrentProjectName
} from '../utils/storage'
import type { WorldProject, WorldElement } from '../types'

interface FileManagerProps {
  currentProject: WorldProject | null
  elements: WorldElement[]
  onProjectLoad: (project: WorldProject, elements: WorldElement[]) => void
  onProjectSave?: () => void
}

export function FileManager({ 
  currentProject, 
  elements, 
  onProjectLoad,
  onProjectSave 
}: FileManagerProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const hasFileSystemSupport = isFileSystemAccessSupported()
  const currentFileName = getCurrentProjectName()

  const handleNewProject = () => {
    modals.openConfirmModal({
      title: 'Create New Project',
      children: (
        <Stack gap="sm">
          <Text>Create a new project? Any unsaved changes will be lost.</Text>
          {!hasFileSystemSupport && (
            <Alert icon={<IconInfoCircle size={16} />} color="yellow" variant="light">
              Your browser doesn't support advanced file operations. Projects will be downloaded/uploaded as files.
            </Alert>
          )}
        </Stack>
      ),
      labels: { confirm: 'Create New', cancel: 'Cancel' },
      onConfirm: () => {
        const newProject: WorldProject = {
          id: crypto.randomUUID(),
          name: 'Untitled Project',
          description: 'A new world building project',
          createdAt: new Date(),
          updatedAt: new Date()
        }
        onProjectLoad(newProject, [])
      },
    })
  }

  const handleOpenProject = async () => {
    if (hasFileSystemSupport) {
      setIsLoading(true)
      try {
        const projectData = await loadProjectFromFile()
        if (projectData) {
          const project: WorldProject = {
            id: projectData.id,
            name: projectData.name,
            description: projectData.description,
            storyContent: projectData.storyContent,
            storyLastAnalyzed: projectData.storyLastAnalyzed,
            createdAt: projectData.createdAt,
            updatedAt: projectData.updatedAt
          }
          onProjectLoad(project, projectData.elements)
        }
      } catch (error) {
        console.error('Failed to open project:', error)
      }
      setIsLoading(false)
    } else {
      // Fallback: file upload
      uploadProjectFile((projectData) => {
        const project: WorldProject = {
          id: projectData.id,
          name: projectData.name,
          description: projectData.description,
          storyContent: projectData.storyContent,
          storyLastAnalyzed: projectData.storyLastAnalyzed,
          createdAt: projectData.createdAt,
          updatedAt: projectData.updatedAt
        }
        onProjectLoad(project, projectData.elements)
      })
    }
  }

  const handleSaveProject = async () => {
    if (!currentProject) return

    setIsSaving(true)
    try {
      const projectData = {
        id: currentProject.id,
        name: currentProject.name,
        description: currentProject.description,
        storyContent: currentProject.storyContent,
        storyLastAnalyzed: currentProject.storyLastAnalyzed,
        createdAt: currentProject.createdAt,
        updatedAt: new Date(),
        elements,
        version: '1.0.0'
      }

      if (hasFileSystemSupport) {
        await saveProjectToFile(projectData)
      } else {
        downloadProjectFile(projectData)
      }
      onProjectSave?.()
    } catch (error) {
      console.error('Failed to save project:', error)
    }
    setIsSaving(false)
  }

  const handleExportProject = () => {
    if (!currentProject) return

    const projectData = {
      id: currentProject.id,
      name: currentProject.name,
      description: currentProject.description,
      storyContent: currentProject.storyContent,
      storyLastAnalyzed: currentProject.storyLastAnalyzed,
      createdAt: currentProject.createdAt,
      updatedAt: new Date(),
      elements,
      version: '1.0.0'
    }

    downloadProjectFile(projectData)
  }

  return (
    <Group>
      <Button
        leftSection={<IconFolder size={16} />}
        onClick={handleNewProject}
        variant="light"
      >
        New
      </Button>

      <Button
        leftSection={<IconFolderOpen size={16} />}
        onClick={handleOpenProject}
        loading={isLoading}
        variant="light"
      >
        Open
      </Button>

      <Button
        leftSection={<IconDeviceFloppy size={16} />}
        onClick={handleSaveProject}
        loading={isSaving}
        disabled={!currentProject}
      >
        Save
      </Button>

      {currentProject && (
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon variant="light">
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconDownload size={14} />}
              onClick={handleExportProject}
            >
              Export Project
            </Menu.Item>
            <Menu.Item
              leftSection={<IconUpload size={14} />}
              onClick={handleOpenProject}
            >
              Import Project
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}

      {currentFileName && (
        <Text size="sm" c="dimmed">
          {currentFileName}
        </Text>
      )}
    </Group>
  )
}
