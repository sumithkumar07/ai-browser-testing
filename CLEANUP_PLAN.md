# KAiro Browser - Code Cleanup Plan

## Analysis Summary

### DUPLICATE FILES IDENTIFIED:
1. **Type Definitions** - Multiple duplicate interfaces
   - `/app/src/main/types/electron.ts` 
   - `/app/src/main/types/electron.d.ts`
   - `/app/src/core/types/index.ts` (partially duplicates above)

2. **Service Duplications**
   - AI Service logic duplicated between main.js and dedicated service files

### UNUSED COMPONENTS (Need Verification):
Based on import analysis, these components are not directly imported in main App:
- `History.tsx`
- `PerformanceDashboard.tsx`
- `Bookmarks.tsx`
- `Settings.tsx`
- `Notification.tsx`
- `NewTabPage.tsx`
- `KeyboardShortcuts.tsx`
- `AISpecialTab.tsx` 
- `SystemHealthIndicator.tsx`

**USED COMPONENTS** (Keep):
- `BrowserWindow.tsx` ✅
- `AISidebar.tsx` ✅
- `TabBar.tsx` ✅
- `NavigationBar.tsx` ✅
- `LoadingSpinner.tsx` ✅
- `AITabContent.tsx` ✅ (used by BrowserWindow)

### CLEANUP STRATEGY:

#### Phase 1: Fix Type Duplications (SAFE)
1. Consolidate type definitions into single source
2. Update imports across codebase
3. Remove duplicate files

#### Phase 2: Remove Unused Service Files (CAREFUL)
1. Verify service files are not used
2. Remove redundant service implementations
3. Keep only functional services

#### Phase 3: Remove Unused Components (VERIFY FIRST)
1. Double-check each component is truly unused
2. Look for dynamic imports or conditional usage
3. Remove only confirmed unused components

#### Phase 4: Code Quality Cleanup
1. Remove unused imports
2. Fix TypeScript warnings
3. Remove commented code
4. Optimize build

## SAFETY MEASURES:
- Verify each file deletion with usage analysis
- Test build after each cleanup phase
- Keep backup of removed files list
- Only remove files that are confirmed unused