import type { WorldElement, WorldProject, StoryAnalysisResult, ConsistencyIssue } from '../types'
import { getProviders, isAIConfigured } from './ai'

/**
 * Analyzes a story using AI to identify elements and consistency issues
 */
export async function analyzeStory(
  storyContent: string, 
  existingElements: WorldElement[], 
  project: WorldProject
): Promise<StoryAnalysisResult> {
  // Use the same provider logic as in ai.ts
  if (!isAIConfigured()) {
    throw new Error('No AI provider configured. Please add API keys in .env file.')
  }
  
  const providers = getProviders()
  // Default to OpenAI, fallback to Anthropic if OpenAI key not available
  const provider = providers.openai || providers.anthropic
  
  if (!provider) {
    throw new Error('No AI provider configured. Please add API keys in .env file.')
  }
  
  // Prepare existing elements summary for context
  const elementsSummary = existingElements
    .map(el => `${el.title} (${el.type}): ${el.content.replace(/<[^>]*>/g, '').substring(0, 100)}...`)
    .join('\n\n')
  
  // Create a prompt for the AI
  const analysisPrompt = `
  # Story Analysis Task
  
  You are an expert story analyst and world-building assistant. Analyze the following story text to identify world elements and consistency issues. Your goal is to help the author maintain a consistent and well-developed fictional world.
  
  ## Story Text:
  ${storyContent.substring(0, 10000)}${storyContent.length > 10000 ? '...(truncated)' : ''}
  
  ## Existing World Elements:
  ${elementsSummary || 'No existing elements yet.'}
  
  ## Instructions:
  1. Identify key world elements in the story (characters, places, events, etc.)
  2. Find any consistency issues (timeline problems, character contradictions, setting inconsistencies)
  3. Format your response as valid JSON with the following structure:
  
  \`\`\`json
  {
    "elements": [
      {
        "id": "unique-id", // Use existing ID if element already exists, otherwise generate a new ID
        "title": "Element Name",
        "type": "element-type", // Must be one of the valid element types
        "content": "Detailed HTML description",
        "tags": ["relevant", "tags"],
        "createdAt": "2025-09-04T12:00:00Z", // Current date in ISO format
        "updatedAt": "2025-09-04T12:00:00Z"  // Current date in ISO format
      }
    ],
    "consistencyIssues": [
      {
        "type": "character|timeline|setting|plot|general",
        "severity": "info|warning|error",
        "description": "Detailed explanation of the issue",
        "textLocation": "Quote from text showing the issue",
        "suggestion": "Recommended fix"
      }
    ]
  }
  \`\`\`
  
  ## Valid Element Types:
  - Characters: character, npc, important-figure, relationship, antagonist, protagonist
  - Places: landscape, climate, map, nation, city, landmark
  - Events: historical-event, war, conflict
  - Other: plot, lore, timeline, etc.
  
  ## Response Guidelines:
  - Only identify significant elements worth tracking in a world-building system
  - Focus on substantive inconsistencies, not minor typos
  - Be thorough but concise
  - For existing elements, suggest updates rather than creating duplicates
  `;

  try {
    // Use the generateWorldElement function from ai.ts with a custom prompt
    // But we need to adapt it since it's designed for elements, not analysis
    
    // Import the function here instead to avoid circular dependency issues
    const { generateText } = await import('ai')
    
    const isOpenAI = !!providers.openai
    const modelProvider = isOpenAI ? providers.openai! : providers.anthropic!
    const model = isOpenAI ? 'gpt-4-turbo' : 'claude-3-5-sonnet-20240620'
    
    const aiResponse = await generateText({
      model: modelProvider(model),
      prompt: `You are an expert world-building assistant. ${analysisPrompt}`,
      temperature: 0.7,
    })
    
    const responseText = aiResponse.text
    
    // Extract the JSON from the response
    const jsonMatch = responseText.match(/```json([\s\S]*?)```/) || 
                      responseText.match(/{[\s\S]*}/)
    
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON')
    }
    
    // Parse the JSON content
    const jsonContent = jsonMatch[1] || jsonMatch[0]
    const cleanedJson = jsonContent
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()
    
    const analysisResult = JSON.parse(cleanedJson) as StoryAnalysisResult
    
    // Add current date to result
    analysisResult.lastAnalyzed = new Date()
    
    // Process elements to ensure they have proper dates
    analysisResult.elements = analysisResult.elements.map(element => {
      // For new elements, create new IDs
      if (!existingElements.find(e => e.id === element.id)) {
        element.id = crypto.randomUUID()
      }
      
      // Ensure dates are actual Date objects
      element.createdAt = new Date()
      element.updatedAt = new Date()
      return element
    })
    
    return analysisResult
  } catch (error) {
    console.error('Error analyzing story:', error)
    throw new Error('Failed to analyze story. Please try again later.')
  }
}
