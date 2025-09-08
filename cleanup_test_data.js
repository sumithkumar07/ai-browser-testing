#!/usr/bin/env node
/**
 * Cleanup Test Data Script
 * Removes accumulated test data from database to ensure clean state
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

console.log('🧹 KAiro Browser - Database Cleanup');
console.log('===================================');

async function cleanupDatabase() {
    const dbPath = './data/kairo_browser.db';
    
    try {
        console.log('🔍 Checking database...');
        
        if (!fs.existsSync(dbPath)) {
            console.log('✅ No database file found - nothing to clean');
            return;
        }
        
        // Open database
        const db = new Database(dbPath);
        
        // Check current data
        const checkTables = [
            'background_tasks',
            'agent_performance', 
            'bookmarks',
            'history',
            'agent_memory'
        ];
        
        console.log('\n📊 Current data counts:');
        const beforeCounts = {};
        
        for (const table of checkTables) {
            try {
                const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
                beforeCounts[table] = count.count;
                console.log(`   ${table}: ${count.count} records`);
            } catch (error) {
                console.log(`   ${table}: Table doesn't exist`);
                beforeCounts[table] = 0;
            }
        }
        
        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        
        // Remove test background tasks
        const testTasksRemoved = db.prepare(`
            DELETE FROM background_tasks 
            WHERE id LIKE 'task_%' OR payload LIKE '%"test%"%'
        `).run();
        
        // Remove test performance metrics
        const testPerfRemoved = db.prepare(`
            DELETE FROM agent_performance 
            WHERE id LIKE 'perf_%' OR metadata LIKE '%"test%"%'
        `).run();
        
        // Remove test bookmarks
        const testBookmarksRemoved = db.prepare(`
            DELETE FROM bookmarks 
            WHERE id LIKE '%test%' OR title LIKE '%Test%'
        `).run();
        
        // Remove test history
        const testHistoryRemoved = db.prepare(`
            DELETE FROM history 
            WHERE id LIKE '%test%' OR title LIKE '%Test%'
        `).run();
        
        // Remove test agent memory
        const testMemoryRemoved = db.prepare(`
            DELETE FROM agent_memory 
            WHERE id LIKE '%test%' OR metadata LIKE '%"test%"%'
        `).run();
        
        console.log('\n✅ Cleanup completed:');
        console.log(`   background_tasks: ${testTasksRemoved.changes} removed`);
        console.log(`   agent_performance: ${testPerfRemoved.changes} removed`);
        console.log(`   bookmarks: ${testBookmarksRemoved.changes} removed`);
        console.log(`   history: ${testHistoryRemoved.changes} removed`);
        console.log(`   agent_memory: ${testMemoryRemoved.changes} removed`);
        
        // Check final counts
        console.log('\n📊 Final data counts:');
        for (const table of checkTables) {
            try {
                const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
                const cleaned = beforeCounts[table] - count.count;
                console.log(`   ${table}: ${count.count} records (${cleaned} cleaned)`);
            } catch (error) {
                console.log(`   ${table}: Table doesn't exist`);
            }
        }
        
        // Vacuum database to reclaim space
        console.log('\n🗜️  Optimizing database...');
        db.pragma('vacuum');
        
        db.close();
        
        console.log('✅ Database cleanup completed successfully!');
        
    } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
        return false;
    }
    
    return true;
}

// Run cleanup
cleanupDatabase().then(success => {
    if (success) {
        console.log('\n🎉 Database is now clean and optimized!');
        process.exit(0);
    } else {
        console.log('\n⚠️  Cleanup encountered issues.');
        process.exit(1);
    }
}).catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
});