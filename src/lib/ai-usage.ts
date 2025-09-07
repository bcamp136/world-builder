import { generateText, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { validateAIUsage } from '../middleware/usage';
import type { WorldElementType } from '../types';

// Create AI provider instances with API keys
export function getProviders() {
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  return {
    openai: openaiApiKey ? createOpenAI({ apiKey: openaiApiKey }) : null,
    anthropic: anthropicApiKey ? createAnthropic({ apiKey: anthropicApiKey }) : null,
  };
}

// Environment variable helpers
export function getApiKey(provider: 'openai' | 'anthropic'): string {
  const key = provider === 'openai' 
    ? import.meta.env.VITE_OPENAI_API_KEY 
    : import.meta.env.VITE_ANTHROPIC_API_KEY;
    
  if (!key) {
    throw new Error(`Missing ${provider.toUpperCase()} API key. Please add VITE_${provider.toUpperCase()}_API_KEY to your .env file.`);
  }
  
  return key;
}

// Check if AI is configured
export function isAIConfigured(): boolean {
  return !!(import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY);
}

// Generate world element with usage tracking and enforcement
export async function generateWorldElementWithUsageLimit(
  userId: string,
  elementType: WorldElementType,
  userPrompt: string,
  provider: 'openai' | 'anthropic' = 'openai',
  additionalContext?: string
) {
  try {
    const providers = getProviders();
    
    if (!providers[provider]) {
      throw new Error(`${provider} provider is not configured. Please add the API key to your .env file.`);
    }
    
    // Determine the model to use based on provider
    const model = provider === 'openai' ? 'gpt-4o-mini' : 'claude-3-sonnet-20240620';
    
    // Validate usage before proceeding
    const validation = await validateAIUsage({
      userId,
      modelName: model,
      operation: 'generate',
      tokenEstimate: userPrompt.length / 4, // Rough token estimate
    });
    
    if (!validation.allowed) {
      throw new Error(validation.message);
    }
    
    // If usage check passes, proceed with the AI request
    // This code is adapted from your existing generateWorldElement function
    const promptTemplates = (await import('../utils/ai')).promptTemplates;
    const template = promptTemplates.find(t => t.type === elementType);
    const basePrompt = template ? template.prompt.replace('{userInput}', userPrompt) : 
      `As a creative world-building assistant, help create detailed content for a ${elementType}: ${userPrompt}`;
    
    const contextualPrompt = additionalContext 
      ? `${basePrompt}\n\nAdditional context from the world: ${additionalContext}`
      : basePrompt;

    const result = await generateText({
      model: provider === 'openai' 
        ? providers.openai!(model)
        : providers.anthropic!(model),
      prompt: `You are an expert world-building assistant specializing in creating rich, detailed, and internally consistent fictional worlds. ${contextualPrompt}
      
Please provide a well-structured, detailed response that would be useful for a writer or game master. Focus on creativity, internal consistency, and practical usability.`,
    });
    
    return result.text;
  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
}

// Stream world element with usage tracking and enforcement
export async function streamWorldElementWithUsageLimit(
  userId: string,
  elementType: WorldElementType,
  userPrompt: string,
  provider: 'openai' | 'anthropic' = 'openai',
  additionalContext?: string
) {
  try {
    const providers = getProviders();
    
    if (!providers[provider]) {
      throw new Error(`${provider} provider is not configured. Please add the API key to your .env file.`);
    }
    
    // Determine the model to use based on provider and user's plan
    const model = provider === 'openai' ? 'gpt-4o-mini' : 'claude-3-sonnet-20240620';
    
    // Validate usage before proceeding
    const validation = await validateAIUsage({
      userId,
      modelName: model,
      operation: 'stream',
      tokenEstimate: userPrompt.length / 4, // Rough token estimate
    });
    
    if (!validation.allowed) {
      throw new Error(validation.message);
    }
    
    // If usage check passes, proceed with the AI request
    // This code is adapted from your existing streamWorldElement function
    const promptTemplates = (await import('../utils/ai')).promptTemplates;
    const template = promptTemplates.find(t => t.type === elementType);
    const basePrompt = template ? template.prompt.replace('{userInput}', userPrompt) : 
      `As a creative world-building assistant, help create detailed content for a ${elementType}: ${userPrompt}`;
    
    const contextualPrompt = additionalContext 
      ? `${basePrompt}\n\nAdditional context from the world: ${additionalContext}`
      : basePrompt;

    return streamText({
      model: provider === 'openai' 
        ? providers.openai!(model)
        : providers.anthropic!(model),
      prompt: `You are an expert world-building assistant specializing in creating rich, detailed, and internally consistent fictional worlds. ${contextualPrompt}
      
Please provide a well-structured, detailed response that would be useful for a writer or game master. Focus on creativity, internal consistency, and practical usability.`,
    });
  } catch (error) {
    console.error('AI streaming error:', error);
    throw error;
  }
}
