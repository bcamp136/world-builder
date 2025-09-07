import { useState } from 'react'
import {
  Group,
  Menu,
  ActionIcon,
  Text,
  Stack,
  Alert,
  Tooltip,
  Badge
} from '@mantine/core'
import { modals } from '@mantine/modals'
import {
  IconFolder,
  IconFolderOpen,
  IconDeviceFloppy,
  IconDownload,
  IconUpload,
  IconDots,
  IconInfoCircle,
  IconFolderPlus
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
    <Group justify="space-between" align="center">
      <Group gap="xs">
        <IconFolder size={16} style={{ opacity: 0.7 }} />
        {currentProject ? (
          <Text size="sm" fw={500} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentFileName || currentProject.name}
          </Text>
        ) : (
          <Text size="sm" c="dimmed">No project loaded</Text>
        )}
        <Badge size="sm">{elements.length} elements</Badge>
      </Group>
      
      <Group gap={4}>
        <Tooltip label="Save Project" withArrow position="bottom">
          <ActionIcon 
            size="sm"
            onClick={handleSaveProject}
            loading={isSaving}
            disabled={!currentProject}
            variant="light"
            color="blue"
          >
            <IconDeviceFloppy size={14} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="New Project" withArrow position="bottom">
          <ActionIcon 
            size="sm"
            onClick={handleNewProject}
            variant="subtle"
          >
            <IconFolderPlus size={14} />
          </ActionIcon>
        </Tooltip>
        
        <Tooltip label="Open Project" withArrow position="bottom">
          <ActionIcon 
            size="sm"
            onClick={handleOpenProject}
            disabled={isLoading}
            variant="subtle"
          >
            <IconFolderOpen size={14} />
          </ActionIcon>
        </Tooltip>
        
        <Menu shadow="md" width={200} position="bottom-end">
          <Tooltip label="More Options" withArrow position="bottom">
            <Menu.Target>
              <ActionIcon variant="subtle" size="sm">
                <IconDots size={14} />
              </ActionIcon>
            </Menu.Target>
          </Tooltip>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconDownload size={14} />}
              onClick={handleExportProject}
              disabled={!currentProject}
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
      </Group>
    </Group>
  )
}
