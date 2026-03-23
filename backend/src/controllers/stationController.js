const Station = require('../models/stationModel');
const mockData = require('../../mockData.json');

// @desc    Seed the database with mock data
// @route   GET /api/stations/seed
const seedDatabase = async (req, res) => {
    try {
        await Station.deleteMany({});
        await Station.insertMany(mockData);
        res.status(200).json({ message: 'Database successfully seeded!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error seeding database', error: error.message });
    }
};

// @desc    Get all stations for map markers (lightweight)
// @route   GET /api/stations
const getAllStations = async (req, res) => {
    try {
        const stations = await Station.find().lean();
        const formatted = stations.map((station) => {
            const latestReading = Array.isArray(station.time_series) && station.time_series.length
                ? station.time_series[station.time_series.length - 1]
                : null;

            return {
                id: station.id,
                name: station.name,
                location: station.location,
                status: station.status,
                latestReading,
                currentLevel: latestReading?.water_level ?? null,
                lastUpdate: latestReading?.date ?? station.updatedAt,
                wellDepth: station.wellDepth ?? null,
                aquifer: station.aquifer ?? 'Unknown',
            };
        });

        res.status(200).json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching stations', error: error.message });
    }
};

// @desc    Get a single station by its ID (full data)
// @route   GET /api/stations/:stationId
const getStationById = async (req, res) => {
    try {
        const { stationId } = req.params;
        const station = await Station.findOne({ id: stationId });

        if (!station) {
            return res.status(404).json({ message: 'Station not found' });
        }
        res.status(200).json(station);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching station data', error: error.message });
    }
};

module.exports = {
    seedDatabase,
    getAllStations,
    getStationById
};