const cron = require('node-cron');
const { syncAllDataSources } = require('../services/dataSyncService'); // <-- Updated import

const startScheduler = () => {
    console.log(' Scheduler started. All data sources will sync automatically.');
    
    cron.schedule('0 2 * * *', () => {
        console.log('--- Triggering scheduled data sync for all sources ---');
        syncAllDataSources(); // <-- Updated function call
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
};

module.exports = { startScheduler };