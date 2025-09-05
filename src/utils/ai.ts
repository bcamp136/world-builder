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
  // 🌍 Geography & Setting
  {
    id: 'landscape-terrain',
    name: 'Landscape & Terrain',
    type: 'landscape',
    prompt: 'Create a detailed landscape including: terrain features, natural formations, geographical boundaries, notable landmarks, environmental hazards, and how it affects inhabitants. Landscape concept: {userInput}',
    description: 'Design diverse terrains and natural environments'
  },
  {
    id: 'climate-weather',
    name: 'Climate & Weather',
    type: 'climate',
    prompt: 'Develop a climate system with: seasonal patterns, weather phenomena, temperature ranges, precipitation, how it affects life and culture, and any unique weather events. Climate concept: {userInput}',
    description: 'Create weather systems and seasonal cycles'
  },
  {
    id: 'map-region',
    name: 'Map & Geography',
    type: 'map',
    prompt: 'Design a geographical map including: borders and boundaries, major features, settlements, trade routes, strategic locations, and how geography influences politics and culture. Map concept: {userInput}',
    description: 'Create detailed geographical layouts'
  },
  {
    id: 'nation-country',
    name: 'Nation & Country',
    type: 'nation',
    prompt: 'Build a nation with: borders and territory, government structure, population and demographics, culture and values, relationships with neighbors, and national identity. Nation concept: {userInput}',
    description: 'Design countries and political entities'
  },
  {
    id: 'city-settlement',
    name: 'City & Settlement',
    type: 'city',
    prompt: 'Create a city including: location and layout, architecture and districts, population and demographics, governance, economy, notable locations, and cultural significance. City concept: {userInput}',
    description: 'Design urban centers and settlements'
  },
  {
    id: 'landmark-monument',
    name: 'Landmark & Monument',
    type: 'landmark',
    prompt: 'Design a landmark with: physical description, historical significance, location and accessibility, cultural importance, legends or stories, and current state. Landmark concept: {userInput}',
    description: 'Create significant geographical or cultural markers'
  },

  // 🧑‍🤝‍🧑 Cultures & Societies
  {
    id: 'race-people',
    name: 'Race & People',
    type: 'race',
    prompt: 'Create a race or people including: physical characteristics, cultural traits, history and origins, society structure, relationships with other races, and unique abilities or perspectives. Race concept: {userInput}',
    description: 'Design distinct peoples and ethnicities'
  },
  {
    id: 'species-sapient',
    name: 'Sapient Species',
    type: 'species',
    prompt: 'Develop a sapient species with: biological traits, intelligence and consciousness, social behavior, communication methods, environmental adaptations, and interaction with other species. Species concept: {userInput}',
    description: 'Create intelligent non-human species'
  },
  {
    id: 'social-structure-hierarchy',
    name: 'Social Structure',
    type: 'social-structure',
    prompt: 'Design a social structure including: hierarchy levels, class mobility, roles and responsibilities, power distribution, social norms, and how structure affects daily life. Structure concept: {userInput}',
    description: 'Build social hierarchies and class systems'
  },
  {
    id: 'language-communication',
    name: 'Language & Communication',
    type: 'language',
    prompt: 'Create a language with: linguistic family, writing system, grammar basics, cultural expressions, regional dialects, formal vs informal usage, and role in society. Language concept: {userInput}',
    description: 'Develop languages and communication systems'
  },
  {
    id: 'tradition-cultural',
    name: 'Cultural Tradition',
    type: 'tradition',
    prompt: 'Develop a tradition including: origins and meaning, how it\'s practiced, who participates, variations by region, significance in daily life, and how it\'s evolving. Tradition concept: {userInput}',
    description: 'Create cultural practices and ceremonies'
  },
  {
    id: 'custom-practice',
    name: 'Custom & Practice',
    type: 'custom',
    prompt: 'Create a custom including: purpose and function, social context, participants and roles, variations and adaptations, enforcement or encouragement, and cultural significance. Custom concept: {userInput}',
    description: 'Design social customs and behavioral norms'
  },

  // 🏛 Politics & Power
  {
    id: 'government-system',
    name: 'Government System',
    type: 'government',
    prompt: 'Design a government including: structure and branches, leadership selection, decision-making processes, citizen participation, checks and balances, and sources of legitimacy. Government concept: {userInput}',
    description: 'Create political systems and ruling structures'
  },
  {
    id: 'ruler-leader',
    name: 'Ruler & Leader',
    type: 'ruler',
    prompt: 'Create a ruler including: background and rise to power, leadership style, political challenges, relationships with subjects, goals and motivations, and legacy. Ruler concept: {userInput}',
    description: 'Design political leaders and authority figures'
  },
  {
    id: 'faction-group',
    name: 'Faction & Group',
    type: 'faction',
    prompt: 'Develop a faction with: ideology and goals, membership and recruitment, leadership structure, resources and capabilities, allies and enemies, and methods of operation. Faction concept: {userInput}',
    description: 'Create political or ideological groups'
  },
  {
    id: 'organization-institution',
    name: 'Organization & Institution',
    type: 'organization',
    prompt: 'Create an organization including: purpose and mission, structure and hierarchy, membership requirements, resources and funding, influence and reach, and internal politics. Organization concept: {userInput}',
    description: 'Design formal institutions and groups'
  },
  {
    id: 'law-legal',
    name: 'Law & Legal Code',
    type: 'law',
    prompt: 'Create a legal system including: fundamental principles, specific laws and regulations, enforcement mechanisms, penalties and punishments, legal procedures, and how it reflects society\'s values. Law concept: {userInput}',
    description: 'Design legal frameworks and specific laws'
  },
  {
    id: 'justice-system-courts',
    name: 'Justice System',
    type: 'justice-system',
    prompt: 'Develop a justice system with: court structure, legal procedures, types of punishment, appeals processes, law enforcement, and how different classes are treated. Justice concept: {userInput}',
    description: 'Create systems for maintaining order and resolving disputes'
  },

  // 📜 History & Mythology
  {
    id: 'historical-event-major',
    name: 'Historical Event',
    type: 'historical-event',
    prompt: 'Chronicle a historical event including: timeline and context, key participants, causes and buildup, major developments, consequences and aftermath, and how it\'s remembered. Event concept: {userInput}',
    description: 'Detail significant moments that shaped history'
  },
  {
    id: 'legend-story',
    name: 'Legend & Story',
    type: 'legend',
    prompt: 'Create a legend including: the story and its variations, historical basis (if any), cultural significance, how it\'s told and retold, moral or lesson, and influence on society. Legend concept: {userInput}',
    description: 'Craft legendary tales and folk stories'
  },
  {
    id: 'myth-mythology',
    name: 'Myth & Mythology',
    type: 'myth',
    prompt: 'Develop a myth including: the mythological story, symbolic meaning, cultural context, different interpretations, ritual or ceremonial aspects, and influence on beliefs. Myth concept: {userInput}',
    description: 'Create foundational myths and symbolic stories'
  },
  {
    id: 'hero-legendary',
    name: 'Hero & Legendary Figure',
    type: 'hero',
    prompt: 'Create a heroic figure including: deeds and accomplishments, background and origin, personality traits, challenges overcome, legacy and influence, and how they\'re remembered. Hero concept: {userInput}',
    description: 'Design legendary heroes and iconic figures'
  },
  {
    id: 'creation-story-origin',
    name: 'Creation Story',
    type: 'creation-story',
    prompt: 'Craft a creation story including: how the world began, primordial forces or beings, stages of creation, what went right or wrong, different cultural versions, and lasting influence. Creation concept: {userInput}',
    description: 'Develop origin stories and cosmological myths'
  },
  {
    id: 'prophecy-prediction',
    name: 'Prophecy & Prediction',
    type: 'prophecy',
    prompt: 'Create a prophecy including: the prophecy text, source and circumstances, different interpretations, signs of fulfillment, those who seek to fulfill or prevent it, and potential outcomes. Prophecy concept: {userInput}',
    description: 'Craft mysterious predictions and their interpretations'
  },

  // 🧙 Magic or Technology
  {
    id: 'power-system-general',
    name: 'Power System',
    type: 'power-system',
    prompt: 'Design a power system including: source of power, how it\'s accessed and used, limitations and costs, who can use it, cultural attitudes, and impact on society. Power system concept: {userInput}',
    description: 'Create comprehensive power frameworks'
  },
  {
    id: 'magic-system-specific',
    name: 'Magic System',
    type: 'magic-system',
    prompt: 'Create a magic system including: how magic works, sources of magical power, limitations and costs, different schools or types, practitioners and training, and cultural integration. Magic concept: {userInput}',
    description: 'Design structured magical systems'
  },
  {
    id: 'technology-system',
    name: 'Technology System',
    type: 'technology',
    prompt: 'Develop technology including: technological level, key innovations, manufacturing and materials, who has access, interaction with magic (if any), and social impact. Technology concept: {userInput}',
    description: 'Create technological frameworks and innovations'
  },
  {
    id: 'artifact-item',
    name: 'Artifact & Magical Item',
    type: 'artifact',
    prompt: 'Design an artifact including: appearance and construction, powers and abilities, history and creation, current location, activation requirements, and potential dangers. Artifact concept: {userInput}',
    description: 'Create powerful items and relics'
  },
  {
    id: 'invention-device',
    name: 'Invention & Device',
    type: 'invention',
    prompt: 'Create an invention including: purpose and function, design and construction, inventor and creation story, impact on society, limitations or problems, and potential developments. Invention concept: {userInput}',
    description: 'Design innovative tools and devices'
  },
  {
    id: 'magical-rule-law',
    name: 'Magical Rule & Law',
    type: 'magical-rule',
    prompt: 'Establish a magical rule including: the rule and its effects, why it exists, exceptions or loopholes, how it\'s discovered or learned, consequences of breaking it, and implications for magic users. Rule concept: {userInput}',
    description: 'Define laws and limitations of magical systems'
  },

  // 🐉 Creatures & Beings
  {
    id: 'intelligent-species-advanced',
    name: 'Intelligent Species',
    type: 'intelligent-species',
    prompt: 'Create an intelligent species including: physical characteristics, mental capabilities, social structure, culture and values, relationship with other species, and unique traits. Species concept: {userInput}',
    description: 'Design advanced sentient beings'
  },
  {
    id: 'creature-animal',
    name: 'Creature & Animal',
    type: 'creature',
    prompt: 'Design a creature including: physical description, habitat and behavior, diet and lifecycle, relationship with other species, role in ecosystem, and interaction with intelligent beings. Creature concept: {userInput}',
    description: 'Create animals and natural creatures'
  },
  {
    id: 'monster-hostile',
    name: 'Monster & Hostile Being',
    type: 'monster',
    prompt: 'Create a monster including: appearance and abilities, origins and nature, behavior patterns, habitat and territory, weaknesses or vulnerabilities, and threat level. Monster concept: {userInput}',
    description: 'Design dangerous creatures and threats'
  },
  {
    id: 'supernatural-entity-spirit',
    name: 'Supernatural Entity',
    type: 'supernatural-entity',
    prompt: 'Design a supernatural entity including: nature and essence, manifestation and appearance, powers and abilities, relationship with physical world, motivations, and how mortals interact with it. Entity concept: {userInput}',
    description: 'Create otherworldly beings and spirits'
  },

  // 🔮 Religion & Philosophy
  {
    id: 'belief-system-religion',
    name: 'Belief System',
    type: 'belief-system',
    prompt: 'Create a belief system including: core beliefs and teachings, practices and rituals, organizational structure, relationship with daily life, variations and sects, and influence on society. Belief concept: {userInput}',
    description: 'Design religious and philosophical systems'
  },
  {
    id: 'deity-divine',
    name: 'Deity & Divine Being',
    type: 'deity',
    prompt: 'Create a deity including: domains and powers, personality and motivations, relationship with mortals, symbols and representations, worship practices, and role in cosmic order. Deity concept: {userInput}',
    description: 'Design gods and divine entities'
  },
  {
    id: 'spiritual-force-power',
    name: 'Spiritual Force',
    type: 'spiritual-force',
    prompt: 'Develop a spiritual force including: nature and manifestation, influence on the world, how it\'s perceived and understood, interaction with living beings, and role in belief systems. Force concept: {userInput}',
    description: 'Create spiritual energies and cosmic forces'
  },
  {
    id: 'religious-institution-church',
    name: 'Religious Institution',
    type: 'religious-institution',
    prompt: 'Create a religious institution including: structure and hierarchy, purpose and mission, practices and ceremonies, political influence, relationship with other institutions, and internal dynamics. Institution concept: {userInput}',
    description: 'Design churches, temples, and religious organizations'
  },
  {
    id: 'philosophy-school',
    name: 'Philosophy & School of Thought',
    type: 'philosophy',
    prompt: 'Develop a philosophy including: core principles and ideas, key thinkers and texts, practical applications, schools or movements, influence on society, and criticisms or debates. Philosophy concept: {userInput}',
    description: 'Create philosophical systems and intellectual movements'
  },

  // ⚔️ Conflict & Warfare
  {
    id: 'war-conflict-major',
    name: 'War & Major Conflict',
    type: 'war',
    prompt: 'Chronicle a war including: causes and escalation, major participants and alliances, key battles and turning points, strategies and tactics, consequences and aftermath, and how it\'s remembered. War concept: {userInput}',
    description: 'Detail large-scale conflicts and their impacts'
  },
  {
    id: 'conflict-dispute',
    name: 'Conflict & Dispute',
    type: 'conflict',
    prompt: 'Create a conflict including: nature of the disagreement, parties involved, underlying causes, attempted resolutions, current status, and potential outcomes. Conflict concept: {userInput}',
    description: 'Design ongoing tensions and disputes'
  },
  {
    id: 'military-force-army',
    name: 'Military Force',
    type: 'military-force',
    prompt: 'Design a military force including: organization and structure, training and discipline, equipment and tactics, leadership hierarchy, specializations, and combat effectiveness. Military concept: {userInput}',
    description: 'Create armies, guards, and fighting forces'
  },
  {
    id: 'strategy-tactic',
    name: 'Strategy & Tactics',
    type: 'strategy',
    prompt: 'Develop a strategy including: objectives and goals, methods and approaches, resources required, potential obstacles, implementation steps, and success factors. Strategy concept: {userInput}',
    description: 'Design military, political, or organizational strategies'
  },
  {
    id: 'threat-danger',
    name: 'Threat & Danger',
    type: 'threat',
    prompt: 'Create a threat including: nature and source, scope and scale, potential damage or consequences, warning signs, defensive measures, and methods of resolution. Threat concept: {userInput}',
    description: 'Design dangers and looming threats'
  },
  {
    id: 'antagonist-villain',
    name: 'Antagonist & Villain',
    type: 'antagonist',
    prompt: 'Create an antagonist including: background and motivations, goals and methods, resources and capabilities, relationships with heroes, weaknesses or flaws, and role in conflicts. Antagonist concept: {userInput}',
    description: 'Design opposing forces and villains'
  },

  // 👥 Characters & Roles
  {
    id: 'character-main',
    name: 'Character Profile',
    type: 'character',
    prompt: 'Create a character including: physical description, personality traits, background and history, skills and abilities, motivations and goals, relationships, and role in the story. Character concept: {userInput}',
    description: 'Design detailed character profiles'
  },
  {
    id: 'npc-supporting',
    name: 'NPC & Supporting Character',
    type: 'npc',
    prompt: 'Create an NPC including: role and function, personality overview, relevant background, skills or knowledge, relationships with main characters, and story significance. NPC concept: {userInput}',
    description: 'Design non-player characters and supporting figures'
  },
  {
    id: 'important-figure-historical',
    name: 'Important Figure',
    type: 'important-figure',
    prompt: 'Create an important figure including: historical significance, achievements and contributions, personality and character, influence on events, relationships with others, and lasting legacy. Figure concept: {userInput}',
    description: 'Design influential historical or contemporary figures'
  },
  {
    id: 'relationship-connection',
    name: 'Relationship & Connection',
    type: 'relationship',
    prompt: 'Develop a relationship including: nature of the connection, history and development, current status, influence on involved parties, challenges or conflicts, and potential future. Relationship concept: {userInput}',
    description: 'Create meaningful connections between characters'
  },

  // 📦 Economy & Resources
  {
    id: 'trade-system-commerce',
    name: 'Trade System',
    type: 'trade-system',
    prompt: 'Design a trade system including: trading partners and routes, goods and services exchanged, currency and payment methods, regulations and controls, economic impact, and major trade centers. Trade concept: {userInput}',
    description: 'Create comprehensive trading networks'
  },
  {
    id: 'currency-money',
    name: 'Currency & Money',
    type: 'currency',
    prompt: 'Create a currency including: form and denominations, backing and value, minting or creation authority, exchange rates, anti-counterfeiting measures, and economic role. Currency concept: {userInput}',
    description: 'Design monetary systems and exchange mediums'
  },
  {
    id: 'resource-material',
    name: 'Resource & Material',
    type: 'resource',
    prompt: 'Detail a resource including: nature and properties, location and rarity, extraction or harvesting methods, uses and applications, economic value, and control or ownership. Resource concept: {userInput}',
    description: 'Create valuable materials and natural resources'
  },
  {
    id: 'industry-sector',
    name: 'Industry & Economic Sector',
    type: 'industry',
    prompt: 'Develop an industry including: products or services, production methods, major companies or players, labor requirements, economic importance, and regulatory environment. Industry concept: {userInput}',
    description: 'Design economic sectors and industries'
  },
  {
    id: 'economic-class-wealth',
    name: 'Economic Class',
    type: 'economic-class',
    prompt: 'Create an economic class including: wealth levels and income sources, lifestyle and living conditions, social status and privileges, mobility opportunities, relationship with other classes, and economic role. Class concept: {userInput}',
    description: 'Design wealth-based social stratification'
  },

  // 📝 General & Legacy
  {
    id: 'note-general',
    name: 'General Note',
    type: 'note',
    prompt: 'Develop detailed notes about: {userInput}. Include relevant background information, connections to other elements, potential story hooks, and interesting details that bring the concept to life.',
    description: 'Create general world-building notes and ideas'
  },
  {
    id: 'timeline-chronology',
    name: 'Timeline & Chronology',
    type: 'timeline',
    prompt: 'Create a timeline including: major periods and eras, significant events and dates, cause-and-effect relationships, different perspectives or interpretations, and gaps or mysteries in the record. Timeline concept: {userInput}',
    description: 'Organize historical events and chronologies'
  },
  {
    id: 'plot-storyline',
    name: 'Plot & Storyline',
    type: 'plot',
    prompt: 'Develop a plot including: premise and setup, main conflict, key story beats, character arcs, themes and messages, pacing considerations, and resolution. Plot concept: {userInput}',
    description: 'Craft engaging storylines and narratives'
  },
  {
    id: 'lore-background',
    name: 'Lore & Background',
    type: 'lore',
    prompt: 'Create rich lore including: historical background, cultural significance, hidden knowledge or secrets, different perspectives or versions, impact on current events, and storytelling potential. Lore concept: {userInput}',
    description: 'Build foundational background information'
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
