# 📁 Project Structure Overview

## 🎯 **CLEAN & ORGANIZED STRUCTURE**

### **Current State:**
```
fellow.ai/
├── package.json          ✅ (exists)
├── BUILD_PLAN.md         ✅ (complete plan with rules)
└── PROJECT_STRUCTURE.md  ✅ (this file)
```

### **Target Structure (Clean & Organized):**
```
fellow.ai/
├── 📁 src/
│   └── 📁 main/
│       ├── 📁 components/           # UI Components
│       │   ├── 📁 browser/         # Browser-specific components
│       │   │   ├── BrowserWindow.tsx
│       │   │   ├── BrowserWindow.css
│       │   │   ├── TabBar.tsx
│       │   │   ├── TabBar.css
│       │   │   ├── NavigationBar.tsx
│       │   │   ├── NavigationBar.css
│       │   │   ├── NewTabPage.tsx
│       │   │   └── NewTabPage.css
│       │   └── 📁 ai/              # AI-specific components
│       │       ├── AISidebar.tsx
│       │       ├── AISidebar.css
│       │       ├── AIWelcome.tsx
│       │       └── AIWelcome.css
│       ├── 📁 hooks/               # Custom React Hooks
│       │   ├── useBrowser.ts       # Browser state & actions
│       │   ├── useAI.ts            # AI state & actions
│       │   └── useEnvironment.ts  # Environment detection
│       ├── 📁 stores/              # Zustand State Management
│       │   ├── browserStore.ts     # Browser state (tabs, navigation)
│       │   ├── aiStore.ts          # AI state (messages, responses)
│       │   └── uiStore.ts          # UI state (sidebar, theme)
│       ├── 📁 services/            # External Services
│       │   ├── AIService.ts        # Groq API integration
│       │   └── BrowserService.ts   # Browser engine logic
│       ├── 📁 types/               # TypeScript Type Definitions
│       │   ├── electron.d.ts       # Electron types
│       │   ├── browser.d.ts        # Browser types
│       │   └── ai.d.ts             # AI types
│       ├── 📁 utils/               # Utility Functions
│       │   ├── urlUtils.ts         # URL validation & formatting
│       │   ├── environmentUtils.ts # Environment detection
│       │   └── errorUtils.ts       # Error handling
│       ├── App.tsx                 # Main React app
│       ├── App.css                 # Main styles
│       ├── index.tsx               # Entry point
│       └── index.css               # Global styles
├── 📁 electron/                    # Electron Backend
│   ├── 📁 main/                   # Main Process
│   │   ├── main.js                # Electron main process
│   │   ├── browserManager.js      # BrowserView management
│   │   └── ipcHandlers.js         # IPC communication handlers
│   └── 📁 preload/               # Preload Scripts
│       └── preload.js            # Secure IPC bridge
├── 📁 public/                     # Static Assets
│   └── 📁 icons/
│       └── icon.svg              # App icon
├── 📁 config/                     # Configuration Files
│   ├── vite.config.ts            # Vite configuration
│   ├── tsconfig.json             # TypeScript config
│   └── tsconfig.node.json        # Node TypeScript config
├── package.json                   # Dependencies & scripts
├── package-lock.json              # Lock file
├── BUILD_PLAN.md                  # Complete build plan
└── PROJECT_STRUCTURE.md           # This file
```

## 📋 **FILE ORGANIZATION PRINCIPLES**

### **🎯 Feature-Based Organization:**
- **Browser components** → `components/browser/`
- **AI components** → `components/ai/`
- **Browser logic** → `hooks/useBrowser.ts`
- **AI logic** → `hooks/useAI.ts`

### **🔧 Separation of Concerns:**
- **UI Components** → `components/`
- **Business Logic** → `hooks/` + `services/`
- **State Management** → `stores/`
- **Type Definitions** → `types/`
- **Utilities** → `utils/`

### **📁 Clear Folder Hierarchy:**
```
src/main/
├── components/     # UI only
├── hooks/         # Logic only
├── stores/        # State only
├── services/      # External APIs
├── types/         # Type definitions
└── utils/         # Helper functions
```

## 🔍 **ROOT CAUSE ANALYSIS STRUCTURE**

### **When Issues Occur - Check This Order:**
1. **UI Issue** → Check `components/` folder
2. **Logic Issue** → Check `hooks/` folder
3. **State Issue** → Check `stores/` folder
4. **API Issue** → Check `services/` folder
5. **Type Issue** → Check `types/` folder
6. **Electron Issue** → Check `electron/` folder

### **Data Flow Tracking:**
```
User Action → components/ → hooks/ → stores/ → services/ → electron/
```

## ✅ **BENEFITS OF THIS STRUCTURE**

### **🔍 Easy Root Cause Analysis:**
- **Clear file locations** for each feature
- **Logical grouping** by functionality
- **Easy to trace** data flow
- **Quick to identify** problem areas

### **🧹 Clean Code Organization:**
- **No scattered files**
- **Consistent naming**
- **Clear responsibilities**
- **Easy to maintain**

### **🚀 Fast Development:**
- **Know exactly where** to add new features
- **Find existing code** quickly
- **Avoid duplicates** easily
- **Test components** independently

## 🎯 **READY TO BUILD!**

**This structure will make it easy to:**
- ✅ Find root causes quickly
- ✅ Fix issues completely
- ✅ Add new features easily
- ✅ Maintain clean code
- ✅ Test components independently

**Next:** Phase 1 - Foundation Setup with this clean structure!
