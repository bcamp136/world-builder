import { Card, Text, Badge, Group, ActionIcon, Menu, Button } from '@mantine/core'
import { 
  IconEdit, 
  IconTrash, 
  IconDots, 
  IconCopy,
  IconLink,
  IconUser,
  IconMapPin,
  IconCalendar,
  IconNote,
  IconDiamond,
  IconSparkles
} from '@tabler/icons-react'
import type { WorldElement } from '../types'

interface WorldElementCardProps {
  element: WorldElement
  onEdit: (element: WorldElement) => void
  onDelete: (id: string) => void
  onDuplicate: (element: WorldElement) => void
  onConnect: (element: WorldElement) => void
}

const elementIcons = {
  character: IconUser,
  place: IconMapPin,
  object: IconDiamond,
  event: IconCalendar,
  concept: IconSparkles
}

const elementColors = {
  character: 'blue',
  place: 'green',
  object: 'violet',
  event: 'orange',
  concept: 'teal'
}

export function WorldElementCard({ element, onEdit, onDelete, onDuplicate, onConnect }: WorldElementCardProps) {
  const IconComponent = elementIcons[element.type] || IconNote
  const color = elementColors[element.type] || 'gray'

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Group>
          <IconComponent size={20} color={`var(--mantine-color-${color}-6)`} />
          <Text fw={500} size="lg">{element.title}</Text>
        </Group>
        
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit(element)}>
              Edit
            </Menu.Item>
            <Menu.Item leftSection={<IconCopy size={14} />} onClick={() => onDuplicate(element)}>
              Duplicate
            </Menu.Item>
            <Menu.Item leftSection={<IconLink size={14} />} onClick={() => onConnect(element)}>
              Connect
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => onDelete(element.id)}>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Group mb="xs">
        <Badge color={color} variant="light">
          {element.type.replace('-', ' ')}
        </Badge>
        {element.tags.map((tag) => (
          <Badge key={tag} variant="outline" size="sm">
            {tag}
          </Badge>
        ))}
      </Group>

      <Text size="sm" c="dimmed" lineClamp={3}>
        {element.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
      </Text>

      <Button variant="light" fullWidth mt="md" onClick={() => onEdit(element)}>
        View & Edit
      </Button>
    </Card>
  )
}
