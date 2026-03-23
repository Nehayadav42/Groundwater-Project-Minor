const cron = require('node-cron');
const { syncAllDataSources } = require('../services/dataSyncService');
const { simulateRealtimeUpdate } = require('../services/realtimeSimulator');

const startScheduler = () => {
    console.log('✓ Scheduler started. Real-time simulation and data sync enabled.');
    
    // Real-time simulation: Update every 15 minutes (simulating actual sensor readings)
    cron.schedule('*/15 * * * *', () => {
        console.log('--- Running real-time groundwater simulation ---');
        simulateRealtimeUpdate();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
    
    // Daily data sync from external sources: 2 AM IST
    cron.schedule('0 2 * * *', () => {
        console.log('--- Triggering scheduled data sync for all sources ---');
        syncAllDataSources();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
    
    // Initial simulation run
    setTimeout(() => {
        console.log('--- Running initial real-time simulation ---');
        simulateRealtimeUpdate();
    }, 5000);
};

module.exports = { startScheduler };