const Station = require('../models/stationModel');
const { getStationEvaluation } = require('../services/realtimeSimulator');

/**
 * Get evaluation metrics for all stations
 */
const getAllEvaluations = async (req, res) => {
  try {
    const stations = await Station.find();
    const evaluations = stations
      .map(station => {
        const eval = getStationEvaluation(station);
        if (!eval) return null;
        return {
          stationId: station.id,
          stationName: station.name,
          location: station.location,
          ...eval,
        };
      })
      .filter(Boolean);

    res.status(200).json(evaluations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching evaluations', error: error.message });
  }
};

/**
 * Get evaluation for a specific station
 */
const getStationEvaluationById = async (req, res) => {
  try {
    const { stationId } = req.params;
    const station = await Station.findOne({ id: stationId });

    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }

    const evaluation = getStationEvaluation(station);
    if (!evaluation) {
      return res.status(404).json({ message: 'Insufficient data for evaluation' });
    }

    res.status(200).json({
      stationId: station.id,
      stationName: station.name,
      location: station.location,
      ...evaluation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching evaluation', error: error.message });
  }
};

/**
 * Get risk assessment summary
 */
const getRiskAssessment = async (req, res) => {
  try {
    const stations = await Station.find();
    const riskSummary = {
      total: stations.length,
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
      stations: [],
    };

    stations.forEach(station => {
      const eval = getStationEvaluation(station);
      if (eval) {
        riskSummary[eval.riskLevel.toLowerCase()]++;
        if (eval.riskLevel === 'Critical' || eval.riskLevel === 'High') {
          riskSummary.stations.push({
            id: station.id,
            name: station.name,
            riskLevel: eval.riskLevel,
            riskScore: eval.riskScore,
            currentLevel: eval.currentLevel,
            location: station.location,
          });
        }
      }
    });

    res.status(200).json(riskSummary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching risk assessment', error: error.message });
  }
};

module.exports = {
  getAllEvaluations,
  getStationEvaluationById,
  getRiskAssessment,
};

