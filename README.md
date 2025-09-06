<<<<<<< HEAD
# KAiro Browser - Agentic AI Browser

## 🚀 Overview

KAiro Browser is a revolutionary desktop browser that uses AI agents to understand user intent and execute complex tasks automatically, making web browsing intelligent and efficient.

## ✨ Features

### 🧠 Core AI Capabilities
- **Intelligent Intent Recognition**: Parse complex user commands
- **AI Agent System**: Multiple specialized agents for different tasks
- **Multi-step Task Execution**: Complex task automation
- **Context Awareness**: Remember conversation history and user preferences

### 🤖 AI Agents
- **YouTube Entertainment Agent**: Video search, playlist creation, recommendations
- **Shopping Agent**: Product research, price comparison, cart management
- **Research Agent**: Information gathering, summarization, fact-checking
- **Navigation Agent**: Smart URL handling, bookmark management
- **Content Analysis Agent**: Text extraction, summarization, key points
- **Communication Agent**: Email composition, social media interaction

### 🛒 Shopping Capabilities
- Product research and analysis
- Price comparison across multiple sites
- Shopping cart management
- Price tracking and alerts
- Product recommendations

### 🔬 Research Tools
- Intelligent search and analysis
- Content summarization
- Key point extraction
- Research session management
- Report generation

### 🤝 Collaboration Features
- Real-time chat with AI assistance
- Content sharing and analysis
- Session management
- Export capabilities

### ⌨️ Advanced Features
- Customizable keyboard shortcuts
- Extension management
- Notification system
- Comprehensive settings

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Groq API key

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment template:
   ```bash
   cp env.example .env
   ```
4. Add your Groq API key to `.env`
5. Build the React frontend:
   ```bash
   npm run build:react
   ```
6. Start the application:
   ```bash
   npx electron .
   ```

## 🔧 Development

### Project Structure
```
fellow.ai/
├── electron/                 # Electron Main Process
│   ├── main/                # Main process files
│   ├── preload/             # Preload scripts
│   └── services/            # Electron services
├── src/main/                # React Frontend
│   ├── components/          # UI Components
│   ├── services/            # Business Logic
│   ├── hooks/               # React Hooks
│   ├── stores/              # State Management
│   └── styles/              # Styling
└── public/                  # Static Assets
```

### Available Scripts
- `npm run build:react` - Build React frontend
- `npm run dev` - Start development server
- `npm run electron` - Start Electron app
- `npm test` - Run tests
- `npm run lint` - Run linter

### Environment Variables
- `GROQ_API_KEY` - Your Groq API key
- `APP_NAME` - Application name
- `APP_VERSION` - Application version
- `DEBUG_MODE` - Enable debug logging

## 🎯 Usage

### Basic Navigation
- Use the address bar to navigate to websites
- Create new tabs with Ctrl+T
- Switch between tabs with Ctrl+Tab
- Close tabs with Ctrl+W

### AI Assistant
- Click the AI button to open the assistant sidebar
- Ask questions in natural language
- Use voice commands for hands-free operation
- Get contextual help based on the current page

### Shopping Assistant
- Navigate to product pages
- Use Ctrl+Shift+C to compare products
- Track prices with Ctrl+Shift+P
- Add items to cart with Ctrl+Shift+A

### Research Tools
- Start research sessions with Ctrl+Shift+R
- Export research with Ctrl+Shift+X
- Generate reports from findings
- Save and organize research sessions

## 🔒 Security

- All AI communications are encrypted
- No personal data is stored without permission
- Secure IPC communication between processes
- Sandboxed renderer processes

## 🐛 Troubleshooting

### Common Issues
1. **App won't start**: Check Node.js version and dependencies
2. **AI not responding**: Verify Groq API key in `.env`
3. **BrowserView not loading**: Check Electron version compatibility
4. **Extensions not working**: Verify extension manifest format

### Debug Mode
Enable debug mode by setting `DEBUG_MODE=true` in `.env` for detailed logging.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

## 🔄 Updates

The application automatically checks for updates and notifies users when new versions are available.

---

**Built with ❤️ using Electron, React, and Groq AI**
=======
# ai-browser-testing
>>>>>>> origin/main
