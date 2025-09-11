import type { WorldElementType } from '../types'

export interface ElementTypeOption {
  value: WorldElementType
  label: string
  description: string
  icon: string
}

export const elementTypeOptions: ElementTypeOption[] = [
  {
    value: 'character',
    label: 'Character',
    description: 'People, beings, creatures, and characters',
    icon: '👤',
  },
  {
    value: 'place',
    label: 'Place',
    description: 'Locations, settings, and environments',
    icon: '🌍',
  },
  {
    value: 'object',
    label: 'Object',
    description: 'Items, artifacts, and physical things',
    icon: '�',
  },
  {
    value: 'event',
    label: 'Event',
    description: 'Happenings, conflicts, and occurrences',
    icon: '📅',
  },
  {
    value: 'concept',
    label: 'Concept',
    description: 'Ideas, systems, and abstract notions',
    icon: '�',
  },
]

// Flat options for simple dropdowns
export const simpleElementTypeOptions = elementTypeOptions.map(option => ({
  value: option.value,
  label: option.label,
}))

// Options with icons for enhanced displays
export const iconElementTypeOptions = elementTypeOptions.map(option => ({
  value: option.value,
  label: option.label,
  icon: option.icon,
}))

// Options with descriptions for tooltips or help text
export const detailedElementTypeOptions = elementTypeOptions.map(option => ({
  value: option.value,
  label: option.label,
  description: option.description,
  icon: option.icon,
}))
