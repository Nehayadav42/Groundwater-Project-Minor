const express = require('express');
const router = express.Router();
const {
  getAllEvaluations,
  getStationEvaluationById,
  getRiskAssessment,
} = require('../controllers/evaluationController');

router.get('/', getAllEvaluations);
router.get('/risk', getRiskAssessment);
router.get('/:stationId', getStationEvaluationById);

module.exports = router;

