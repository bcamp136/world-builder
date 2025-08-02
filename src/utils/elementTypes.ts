import type { WorldElementType } from '../types'

export interface ElementTypeOption {
  value: WorldElementType
  label: string
  group: string
}

export const elementTypeOptions: ElementTypeOption[] = [
  // 🌍 Geography & Setting
  { value: 'landscape', label: 'Landscape', group: '🌍 Geography & Setting' },
  { value: 'climate', label: 'Climate', group: '🌍 Geography & Setting' },
  { value: 'map', label: 'Map', group: '🌍 Geography & Setting' },
  { value: 'nation', label: 'Nation', group: '🌍 Geography & Setting' },
  { value: 'city', label: 'City', group: '🌍 Geography & Setting' },
  { value: 'landmark', label: 'Landmark', group: '🌍 Geography & Setting' },
  
  // 🧑‍🤝‍🧑 Cultures & Societies
  { value: 'race', label: 'Race', group: '🧑‍🤝‍🧑 Cultures & Societies' },
  { value: 'species', label: 'Species', group: '🧑‍🤝‍🧑 Cultures & Societies' },
  { value: 'social-structure', label: 'Social Structure', group: '🧑‍🤝‍🧑 Cultures & Societies' },
  { value: 'language', label: 'Language', group: '🧑‍🤝‍🧑 Cultures & Societies' },
  { value: 'tradition', label: 'Tradition', group: '🧑‍🤝‍🧑 Cultures & Societies' },
  { value: 'custom', label: 'Custom', group: '🧑‍🤝‍🧑 Cultures & Societies' },
  
  // 🏛 Politics & Power
  { value: 'government', label: 'Government', group: '🏛 Politics & Power' },
  { value: 'ruler', label: 'Ruler', group: '🏛 Politics & Power' },
  { value: 'faction', label: 'Faction', group: '🏛 Politics & Power' },
  { value: 'organization', label: 'Organization', group: '🏛 Politics & Power' },
  { value: 'law', label: 'Law', group: '🏛 Politics & Power' },
  { value: 'justice-system', label: 'Justice System', group: '🏛 Politics & Power' },
  
  // 📜 History & Mythology
  { value: 'historical-event', label: 'Historical Event', group: '📜 History & Mythology' },
  { value: 'legend', label: 'Legend', group: '📜 History & Mythology' },
  { value: 'myth', label: 'Myth', group: '📜 History & Mythology' },
  { value: 'hero', label: 'Hero', group: '📜 History & Mythology' },
  { value: 'creation-story', label: 'Creation Story', group: '📜 History & Mythology' },
  { value: 'prophecy', label: 'Prophecy', group: '📜 History & Mythology' },
  
  // 🧙 Magic or Technology
  { value: 'power-system', label: 'Power System', group: '🧙 Magic or Technology' },
  { value: 'magic-system', label: 'Magic System', group: '🧙 Magic or Technology' },
  { value: 'technology', label: 'Technology', group: '🧙 Magic or Technology' },
  { value: 'artifact', label: 'Artifact', group: '🧙 Magic or Technology' },
  { value: 'invention', label: 'Invention', group: '🧙 Magic or Technology' },
  { value: 'magical-rule', label: 'Magical Rule', group: '🧙 Magic or Technology' },
  
  // 🐉 Creatures & Beings
  { value: 'intelligent-species', label: 'Intelligent Species', group: '🐉 Creatures & Beings' },
  { value: 'creature', label: 'Creature', group: '🐉 Creatures & Beings' },
  { value: 'monster', label: 'Monster', group: '🐉 Creatures & Beings' },
  { value: 'supernatural-entity', label: 'Supernatural Entity', group: '🐉 Creatures & Beings' },
  
  // 🔮 Religion & Philosophy
  { value: 'belief-system', label: 'Belief System', group: '🔮 Religion & Philosophy' },
  { value: 'deity', label: 'Deity', group: '🔮 Religion & Philosophy' },
  { value: 'spiritual-force', label: 'Spiritual Force', group: '🔮 Religion & Philosophy' },
  { value: 'religious-institution', label: 'Religious Institution', group: '🔮 Religion & Philosophy' },
  { value: 'philosophy', label: 'Philosophy', group: '🔮 Religion & Philosophy' },
  
  // ⚔️ Conflict & Warfare
  { value: 'war', label: 'War', group: '⚔️ Conflict & Warfare' },
  { value: 'conflict', label: 'Conflict', group: '⚔️ Conflict & Warfare' },
  { value: 'military-force', label: 'Military Force', group: '⚔️ Conflict & Warfare' },
  { value: 'strategy', label: 'Strategy', group: '⚔️ Conflict & Warfare' },
  { value: 'threat', label: 'Threat', group: '⚔️ Conflict & Warfare' },
  { value: 'antagonist', label: 'Antagonist', group: '⚔️ Conflict & Warfare' },
  
  // 👥 Characters & Roles
  { value: 'character', label: 'Character', group: '👥 Characters & Roles' },
  { value: 'npc', label: 'NPC', group: '👥 Characters & Roles' },
  { value: 'important-figure', label: 'Important Figure', group: '👥 Characters & Roles' },
  { value: 'relationship', label: 'Relationship', group: '👥 Characters & Roles' },
  
  // 📦 Economy & Resources
  { value: 'trade-system', label: 'Trade System', group: '📦 Economy & Resources' },
  { value: 'currency', label: 'Currency', group: '📦 Economy & Resources' },
  { value: 'resource', label: 'Resource', group: '📦 Economy & Resources' },
  { value: 'industry', label: 'Industry', group: '📦 Economy & Resources' },
  { value: 'economic-class', label: 'Economic Class', group: '📦 Economy & Resources' },
  
  // 📝 General & Legacy
  { value: 'note', label: 'Note', group: '📝 General & Legacy' },
  { value: 'timeline', label: 'Timeline', group: '📝 General & Legacy' },
  { value: 'plot', label: 'Plot', group: '📝 General & Legacy' },
  { value: 'lore', label: 'Lore', group: '📝 General & Legacy' }
]

// Flat options for simple dropdowns
export const simpleElementTypeOptions = elementTypeOptions.map(option => ({
  value: option.value,
  label: option.label
}))

// Grouped options for grouped selects
export const groupedElementTypeOptions = elementTypeOptions.reduce((acc, option) => {
  if (!acc[option.group]) {
    acc[option.group] = []
  }
  acc[option.group].push({
    value: option.value,
    label: option.label
  })
  return acc
}, {} as Record<string, Array<{ value: WorldElementType; label: string }>>)
