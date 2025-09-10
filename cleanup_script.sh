#!/bin/bash

# Remove test files and documentation
rm -f /app/comprehensive_backend_test.py
rm -f /app/backend_test.py
rm -f /app/enhanced_backend_test.js
rm -f /app/enhanced_backend_test_results.json

# Remove documentation files
rm -f /app/CLEANUP_REPORT.md
rm -f /app/UPGRADE_TO_ADVANCED_SYSTEMS.md
rm -f /app/ENHANCED_BROWSER_NAVIGATION_IMPLEMENTATION.md
rm -f /app/BACKEND_ENHANCEMENT_REPORT.md
rm -f /app/KAIRO_BROWSER_UI_LAYOUT_AND_DEPLOYMENT.md
rm -f /app/INVISIBLE_INTELLIGENCE_ACTIVATION_REPORT.md

# Remove duplicate ErrorBoundary (keep the enhanced one)
rm -f /app/src/core/errors/ErrorBoundary.tsx

echo "Cleanup completed"