const express = require('express');
const router = express.Router();
const {
    seedDatabase,
    getAllStations,
    getStationById
} = require('../controllers/stationController');

// Seed route for development/demo to load mock stations
router.get('/seed', seedDatabase);

router.get('/', getAllStations);
router.get('/:stationId', getStationById);

module.exports = router;