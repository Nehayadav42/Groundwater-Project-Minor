export const mockStations = [
  {
    id: 'DWLR_001',
    name: 'Shyamla Hills Station, Bhopal',
    latitude: 23.2599,
    longitude: 77.4126,
    status: 'normal',
    currentLevel: 15.7,
    lastUpdate: '2025-09-21T06:00:00Z',
    wellDepth: 55,
    aquifer: 'Alluvial'
  },
  {
    id: 'DWLR_002',
    name: 'Rajwada Palace Station, Indore',
    latitude: 22.7196,
    longitude: 75.8577,
    status: 'warning',
    currentLevel: 11.8,
    lastUpdate: '2025-09-21T06:00:00Z',
    wellDepth: 48,
    aquifer: 'Basalt'
  },
  {
    id: 'DWLR_003',
    name: 'Sitabuldi Fort Station, Nagpur',
    latitude: 21.1458,
    longitude: 79.0882,
    status: 'normal',
    currentLevel: 20.7,
    lastUpdate: '2025-09-21T06:00:00Z',
    wellDepth: 60,
    aquifer: 'Granite'
  },
  {
    id: 'DWLR_004',
    name: 'Amer Fort Station, Jaipur',
    latitude: 26.9221,
    longitude: 75.7789,
    status: 'alert',
    currentLevel: 7.6,
    lastUpdate: '2025-09-21T06:00:00Z',
    wellDepth: 42,
    aquifer: 'Sandstone'
  },
  {
    id: 'DWLR_005',
    name: 'Marina Beach Station, Chennai',
    latitude: 13.0674,
    longitude: 80.2825,
    status: 'normal',
    currentLevel: 18.6,
    lastUpdate: '2025-09-21T06:00:00Z',
    wellDepth: 58,
    aquifer: 'Coastal Alluvium'
  }
];

export const generateChartData = (stationId, days = 7) => {
  const data = [];
  const now = new Date();
  const baseLevel = mockStations.find((s) => s.id === stationId)?.currentLevel || 20;
  
  for (let i = days * 24; i >= 0; i -= 1) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const variation = Math.sin(i / 12) * 2 + Math.random() * 1.5 - 0.75;
    
    data.push({
      time: timestamp.toISOString(),
      level: Math.max(0, baseLevel + variation),
      temperature: 25 + Math.sin(i / 24) * 4 + Math.random() * 1.5 - 0.75
    });
  }
  
  return data;
};

export const mockReadings = mockStations.flatMap((station) =>
  generateChartData(station.id, 1).map((dataPoint) => ({
    stationId: station.id,
    timestamp: dataPoint.time,
    level: dataPoint.level,
    temperature: dataPoint.temperature
  }))
);