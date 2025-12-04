const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { startScheduler } = require('./src/config/scheduler');
const stationRoutes = require('./src/routes/stationRoutes');
const userRoutes = require('./src/routes/userRoutes');
const evaluationRoutes = require('./src/routes/evaluationRoutes');
const { syncAllDataSources } = require('./src/services/dataSyncService');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/stations', stationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/evaluations', evaluationRoutes);

// Welcome Route
app.get('/', (req, res) => {
    res.send('Groundwater Project API is running...');
});

// --- Temporary Test Routes ---
app.get('/api/sync-now', (req, res) => {
    syncAllDataSources();
    res.send("Manual data sync for ALL sources triggered! Check the console.");
});

app.get('/api/simulate-now', async (req, res) => {
    const { simulateRealtimeUpdate } = require('./src/services/realtimeSimulator');
    await simulateRealtimeUpdate();
    res.send("Real-time simulation triggered! Check the console.");
});
// --------------------------

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    startScheduler();
});