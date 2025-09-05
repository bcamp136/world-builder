import { generateText, streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import type { WorldElementType, AIPromptTemplate } from '../types'

// Create AI provider instances with API keys
export function getProviders() {
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY
  const anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  return {
    openai: openaiApiKey ? createOpenAI({ apiKey: openaiApiKey }) : null,
    anthropic: anthropicApiKey ? createAnthropic({ apiKey: anthropicApiKey }) : null,
  }
}

// Pre-defined prompt templates for different world building elements
export const promptTemplates: AIPromptTemplate[] = [
  // Characters
  {
    id: 'character',
    name: 'Character',
    type: 'character',
    prompt: 'Create a detailed character including: appearance, personality, background, motivations, relationships, strengths and weaknesses. Character concept: {userInput}',
    description: 'Design characters, beings, and creatures'
  },
  
  // Places
  {
    id: 'place',
    name: 'Place',
    type: 'place',
    prompt: 'Create a detailed place including: location, environment, notable features, inhabitants, history, and cultural significance. Place concept: {userInput}',
    description: 'Design locations, settings, and environments'
  },
  
  // Objects
  {
    id: 'object',
    name: 'Object',
    type: 'object',
    prompt: 'Create a detailed object including: appearance, materials, function, history, significance, and who might use or value it. Object concept: {userInput}',
    description: 'Design items, artifacts, and physical things'
  },
  
  // Events
  {
    id: 'event',
    name: 'Event',
    type: 'event',
    prompt: 'Create a detailed event including: what happened, when and where it occurred, participants, causes, consequences, and historical significance. Event concept: {userInput}',
    description: 'Design events, happenings, and occurrences'
  },
  
  // Concepts
  {
    id: 'concept',
    name: 'Concept',
    type: 'concept',
    prompt: 'Create a detailed concept including: definition, origins, principles, how it works, cultural impact, and practical applications. Concept idea: {userInput}',
    description: 'Design systems, ideas, and abstract notions'
  }
]

// Generate content for specific world building elements
export async function generateWorldElement(
  elementType: WorldElementType,
  userPrompt: string,
  provider: 'openai' | 'anthropic' = 'openai',
  additionalContext?: string
) {
  try {
    const providers = getProviders()
    
    if (!providers[provider]) {
      throw new Error(`${provider} provider is not configured. Please add the API key to your .env file.`)
    }
    
    const template = promptTemplates.find(t => t.type === elementType)
    const basePrompt = template ? template.prompt.replace('{userInput}', userPrompt) : 
      `As a creative world-building assistant, help create detailed content for a ${elementType}: ${userPrompt}`
    
    const contextualPrompt = additionalContext 
      ? `${basePrompt}\n\nAdditional context from the world: ${additionalContext}`
      : basePrompt

    const result = await generateText({
      model: provider === 'openai' 
        ? providers.openai!('gpt-4')
        : providers.anthropic!('claude-3-sonnet-20240229'),
      prompt: `You are an expert world-building assistant specializing in creating rich, detailed, and internally consistent fictional worlds. ${contextualPrompt}
      
Please provide a well-structured, detailed response that would be useful for a writer or game master. Focus on creativity, internal consistency, and practical usability.`,
    })
    
    return result.text
  } catch (error) {
    console.error('AI generation error:', error)
    throw new Error('Failed to generate content. Please check your API configuration.')
  }
}

// Stream content generation for real-time feedback
export function streamWorldElement(
  elementType: WorldElementType,
  userPrompt: string,
  provider: 'openai' | 'anthropic' = 'openai',
  additionalContext?: string
) {
  try {
    const providers = getProviders()
    
    if (!providers[provider]) {
      throw new Error(`${provider} provider is not configured. Please add the API key to your .env file.`)
    }
    
    const template = promptTemplates.find(t => t.type === elementType)
    const basePrompt = template ? template.prompt.replace('{userInput}', userPrompt) : 
      `As a creative world-building assistant, help create detailed content for a ${elementType}: ${userPrompt}`
    
    const contextualPrompt = additionalContext 
      ? `${basePrompt}\n\nAdditional context from the world: ${additionalContext}`
      : basePrompt

    return streamText({
      model: provider === 'openai' 
        ? providers.openai!('gpt-4')
        : providers.anthropic!('claude-3-sonnet-20240229'),
      prompt: `You are an expert world-building assistant specializing in creating rich, detailed, and internally consistent fictional worlds. ${contextualPrompt}
      
Please provide a well-structured, detailed response that would be useful for a writer or game master. Focus on creativity, internal consistency, and practical usability.`,
    })
  } catch (error) {
    console.error('AI streaming error:', error)
    throw new Error('Failed to stream content. Please check your API configuration.')
  }
}

// Generate connections between world elements
export async function generateConnections(
  elements: string[],
  provider: 'openai' | 'anthropic' = 'openai'
) {
  try {
    const providers = getProviders()
    
    if (!providers[provider]) {
      throw new Error(`${provider} provider is not configured. Please add the API key to your .env file.`)
    }
    
    const result = await generateText({
      model: provider === 'openai' 
        ? providers.openai!('gpt-4')
        : providers.anthropic!('claude-3-sonnet-20240229'),
      prompt: `As a world-building expert, analyze these world elements and suggest meaningful connections, relationships, and interactions between them:

${elements.map((element, index) => `${index + 1}. ${element}`).join('\n')}

Provide creative but logical connections that would make the world feel more cohesive and interconnected. Consider historical relationships, shared influences, conflicts, alliances, and cause-and-effect relationships.`,
    })
    
    return result.text
  } catch (error) {
    console.error('AI connection generation error:', error)
    throw new Error('Failed to generate connections. Please check your API configuration.')
  }
}

// Expand on existing content
export async function expandContent(
  existingContent: string,
  focusArea: string,
  provider: 'openai' | 'anthropic' = 'openai'
) {
  try {
    const providers = getProviders()
    
    if (!providers[provider]) {
      throw new Error(`${provider} provider is not configured. Please add the API key to your .env file.`)
    }
    
    const result = await generateText({
      model: provider === 'openai' 
        ? providers.openai!('gpt-4')
        : providers.anthropic!('claude-3-sonnet-20240229'),
      prompt: `As a world-building expert, expand on this existing content by focusing on: ${focusArea}

Existing content:
${existingContent}

Please provide additional details, depth, and richness to the specified focus area while maintaining consistency with the existing content. Be creative but logical.`,
    })
    
    return result.text
  } catch (error) {
    console.error('AI expansion error:', error)
    throw new Error('Failed to expand content. Please check your API configuration.')
  }
}

// Environment variable helpers
export function getApiKey(provider: 'openai' | 'anthropic'): string {
  const key = provider === 'openai' 
    ? import.meta.env.VITE_OPENAI_API_KEY 
    : import.meta.env.VITE_ANTHROPIC_API_KEY
    
  if (!key) {
    throw new Error(`Missing ${provider.toUpperCase()} API key. Please add VITE_${provider.toUpperCase()}_API_KEY to your .env file.`)
  }
  
  return key
}

// Check if AI is configured
export function isAIConfigured(): boolean {
  return !!(import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY)
}
