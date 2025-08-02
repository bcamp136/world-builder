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
  IconBook,
  IconScript,
  IconWand,
  IconBuilding,
  IconWorld,
  IconBookmarks,
  IconLanguage,
  IconClock,
  IconNote,
  IconMountain,
  IconCloudRain,
  IconDiamond,
  IconCrown,
  IconUsers,
  IconShield,
  IconSparkles,
  IconSword,
  IconFlame,
  IconGhost,
  IconEye,
  IconCoins,
  IconTruck,
  IconScale,
  IconGavel,
  IconClipboard,
  IconSettings
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
  // 🌍 Geography & Setting
  landscape: IconMountain,
  climate: IconCloudRain,
  map: IconWorld,
  nation: IconCrown,
  city: IconBuilding,
  landmark: IconMapPin,
  
  // 🧑‍🤝‍🧑 Cultures & Societies
  race: IconUsers,
  species: IconUser,
  'social-structure': IconUsers,
  language: IconLanguage,
  tradition: IconBookmarks,
  custom: IconBook,
  
  // 🏛 Politics & Power
  government: IconCrown,
  ruler: IconUser,
  faction: IconShield,
  organization: IconBuilding,
  law: IconGavel,
  'justice-system': IconScale,
  
  // 📜 History & Mythology
  'historical-event': IconCalendar,
  legend: IconBook,
  myth: IconBookmarks,
  hero: IconUser,
  'creation-story': IconSparkles,
  prophecy: IconEye,
  
  // 🧙 Magic or Technology
  'power-system': IconSparkles,
  'magic-system': IconWand,
  technology: IconSettings,
  artifact: IconDiamond,
  invention: IconSettings,
  'magical-rule': IconBook,
  
  // 🐉 Creatures & Beings
  'intelligent-species': IconUsers,
  creature: IconUser,
  monster: IconFlame,
  'supernatural-entity': IconGhost,
  
  // 🔮 Religion & Philosophy
  'belief-system': IconBookmarks,
  deity: IconSparkles,
  'spiritual-force': IconGhost,
  'religious-institution': IconBuilding,
  philosophy: IconBook,
  
  // ⚔️ Conflict & Warfare
  war: IconSword,
  conflict: IconFlame,
  'military-force': IconShield,
  strategy: IconClipboard,
  threat: IconFlame,
  antagonist: IconUser,
  
  // 👥 Characters & Roles
  character: IconUser,
  npc: IconUser,
  'important-figure': IconCrown,
  relationship: IconUsers,
  
  // 📦 Economy & Resources
  'trade-system': IconTruck,
  currency: IconCoins,
  resource: IconDiamond,
  industry: IconBuilding,
  'economic-class': IconUsers,
  
  // 📝 General & Legacy
  note: IconNote,
  timeline: IconClock,
  plot: IconScript,
  lore: IconBook
}

const elementColors = {
  // 🌍 Geography & Setting
  landscape: 'green',
  climate: 'cyan',
  map: 'teal',
  nation: 'violet',
  city: 'blue',
  landmark: 'lime',
  
  // 🧑‍🤝‍🧑 Cultures & Societies
  race: 'orange',
  species: 'teal',
  'social-structure': 'blue',
  language: 'indigo',
  tradition: 'grape',
  custom: 'violet',
  
  // 🏛 Politics & Power
  government: 'violet',
  ruler: 'yellow',
  faction: 'red',
  organization: 'blue',
  law: 'blue',
  'justice-system': 'indigo',
  
  // 📜 History & Mythology
  'historical-event': 'orange',
  legend: 'purple',
  myth: 'violet',
  hero: 'yellow',
  'creation-story': 'pink',
  prophecy: 'indigo',
  
  // 🧙 Magic or Technology
  'power-system': 'pink',
  'magic-system': 'violet',
  technology: 'gray',
  artifact: 'grape',
  invention: 'cyan',
  'magical-rule': 'purple',
  
  // 🐉 Creatures & Beings
  'intelligent-species': 'teal',
  creature: 'green',
  monster: 'red',
  'supernatural-entity': 'dark',
  
  // 🔮 Religion & Philosophy
  'belief-system': 'grape',
  deity: 'yellow',
  'spiritual-force': 'cyan',
  'religious-institution': 'violet',
  philosophy: 'indigo',
  
  // ⚔️ Conflict & Warfare
  war: 'red',
  conflict: 'orange',
  'military-force': 'red',
  strategy: 'dark',
  threat: 'red',
  antagonist: 'dark',
  
  // 👥 Characters & Roles
  character: 'blue',
  npc: 'cyan',
  'important-figure': 'yellow',
  relationship: 'pink',
  
  // 📦 Economy & Resources
  'trade-system': 'orange',
  currency: 'yellow',
  resource: 'lime',
  industry: 'gray',
  'economic-class': 'blue',
  
  // 📝 General & Legacy
  note: 'dark',
  timeline: 'gray',
  plot: 'red',
  lore: 'purple'
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
