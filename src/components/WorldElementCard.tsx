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
  IconSparkles,
  IconBook2,
  IconCrystalBall,
  IconBolt,
  IconWand,
  IconRobot,
  IconBulb,
  IconRuler,
  IconUsers,
  IconPaw,
  IconAlien,
  IconGhost,
  IconHeartHandshake,
  IconStar,
  IconFlare,
  IconBuilding,
  IconBrain,
  IconSword,
  IconSwords,
  IconShield,
  IconChessKnight,
  IconAlertTriangle,
  IconSkull,
  IconCrown,
  IconHearts,
  IconCoin,
  IconBox,
  IconBuildingFactory,
  IconChartBar,
  IconTimeline,
  IconRoad,
  IconBook
} from '@tabler/icons-react'
import type { WorldElement } from '../types'

interface WorldElementCardProps {
  element: WorldElement
  onEdit: (element: WorldElement) => void
  onDelete: (id: string) => void
  onDuplicate: (element: WorldElement) => void
  onConnect: (element: WorldElement) => void
}

const elementIcons: Record<string, typeof IconUser> = {
  // Core types
  character: IconUser,
  place: IconMapPin,
  object: IconDiamond,
  event: IconCalendar,
  concept: IconSparkles,
  
  // Extended types - using similar icons as their core categories
  'historical-event': IconCalendar,
  'legend': IconBook2,
  'myth': IconBook2,
  'hero': IconUser,
  'creation-story': IconBook2,
  'prophecy': IconCrystalBall,
  'power-system': IconBolt,
  'magic-system': IconWand,
  'technology': IconRobot,
  'artifact': IconDiamond,
  'invention': IconBulb,
  'magical-rule': IconRuler,
  'intelligent-species': IconUsers,
  'creature': IconPaw,
  'monster': IconAlien,
  'supernatural-entity': IconGhost,
  'belief-system': IconHeartHandshake,
  'deity': IconStar,
  'spiritual-force': IconFlare,
  'religious-institution': IconBuilding,
  'philosophy': IconBrain,
  'war': IconSword,
  'conflict': IconSwords,
  'military-force': IconShield,
  'strategy': IconChessKnight,
  'threat': IconAlertTriangle,
  'antagonist': IconSkull,
  'npc': IconUser,
  'important-figure': IconCrown,
  'relationship': IconHearts,
  'trade-system': IconCoin,
  'currency': IconCoin,
  'resource': IconBox,
  'industry': IconBuildingFactory,
  'economic-class': IconChartBar,
  'note': IconNote,
  'timeline': IconTimeline,
  'plot': IconRoad,
  'lore': IconBook
}

const elementColors: Record<string, string> = {
  // Core types
  character: 'blue',
  place: 'green',
  object: 'violet',
  event: 'orange',
  concept: 'teal',
  
  // Extended types - grouped by similar categories
  'historical-event': 'orange',
  'legend': 'yellow',
  'myth': 'yellow',
  'hero': 'blue',
  'creation-story': 'yellow',
  'prophecy': 'yellow',
  'power-system': 'grape',
  'magic-system': 'grape',
  'technology': 'indigo',
  'artifact': 'violet',
  'invention': 'indigo',
  'magical-rule': 'grape',
  'intelligent-species': 'blue',
  'creature': 'lime',
  'monster': 'red',
  'supernatural-entity': 'purple',
  'belief-system': 'pink',
  'deity': 'yellow',
  'spiritual-force': 'pink',
  'religious-institution': 'pink',
  'philosophy': 'teal',
  'war': 'red',
  'conflict': 'red',
  'military-force': 'orange',
  'strategy': 'teal',
  'threat': 'red',
  'antagonist': 'red',
  'npc': 'blue',
  'important-figure': 'blue',
  'relationship': 'pink',
  'trade-system': 'cyan',
  'currency': 'cyan',
  'resource': 'lime',
  'industry': 'dark',
  'economic-class': 'gray',
  'note': 'gray',
  'timeline': 'orange',
  'plot': 'blue',
  'lore': 'yellow'
}

export function WorldElementCard({ element, onEdit, onDelete, onDuplicate, onConnect }: WorldElementCardProps) {
  const IconComponent = elementIcons[element.type] || IconNote
  const color = elementColors[element.type] || 'gray'

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Card Header with Title and Menu */}
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

      {/* Element Type and Tags */}
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

      {/* Element Content Summary - Using flex-grow to push button to bottom */}
      <Text size="sm" c="dimmed" lineClamp={3} style={{ flexGrow: 1, marginBottom: '1rem' }}>
        {element.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
      </Text>

      {/* Action Button - Will always be at the bottom of the card */}
      <Button variant="light" fullWidth onClick={() => onEdit(element)}>
        View & Edit
      </Button>
    </Card>
  )
}
