import { useMemo, useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Droplets, TrendingUp, AlertCircle, Download, Bell } from 'lucide-react';
import MapView from './MapView';
import { useRealtimeStations } from '../hooks/useRealtimeStations';

const StakeholderDashboard = ({ refreshInterval }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const {
    stations,
    activeStations,
    selectedStationId,
    setSelectedStationId,
    selectedStationDetail,
    chartData,
    loading,
    error,
  } = useRealtimeStations(refreshInterval || 45000);

  const averageLevel = useMemo(() => {
    if (!activeStations.length) return 0;
    const total = activeStations.reduce((sum, station) => sum + (station.currentLevel || 0), 0);
    return total / activeStations.length;
  }, [activeStations]);

  const filteredChart = useMemo(() => {
    if (!chartData.length) return [];
    const days =
      timeRange === '7d'
        ? 7
        : timeRange === '30d'
        ? 30
        : 90;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return chartData.filter((point) => new Date(point.time).getTime() >= cutoff);
  }, [chartData, timeRange]);

  const alerts = useMemo(() => {
    return stations
      .filter((station) => station.status !== 'active')
      .map((station) => ({
        id: station.id,
        type: station.status === 'inactive' ? 'warning' : 'info',
        station: station.name,
        message:
          station.status === 'inactive'
            ? 'Station offline - field team notified'
            : 'Maintenance scheduled - expect limited readings',
        time: station.lastUpdate
          ? new Date(station.lastUpdate).toLocaleString()
          : 'Awaiting update',
      }));
  }, [stations]);

  const exportData = () => {
    if (selectedStationDetail && filteredChart.length > 0) {
      const csvData = [
        'Station,Timestamp,Water Level (m),Temperature (°C)',
        ...filteredChart.map((d) => {
          const temperature = typeof d.temperature === 'number' ? d.temperature.toFixed(2) : 'N/A';
          return `${selectedStationDetail.name},${d.time},${d.level.toFixed(2)},${temperature}`;
        }),
      ].join('\n');
      
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedStationDetail.name}_stakeholder_data.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading stakeholder insights…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Stations</p>
              <p className="text-2xl font-bold text-green-600">{activeStations.length}</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Level</p>
              <p className="text-2xl font-bold text-blue-600">{averageLevel.toFixed(1)}m</p>
            </div>
            <Droplets className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trend</p>
              <p className="text-2xl font-bold text-green-600">+2.3%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alerts</p>
              <p className="text-2xl font-bold text-yellow-600">{alerts.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Station Network</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1 text-xs rounded ${timeRange === '7d' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                7D
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-1 text-xs rounded ${timeRange === '30d' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                30D
              </button>
              <button
                onClick={() => setTimeRange('90d')}
                className={`px-3 py-1 text-xs rounded ${timeRange === '90d' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                90D
              </button>
            </div>
          </div>
          <div className="h-80">
            <MapView
              stations={stations}
              selectedStation={selectedStationId}
              onStationSelect={setSelectedStationId}
            />
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
          </div>
          
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-400'
                      : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <h4 className="font-medium text-gray-900">{alert.station}</h4>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No active alerts across the network.</p>
            )}
          </div>

          <button className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            View All Alerts
          </button>
        </div>
      </div>

      {/* Chart Section */}
      {selectedStationId && selectedStationDetail && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedStationDetail.name} - Water Level Analysis
            </h3>
            <button
              onClick={exportData}
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value) => [`${Number(value).toFixed(2)}m`, 'Water Level']}
                />
                <Area 
                  type="monotone" 
                  dataKey="level" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Station Details */}
      {selectedStationId && selectedStationDetail && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Station Technical Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Station ID</h4>
              <p className="text-lg text-gray-600">{selectedStationDetail.id}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Current Level</h4>
              <p className="text-lg text-blue-600 font-semibold">
                {typeof selectedStationDetail.currentLevel === 'number'
                  ? `${selectedStationDetail.currentLevel.toFixed(2)}m`
                  : 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Well Depth</h4>
              <p className="text-lg text-gray-600">
                {selectedStationDetail.wellDepth ? `${selectedStationDetail.wellDepth}m` : 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Aquifer Type</h4>
              <p className="text-lg text-gray-600">{selectedStationDetail.aquifer}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StakeholderDashboard;