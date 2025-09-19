# 🌍 World Builder

An AI-powered world-building application designed for writers, game masters, and creative storytellers. Build rich, interconnected fictional worlds with intelligent AI assistance and intuitive organization tools.

## ✨ What is World Builder?

World Builder is a comprehensive tool for creating and managing fictional worlds. Whether you're writing a novel, designing a tabletop RPG campaign, or building a game world, this application helps you organize and develop every aspect of your creative universe.

### Key Capabilities

- **🤖 AI-Powered Content Generation**: Generate detailed descriptions for any world element using OpenAI or Anthropic AI
- **📂 Organized Categories**: 60+ element types across 10 intuitive categories
- **💾 File System Storage**: Save and load projects from a local file system
- **🔍 Advanced Search & Filtering**: Find any element quickly with powerful search tools
- **📝 Rich Text Editing**: Create detailed descriptions with formatting support
- **🏷️ Tagging System**: Organize elements with custom tags for easy categorization

## 🗂️ World Element Categories

- **🌍 Geography & Setting**: Landscapes, climates, maps, nations, cities, landmarks
- **🧑‍🤝‍🧑 Cultures & Societies**: Races, species, social structures, languages, traditions
- **🏛 Politics & Power**: Governments, rulers, factions, organizations, laws
- **📜 History & Mythology**: Historical events, legends, myths, heroes, prophecies
- **🧙 Magic or Technology**: Power systems, magic rules, technology, artifacts
- **🐉 Creatures & Beings**: Intelligent species, creatures, monsters, entities
- **🔮 Religion & Philosophy**: Belief systems, deities, spiritual forces, institutions
- **⚔️ Conflict & Warfare**: Wars, conflicts, military forces, strategies, threats
- **👥 Characters & Roles**: Characters, NPCs, important figures, relationships
- **📦 Economy & Resources**: Trade systems, currencies, resources, industries

## 🚀 Features

- **AI-Powered Generation**: Create rich, detailed content with specialized AI prompts for each element type
- **Modern Web Technologies**: Built with React 19, TypeScript, and Vite for optimal performance
- **Intuitive Interface**: Clean, responsive design using Mantine UI components
- **Project Management**: Create, save, and load multiple world-building projects
- **Cross-Platform**: Works in any modern web browser with file system support
- **Offline Capable**: Core functionality works without internet (AI features require connection)

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI Library**: Mantine v8.2.2 with comprehensive component suite
- **Rich Text**: Mantine's Tiptap editor integration
- **AI Integration**: Vercel AI SDK with OpenAI and Anthropic support
- **Icons**: Tabler Icons React
- **Payments**: Stripe (Checkout Sessions, subscription plans)
- **Auth & Data**: Firebase (Authentication, Firestore, Storage)
- **Storage**: Modern File System Access API with localStorage fallback

## 🔐 Firebase & Stripe Integration

The application integrates Firebase for authentication and user profile storage, and Stripe for subscription billing. A Firestore `users` collection stores user profile data alongside a `stripeCustomerId` once created.

### Environment Variables

