const express = require('express');
const router = express.Router();
const {
    seedDatabase,
    getAllStations,
    getStationById
} = require('../controllers/stationController');

router.get('/', getAllStations);
router.get('/:stationId', getStationById);

module.exports = router;