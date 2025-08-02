<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Copilot Instructions for World Builder

This is an AI-powered world building text editor built with React, Vite, TypeScript, and Mantine.

## Technology Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Component Library**: Mantine v8
- **Rich Text Editor**: Mantine Tiptap integration
- **AI Integration**: AI SDK with OpenAI and Anthropic providers
- **Icons**: Tabler Icons React
- **Data Persistence**: Local Storage

## Application Features
- **World Element Management**: Create, edit, delete, and organize different types of world building elements
- **AI-Powered Content Generation**: Generate detailed content for characters, places, events, lore, plots, etc.
- **Rich Text Editing**: Full-featured rich text editor for detailed content creation
- **Categorization**: Organize elements by type (character, place, event, lore, plot, item, organization, etc.)
- **Search & Filter**: Find elements by title, content, or tags
- **Auto-save**: Automatic data persistence to browser local storage

## World Element Types
- Characters: People, creatures, beings in your world
- Places: Locations, cities, landmarks, realms
- Events: Historical events, plot points, incidents
- Lore: Myths, legends, foundational stories
- Plots: Story arcs, narratives, campaigns
- Items: Artifacts, weapons, magical objects
- Organizations: Factions, guilds, governments
- Cultures: Societies, peoples, civilizations
- Religions: Belief systems, deities, faiths
- Magic Systems: How magic works in your world
- Languages: Constructed languages, dialects
- Timelines: Historical progressions, chronologies

## Code Style Guidelines
- Use TypeScript for all components and utilities
- Follow React functional components with hooks
- Use Mantine components and styling system
- Implement responsive design patterns
- Use proper TypeScript types and interfaces
- Follow React best practices for state management

## AI Integration
- The app uses Vercel's AI SDK for content generation
- Supports both OpenAI and Anthropic providers
- Pre-defined prompt templates for different world building elements
- Context-aware generation using existing world elements
- Environment variables: VITE_OPENAI_API_KEY, VITE_ANTHROPIC_API_KEY

## Key Components
- `App.tsx`: Main application with element management using Mantine's modal manager
- `WorldElementCard.tsx`: Display card for world elements
- `WorldElementEditorContent.tsx`: Rich text editor content for modal manager
- `AIPromptDialogContent.tsx`: AI-powered content generation interface for modal manager
- `utils/ai.ts`: AI integration utilities and prompt templates
- `utils/storage.ts`: Local storage persistence helpers

## Modal Management
- Uses Mantine's `ModalsProvider` and `modals` manager for better UX
- Modal content components are separate from modal wrappers
- Centralized modal management with proper cleanup and state handling