Add these Firebase keys (client‑side) to your `.env` (Vite will expose variables prefixed with `VITE_`). Never commit real secret values.

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=###########
VITE_FIREBASE_APP_ID=1:###########:web:############
```

Stripe variables (server & client):

```env
STRIPE_SECRET_KEY=sk_live_xxx_or_test_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx_or_test_key
VITE_API_BASE_URL=http://localhost:3000   # or your deployed base
```

### Firestore Security Rules (Suggested Baseline)

```bash
// Firestore rules example (add via Firebase console)
rules_version = '2';
service cloud.firestore {
   match /databases/{database}/documents {
      match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
      }
   }
}
```

### Stripe Customer Creation Flow

1. User signs up / logs in via Firebase Auth.  
2. When the account page loads, the app lazily calls `/api/create-stripe-customer` with the Firebase UID in an Authorization header.  
3. The serverless function checks Firestore for an existing `stripeCustomerId`; if missing it creates one via Stripe and updates the Firestore `users/{uid}` document.  
4. Checkout buttons pass the `stripeCustomerId` so subscription checkout sessions are associated correctly.

### Adding Additional Subscription Logic

Implement in the existing `api/webhook.ts` handler:

- `checkout.session.completed` → set `subscriptionId` & `subscriptionStatus` on user
- `customer.subscription.updated` → sync plan changes & status
- `customer.subscription.deleted` → downgrade plan and clear entitlements

### Firebase Storage (Future Use)

You can migrate large world assets (maps, images) to Firebase Storage. Store metadata (download URLs) on the world elements referencing those assets.

### Local Development Checklist

1. Create Firebase project & enable Email/Password auth.  
2. Create Firestore database (production mode).  
3. Add environment variables in `.env`.  
4. Run `npm install` (ensures `firebase` is installed).  
5. Start dev server: `npm run dev`.  
6. Sign up via Account page and verify Firestore `users` document.  
7. Trigger plan upgrade to confirm Stripe customer + Checkout session creation.  

### Production Hardening TODOs

- Verify Firebase ID token server-side (instead of trusting raw UID in header).  
- Move Stripe secret interactions to secure serverless functions only.  
- Add retry + idempotency keys to Stripe operations.  
- Implement webhook logic to keep Firestore in sync.  
- Add email verification & password reset flows.  
- Add robust usage metering tied to subscription entitlements.  
- Enforce Firestore security rules for any future collections.  
- Consider multi-tenant support (e.g., team worlds) with role-based access.

## 🏁 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)
- API keys for AI functionality (optional but recommended)

### Installation

1. **Clone and install**:

   ```bash
   git clone https://github.com/YOUR_USERNAME/world-builder.git
   cd world-builder
   npm install
   ```

2. **Set up environment variables** (for AI features):

   ```bash
   cp .env.example .env
   ```

3. **Add your API keys to `.env`**:

   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

4. **Start the development server**:

   ```bash
   npm run dev
   ```

5. **Open your browser** to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## � AI Setup Instructions

### Getting an OpenAI API Key

1. Visit [OpenAI's Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to the [API Keys page](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy the key and add it to your `.env` file as `VITE_OPENAI_API_KEY`

**Recommended Models**: GPT-4, GPT-4 Turbo, or GPT-3.5 Turbo

### Getting an Anthropic API Key

1. Visit [Anthropic's Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Go to the [API Keys section](https://console.anthropic.com/settings/keys)
4. Click "Create Key"
5. Copy the key and add it to your `.env` file as `VITE_ANTHROPIC_API_KEY`

**Recommended Models**: Claude 3.5 Sonnet, Claude 3 Opus, or Claude 3 Haiku

### Cost Considerations

- Both services charge per token (input + output)
- OpenAI: ~$0.01-0.06 per 1K tokens depending on model
- Anthropic: ~$0.25-15.00 per 1M tokens depending on model
- Set usage limits in your provider dashboard to control costs

## 📖 How to Use

### Creating Your First World

1. **Start the application** and you'll see a default "Untitled Project"
2. **Click "Create New"** or use the AI Generate button
3. **Choose an element type** from the dropdown (e.g., "Nation" for a country)
4. **Fill in details** or click "AI Assist" for generated content
5. **Save** and continue building your world

### Using AI Generation

1. **Click "AI Generate"** from any screen
2. **Select the type** of element you want to create
3. **Provide context** (optional) - the AI will consider your existing elements
4. **Generate** and review the AI-created content
5. **Edit** as needed and save to your project

### Project Management

- **Save Projects**: Use the file manager to save your world as a JSON file
- **Load Projects**: Open previously saved world files
- **Export**: Projects are saved as standard JSON files you can backup or share

### Tips for Best Results

- **Use tags** to connect related elements
- **Provide context** when using AI generation
- **Start broad** (geography, cultures) then add specific details
- **Reference existing elements** when creating new ones for consistency

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── AIPromptDialog*   # AI generation interfaces
│   ├── FileManager.tsx   # Project save/load functionality
│   ├── WorldElement*     # Element creation and editing
│   └── ...
├── types/
│   └── index.ts         # TypeScript type definitions
├── utils/
│   ├── ai.ts           # AI integration and prompt templates
│   ├── elementTypes.ts # World element definitions
│   ├── storage.ts      # File system storage utilities
│   └── ...
├── App.tsx             # Main application component
└── main.tsx           # Application entry point
```

## 🎯 Use Cases

### For Writers

- **Novel Building**: Create detailed worlds for fantasy, sci-fi, or historical fiction
- **Character Development**: Build complex characters and their relationships
- **Plot Planning**: Organize events, conflicts, and story arcs

### For Game Masters

- **RPG Campaigns**: Design comprehensive campaign settings
- **NPC Management**: Create memorable non-player characters
- **World Consistency**: Keep track of rules, history, and geography

### For Game Developers

- **Game Worlds**: Plan and document game environments
- **Lore Creation**: Develop rich backstories and mythologies
- **Asset Planning**: Organize creatures, items, and locations

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run linting
npm run lint

# Run type checking
npm run type-check

# Build for production
npm run build
```

## 🐛 Troubleshooting

### Common Issues

**AI features not working?**

- Verify your API keys are correctly set in `.env`
- Check your API provider dashboard for usage limits
- Ensure you have internet connectivity

**File save/load not working?**

- Use a modern browser (Chrome 86+, Firefox 111+, Safari 15.2+)
- Enable file system access if prompted
- Check browser security settings

**Development server issues?**

- Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Update Node.js to version 18 or higher
- Check port 5173 isn't in use by another application

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Resources

- **Documentation**: [Mantine UI](https://mantine.dev/) | [Vite](https://vitejs.dev/) | [AI SDK](https://sdk.vercel.ai/)
- **AI Providers**: [OpenAI Platform](https://platform.openai.com/) | [Anthropic Console](https://console.anthropic.com/)
- **Icons**: [Tabler Icons](https://tabler-icons.io/)
- **React**: [React Documentation](https://react.dev/)

## 🌟 Acknowledgments

Built with modern web technologies and inspired by the needs of creative storytellers everywhere. Special thanks to the open-source community for the amazing tools that make this project possible.
