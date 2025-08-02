# World Builder

A powerful world-building application built with React, Vite, TypeScript, and Mantine.

## 🚀 Features

- **Modern Stack**: React 18 + TypeScript + Vite for fast development
- **Component Library**: Mantine v7 with comprehensive UI components
- **Rich Text Editor**: Integrated Mantine Tiptap editor for content creation
- **AI Integration**: AI SDK with support for OpenAI and Anthropic
- **Responsive Design**: Mobile-first design with Mantine's responsive system
- **TypeScript**: Full TypeScript support for better development experience

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Mantine v7
- **Rich Text**: Mantine Tiptap integration
- **AI**: Vercel AI SDK
- **Icons**: Tabler Icons React

## 🏁 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables** (optional, for AI features):
   ```bash
   cp .env.example .env
   # Add your API keys to .env
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🔧 Configuration

### AI Integration

To use the AI features, you'll need to add API keys to your `.env` file:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Mantine Theme

The app uses Mantine's default theme. You can customize it in `src/main.tsx` by passing a theme object to the `MantineProvider`.

## 📁 Project Structure

```
src/
├── components/     # Reusable components
├── utils/         # Utility functions (including AI helpers)
├── App.tsx        # Main application component
└── main.tsx       # Application entry point
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Useful Links

- [Mantine Documentation](https://mantine.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [AI SDK Documentation](https://sdk.vercel.ai/)
- [React Documentation](https://react.dev/)
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
