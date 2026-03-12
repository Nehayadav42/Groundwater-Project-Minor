import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Info, AlertCircle } from 'lucide-react';
import MapView from './MapView';
import StationList from './StationList';
import EvaluationPanel from './EvaluationPanel';
import LastUpdateSection from './LastUpdateSection';
import LiveDataSection from './LiveDataSection';
import { useRealtimeStations } from '../hooks/useRealtimeStations';
import { formatISTDateTime, formatISTDate } from '../utils/dateUtils';

const PublicDashboard = ({ refreshInterval }) => {
  const {
    stations,
    activeStations,
    selectedStationId,
    setSelectedStationId,
    selectedStationDetail,
    chartData,
    loading,
    error,
  } = useRealtimeStations(refreshInterval || 30000);

  const chartWindow = useMemo(() => {
    if (!chartData.length) return [];
    const now = Date.now();
    const cutoff = now - 7 * 24 * 60 * 60 * 1000;
    return chartData.filter((point) => new Date(point.time).getTime() >= cutoff);
  }, [chartData]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading latest groundwater data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Welcome to DWLR Water Level Monitoring</h2>
        <p className="text-blue-100">
          Access real-time groundwater level information from monitoring stations across the region. 
          This public dashboard provides transparent access to water resource data.
        </p>
      </div>

      {/* Quick Stats - Using memoized components for independent updates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LiveDataSection stations={stations} activeStations={activeStations} />
        <LastUpdateSection 
          lastUpdateTime={selectedStationDetail?.lastUpdate || stations[0]?.lastUpdate || null} 
        />
      </div>

      {error && (
        <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Map + List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Station Locations</h3>
          <div className="h-80">
            <MapView
              stations={stations}
              selectedStation={selectedStationId}
              onStationSelect={setSelectedStationId}
            />
          </div>
        </div>

        <div>
          <StationList
            stations={stations}
            selectedStation={selectedStationId}
            onStationSelect={setSelectedStationId}
          />
        </div>
      </div>

      {/* Selected Station Info */}
      {selectedStationId && selectedStationDetail && (
        <>
          {/* Evaluation Panel */}
          <EvaluationPanel 
            stationId={selectedStationId} 
            stationName={selectedStationDetail.name} 
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Station Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedStationDetail.name}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Current Water Level</span>
                <span className="text-xl font-bold text-blue-600">
                  {typeof selectedStationDetail.currentLevel === 'number'
                    ? `${selectedStationDetail.currentLevel.toFixed(1)}m`
                    : 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Well Depth</span>
                <span className="text-lg font-semibold text-gray-600">
                  {selectedStationDetail.wellDepth
                    ? `${selectedStationDetail.wellDepth}m`
                    : 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                <span className="text-gray-700">Aquifer Type</span>
                <span className="text-lg font-semibold text-teal-600">
                  {selectedStationDetail.aquifer}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Status</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  selectedStationDetail.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : selectedStationDetail.status === 'maintenance'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {(selectedStationDetail.statusLabel || selectedStationDetail.status || '')
                    .toString()
                    .replace(/^\w/, (c) => c.toUpperCase())}
                </span>
              </div>
              
              <div className="text-sm text-gray-500">
                <Clock className="w-4 h-4 inline mr-1" />
                Last updated:{' '}
                {selectedStationDetail.lastUpdate
                  ? formatISTDateTime(selectedStationDetail.lastUpdate)
                  : 'Unavailable'}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Water Level Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartWindow}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={(value) => formatISTDate(new Date(value))}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => formatISTDateTime(new Date(value))}
                    formatter={(value) => [`${Number(value).toFixed(2)}m`, 'Water Level']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="level" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Information Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <Info className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">About DWLR Monitoring</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">What is DWLR?</h4>
            <p className="text-gray-600 text-sm">
              Depth to Water Level Recorders (DWLR) are automated instruments that continuously 
              monitor groundwater levels. They provide real-time data on water table fluctuations, 
              helping in water resource management and planning.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Data Updates</h4>
            <p className="text-gray-600 text-sm">
              Station data is updated every 15 minutes. The dashboard shows the most recent 
              measurements from each monitoring point. Historical data spanning multiple years 
              is available for trend analysis.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Understanding the Data</h4>
            <p className="text-gray-600 text-sm">
              Water levels are measured in meters below ground surface. Lower numbers indicate 
              higher water tables (better water availability), while higher numbers suggest 
              deeper groundwater levels.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
            <p className="text-gray-600 text-sm">
              For technical queries or data requests, contact the Ministry of Jal Shakti 
              at info@jalshakti.gov.in or visit our main website for additional resources 
              and documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicDashboard;