export interface WorldElement {
  id: string
  title: string
  content: string
  type: WorldElementType
  tags: string[]
  createdAt: Date
  updatedAt: Date
  parentId?: string // For hierarchical organization
}

export type WorldElementType = 
  // 🌍 Geography & Setting
  | 'landscape'
  | 'climate'
  | 'map'
  | 'nation'
  | 'city'
  | 'landmark'
  
  // 🧑‍🤝‍🧑 Cultures & Societies
  | 'race'
  | 'species'
  | 'social-structure'
  | 'language'
  | 'tradition'
  | 'custom'
  
  // 🏛 Politics & Power
  | 'government'
  | 'ruler'
  | 'faction'
  | 'organization'
  | 'law'
  | 'justice-system'
  
  // 📜 History & Mythology
  | 'historical-event'
  | 'legend'
  | 'myth'
  | 'hero'
  | 'creation-story'
  | 'prophecy'
  
  // 🧙 Magic or Technology
  | 'power-system'
  | 'magic-system'
  | 'technology'
  | 'artifact'
  | 'invention'
  | 'magical-rule'
  
  // 🐉 Creatures & Beings
  | 'intelligent-species'
  | 'creature'
  | 'monster'
  | 'supernatural-entity'
  
  // 🔮 Religion & Philosophy
  | 'belief-system'
  | 'deity'
  | 'spiritual-force'
  | 'religious-institution'
  | 'philosophy'
  
  // ⚔️ Conflict & Warfare
  | 'war'
  | 'conflict'
  | 'military-force'
  | 'strategy'
  | 'threat'
  
  // 👥 Characters & Roles
  | 'character'
  | 'npc'
  | 'important-figure'
  | 'relationship'
  | 'antagonist'
  | 'protagonist'
  
  // 📦 Economy & Resources
  | 'trade-system'
  | 'currency'
  | 'resource'
  | 'industry'
  | 'economic-class'
  
  // 📝 General & Legacy
  | 'note'
  | 'timeline'
  | 'plot'
  | 'lore'

export interface AIPromptTemplate {
  id: string
  name: string
  type: WorldElementType
  prompt: string
  description: string
}

export interface WorldProject {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface AIProvider {
  id: 'openai' | 'anthropic'
  name: string
  models: string[]
  enabled: boolean
}
