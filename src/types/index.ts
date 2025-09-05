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
  // Core element types for a simplified categorization
  | 'character'   // People, beings, and characters in the story
  | 'place'       // Locations, settings, and environments
  | 'object'      // Items, artifacts, and physical things
  | 'event'       // Happenings, conflicts, and occurrences
  | 'concept'     // Ideas, systems, and abstract notions

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
  storyContent?: string // Rich text content of the main story
  storyLastAnalyzed?: Date // When the AI last analyzed the story
}

export interface StoryAnalysisResult {
  elements: WorldElement[] // New or updated elements identified in the story
  consistencyIssues: ConsistencyIssue[] // Issues found during analysis
  lastAnalyzed: Date
}

export interface ConsistencyIssue {
  type: 'character' | 'timeline' | 'setting' | 'plot' | 'general'
  severity: 'info' | 'warning' | 'error'
  description: string
  elementIds?: string[] // IDs of related elements
  textLocation?: string // Context or quote where the issue appears
  suggestion?: string // AI suggestion to fix the issue
}

export interface AIProvider {
  id: 'openai' | 'anthropic'
  name: string
  models: string[]
  enabled: boolean
}
