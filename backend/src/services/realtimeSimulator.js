const Station = require('../models/stationModel');

/**
 * Real-time Groundwater Data Simulator
 * Simulates realistic groundwater level fluctuations using static data patterns
 */

// Base patterns for different aquifer types
const aquiferPatterns = {
  Alluvial: { base: 15, variance: 3, trend: 0.01 },
  Basalt: { base: 12, variance: 2.5, trend: -0.02 },
  Granite: { base: 20, variance: 4, trend: 0.005 },
  Sandstone: { base: 8, variance: 1.5, trend: -0.03 },
  'Coastal Alluvium': { base: 18, variance: 2, trend: 0.015 },
};

// Seasonal factors (simulating monsoon/pre-monsoon/post-monsoon)
const getSeasonalFactor = () => {
  const month = new Date().getMonth();
  // Monsoon: June-Sept (higher levels), Pre-monsoon: Mar-May (lower), Post-monsoon: Oct-Feb (moderate)
  if (month >= 5 && month <= 8) return 1.1; // Monsoon
  if (month >= 2 && month <= 4) return 0.9; // Pre-monsoon
  return 1.0; // Post-monsoon
};

// Generate realistic water level with natural variation
const generateWaterLevel = (station, baseLevel, timestamp) => {
  const pattern = aquiferPatterns[station.aquifer] || aquiferPatterns.Alluvial;
  const hours = new Date(timestamp).getHours();
  const dayOfYear = Math.floor((new Date(timestamp) - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  
  // Diurnal variation (slight changes during day/night)
  const diurnal = Math.sin((hours / 24) * Math.PI * 2) * 0.1;
  
  // Seasonal variation
  const seasonal = getSeasonalFactor();
  
  // Random natural fluctuation
  const random = (Math.random() - 0.5) * pattern.variance;
  
  // Long-term trend
  const trend = pattern.trend * dayOfYear;
  
  // Calculate new level
  const newLevel = baseLevel + diurnal + (random * seasonal) + trend;
  
  // Ensure level is within reasonable bounds (0 to wellDepth)
  return Math.max(0.5, Math.min(station.wellDepth - 2, newLevel));
};

/**
 * Simulate real-time data update for all stations
 */
const simulateRealtimeUpdate = async () => {
  try {
    const stations = await Station.find();
    const now = new Date();
    const operations = [];

    for (const station of stations) {
      // Get latest reading or use base level
      const latestReading = station.time_series && station.time_series.length > 0
        ? station.time_series[station.time_series.length - 1]
        : null;
      
      const baseLevel = latestReading?.water_level || 
        (aquiferPatterns[station.aquifer]?.base || 15);
      
      // Generate new reading
      const newLevel = generateWaterLevel(station, baseLevel, now);
      
      // Determine status based on level
      let status = 'Normal';
      const depthRatio = newLevel / (station.wellDepth || 50);
      if (depthRatio < 0.2) {
        status = 'Alert'; // Very low water level
      } else if (depthRatio < 0.4) {
        status = 'Warning'; // Low water level
      }
      
      // Add new time series entry
      const newReading = {
        date: now.toISOString().split('T')[0],
        water_level: parseFloat(newLevel.toFixed(2)),
        timestamp: now.toISOString(),
      };
      
      // Keep only last 30 days of data
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const filteredSeries = (station.time_series || []).filter(entry => {
        const entryDate = new Date(entry.date || entry.timestamp);
        return entryDate >= thirtyDaysAgo;
      });
      
      filteredSeries.push(newReading);
      
      operations.push({
        updateOne: {
          filter: { id: station.id },
          update: {
            $set: {
              status,
              time_series: filteredSeries,
              updatedAt: now,
            },
          },
        },
      });
    }

    if (operations.length > 0) {
      await Station.bulkWrite(operations);
      console.log(`✓ Real-time simulation: Updated ${operations.length} stations at ${now.toISOString()}`);
    }
  } catch (error) {
    console.error('Error in real-time simulation:', error.message);
  }
};

/**
 * Get evaluation metrics for a station
 */
const getStationEvaluation = (station) => {
  if (!station.time_series || station.time_series.length < 2) {
    return null;
  }

  const readings = station.time_series
    .map(r => ({ date: new Date(r.date || r.timestamp), level: r.water_level }))
    .sort((a, b) => a.date - b.date);

  const recent = readings.slice(-7); // Last 7 days
  const older = readings.slice(-14, -7); // Previous 7 days

  const recentAvg = recent.reduce((sum, r) => sum + r.level, 0) / recent.length;
  const olderAvg = older.length > 0 
    ? older.reduce((sum, r) => sum + r.level, 0) / older.length 
    : recentAvg;

  const trend = recentAvg - olderAvg;
  const trendPercent = olderAvg > 0 ? ((trend / olderAvg) * 100).toFixed(2) : 0;

  // Risk assessment
  const currentLevel = recent[recent.length - 1]?.level || 0;
  const depthRatio = currentLevel / (station.wellDepth || 50);
  let riskLevel = 'Low';
  let riskScore = 0;

  if (depthRatio < 0.2) {
    riskLevel = 'Critical';
    riskScore = 90;
  } else if (depthRatio < 0.4) {
    riskLevel = 'High';
    riskScore = 70;
  } else if (depthRatio < 0.6) {
    riskLevel = 'Moderate';
    riskScore = 40;
  } else {
    riskLevel = 'Low';
    riskScore = 10;
  }

  // Add trend-based risk adjustment
  if (trend < -0.5) riskScore += 15; // Declining trend
  if (trend > 0.5) riskScore -= 10; // Improving trend

  riskScore = Math.max(0, Math.min(100, riskScore));

  return {
    currentLevel: parseFloat(currentLevel.toFixed(2)),
    averageLevel: parseFloat(recentAvg.toFixed(2)),
    trend: parseFloat(trend.toFixed(2)),
    trendPercent: parseFloat(trendPercent),
    trendDirection: trend > 0.1 ? 'Rising' : trend < -0.1 ? 'Declining' : 'Stable',
    riskLevel,
    riskScore,
    depthRatio: parseFloat((depthRatio * 100).toFixed(1)),
    wellDepth: station.wellDepth,
    aquifer: station.aquifer,
    lastUpdate: recent[recent.length - 1]?.date || new Date(),
  };
};

module.exports = {
  simulateRealtimeUpdate,
  getStationEvaluation,
};

