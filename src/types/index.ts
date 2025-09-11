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
  | 'character' // People, beings, and characters in the story
  | 'place' // Locations, settings, and environments
  | 'object' // Items, artifacts, and physical things
  | 'event' // Happenings, conflicts, and occurrences
  | 'concept' // Ideas, systems, and abstract notions

  // Extended types for specific world-building elements
  | 'historical-event'
  | 'legend'
  | 'myth'
  | 'hero'
  | 'creation-story'
  | 'prophecy'
  | 'power-system'
  | 'magic-system'
  | 'technology'
  | 'artifact'
  | 'invention'
  | 'magical-rule'
  | 'intelligent-species'
  | 'creature'
  | 'monster'
  | 'supernatural-entity'
  | 'belief-system'
  | 'deity'
  | 'spiritual-force'
  | 'religious-institution'
  | 'philosophy'
  | 'war'
  | 'conflict'
  | 'military-force'
  | 'strategy'
  | 'threat'
  | 'antagonist'
  | 'npc'
  | 'important-figure'
  | 'relationship'
  | 'trade-system'
  | 'currency'
  | 'resource'
  | 'industry'
  | 'economic-class'
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

// User and subscription types for pricing plans
export interface UsageRecord {
  operation: 'generate' | 'stream' | 'analyze'
  modelName: string
  timestamp: string
  tokenCount: number
}

export interface UserUsage {
  monthlyRequests: number
  dailyRequests: number
  tokensUsed: number
  storageUsed: number
  recentRequests: UsageRecord[]
}

export interface UserPlanInfo {
  userId: string
  planType: string
  subscriptionId: string | null
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
  worldElementCount: number
  usage: UserUsage
}

export interface PlanEntitlement {
  name: string
  requestsPerMonth: number
  requestsPerDay: number
  requestsPerMinute: number
  allowedModels: string[]
  storageLimit: number
  elements: number
}
