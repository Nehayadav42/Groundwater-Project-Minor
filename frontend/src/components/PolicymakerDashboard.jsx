import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Users, FileText, Download } from 'lucide-react';
import MapView from './MapView';
import RiskAssessment from './RiskAssessment';
import EvaluationPanel from './EvaluationPanel';
import { useRealtimeStations } from '../hooks/useRealtimeStations';

const statusPalette = {
  normal: '#22c55e',
  active: '#22c55e',
  warning: '#f59e0b',
  maintenance: '#f59e0b',
  alert: '#ef4444',
  inactive: '#ef4444',
};

const PolicymakerDashboard = ({ refreshInterval }) => {
  const {
    stations,
    activeStations,
    selectedStationId,
    setSelectedStationId,
    loading,
    error,
  } = useRealtimeStations(refreshInterval || 60000);

  const statusData = useMemo(() => {
    const buckets = stations.reduce((acc, station) => {
      const key = (station.statusLabel || station.status || 'normal').toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(buckets).map(([key, value]) => ({
      name: key.replace(/^\w/, (c) => c.toUpperCase()),
      value,
      color: statusPalette[key] || '#94a3b8',
    }));
  }, [stations]);

  const aquiferData = useMemo(() => {
    const counts = stations.reduce((acc, station) => {
      const aquifer = station.aquifer || 'Unknown';
      acc[aquifer] = (acc[aquifer] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [stations]);

  const criticalStations = useMemo(
    () => stations.filter((station) => (station.currentLevel || 0) < 10),
    [stations]
  );
  const averageLevel = useMemo(() => {
    if (!stations.length) return 0;
    const total = stations.reduce((sum, station) => sum + (station.currentLevel || 0), 0);
    return total / stations.length;
  }, [stations]);

  const generateReport = () => {
    const csvContent = [
      'DWLR Stations Policy Report',
      `Generated on: ${new Date().toLocaleString()}`,
      '',
      'Summary Statistics:',
      `Total Stations: ${stations.length}`,
      `Active Stations: ${activeStations.length}`,
      `Average Water Level: ${averageLevel.toFixed(2)}m`,
      `Critical Stations (< 10m): ${criticalStations.length}`,
      '',
      'Station Details:',
      'Station ID,Name,Status,Current Level (m),Well Depth (m),Aquifer Type,Last Update',
      ...stations.map((station) =>
        [
          station.id,
          station.name,
          station.statusLabel || station.status,
          station.currentLevel ?? 'N/A',
          station.wellDepth ?? 'N/A',
          station.aquifer,
          station.lastUpdate || 'N/A',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DWLR_Policy_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Preparing policy overview…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stations</p>
              <p className="text-3xl font-bold text-gray-900">{stations.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Stations</p>
              <p className="text-3xl font-bold text-gray-900">
                {activeStations.length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Water Level</p>
              <p className="text-3xl font-bold text-gray-900">{averageLevel.toFixed(1)}m</p>
            </div>
            <TrendingDown className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Stations</p>
              <p className="text-3xl font-bold text-gray-900">{criticalStations.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertTriangle className="w-4 h-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Station Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Station Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Aquifer Type Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aquifer Type Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aquiferData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <RiskAssessment />

      {/* Map and Critical Stations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Station Network Overview</h3>
          <div className="h-80">
            <MapView
              stations={stations}
              selectedStation={selectedStationId}
              onStationSelect={setSelectedStationId}
            />
          </div>
        </div>

        {/* Critical Stations Alert */}
        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col h-[400px]">
          <div className="flex items-center mb-4 flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Critical Stations</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {criticalStations.length > 0 ? (
              <div className="space-y-3">
                {criticalStations.map(station => (
                  <div key={station.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900">{station.name}</h4>
                    <p className="text-sm text-red-700">
                      Water Level: {station.currentLevel.toFixed(1)}m
                    </p>
                    <p className="text-xs text-red-600">
                      Status: {station.status}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-600">All stations are operating within normal parameters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Station Evaluation */}
      {selectedStationId && (
        <EvaluationPanel 
          stationId={selectedStationId} 
          stationName={stations.find(s => s.id === selectedStationId)?.name || 'Selected Station'} 
        />
      )}

      {/* Policy Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Policy Actions & Reports</h3>
          <button
            onClick={generateReport}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Water Security Assessment</h4>
            <p className="text-sm text-gray-600 mt-1">
              Comprehensive analysis of groundwater levels across all monitoring stations
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mb-2" />
            <h4 className="font-medium text-gray-900">Risk Management</h4>
            <p className="text-sm text-gray-600 mt-1">
              Identify and mitigate risks associated with declining water levels
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Strategic Planning</h4>
            <p className="text-sm text-gray-600 mt-1">
              Long-term water resource management and policy development
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicymakerDashboard;