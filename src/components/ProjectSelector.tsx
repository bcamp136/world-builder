import { useState } from 'react'
import {
  Select,
  Button,
  Group,
  Stack,
  Text,
  Modal,
  TextInput,
  Textarea,
  ActionIcon,
  Menu,
  Alert
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { 
  IconPlus, 
  IconFolder, 
  IconDots, 
  IconEdit, 
  IconTrash,
  IconInfoCircle
} from '@tabler/icons-react'
import { modals } from '@mantine/modals'
import type { WorldProject } from '../types'

interface ProjectSelectorProps {
  projects: WorldProject[]
  currentProjectId?: string
  onProjectChange: (projectId: string) => void
  onProjectCreate: (project: WorldProject) => void
  onProjectDelete: (projectId: string) => void
}

export function ProjectSelector({ 
  projects, 
  currentProjectId, 
  onProjectChange, 
  onProjectCreate,
  onProjectDelete 
}: ProjectSelectorProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return

    const newProject: WorldProject = {
      id: crypto.randomUUID(),
      name: newProjectName.trim(),
      description: newProjectDescription.trim() || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    onProjectCreate(newProject)
    setNewProjectName('')
    setNewProjectDescription('')
    close()
  }

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    modals.openConfirmModal({
      title: 'Delete Project',
      children: (
        <Stack gap="sm">
          <Text>Are you sure you want to delete "{project.name}"?</Text>
          <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
            This action cannot be undone. All world elements in this project will be permanently deleted.
          </Alert>
        </Stack>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => onProjectDelete(projectId),
    })
  }

  const projectOptions = projects.map(project => ({
    value: project.id,
    label: project.name
  }))

  return (
    <>
      <Group>
        <Select
          placeholder="Select a project..."
          data={projectOptions}
          value={currentProjectId}
          onChange={(value) => value && onProjectChange(value)}
          leftSection={<IconFolder size={16} />}
          style={{ flex: 1 }}
          clearable={false}
          searchable
        />
        
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={open}
          variant="light"
        >
          New Project
        </Button>

        {currentProjectId && (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="light">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={() => {
                  // TODO: Implement edit project
                  console.log('Edit project:', currentProjectId)
                }}
              >
                Edit Project
              </Menu.Item>
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={() => handleDeleteProject(currentProjectId)}
              >
                Delete Project
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>

      <Modal opened={opened} onClose={close} title="Create New Project" size="md">
        <Stack>
          <TextInput
            label="Project Name"
            placeholder="Enter project name..."
            value={newProjectName}
            onChange={(event) => setNewProjectName(event.currentTarget.value)}
            required
          />
          
          <Textarea
            label="Description"
            placeholder="Optional project description..."
            value={newProjectDescription}
            onChange={(event) => setNewProjectDescription(event.currentTarget.value)}
            rows={3}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={close}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateProject}
              disabled={!newProjectName.trim()}
            >
              Create Project
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
