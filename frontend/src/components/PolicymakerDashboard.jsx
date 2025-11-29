import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Users, FileText, Download } from 'lucide-react';
import MapView from './MapView';
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
      
      {/* ---------- TOP METRICS ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500 flex justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Stations</p>
            <p className="text-3xl font-bold">{stations.length}</p>
          </div>
          <Users className="w-8 h-8 text-blue-500" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500 flex justify-between">
          <div>
            <p className="text-sm text-gray-600">Active Stations</p>
            <p className="text-3xl font-bold">{activeStations.length}</p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-500" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-yellow-500 flex justify-between">
          <div>
            <p className="text-sm text-gray-600">Avg Water Level</p>
            <p className="text-3xl font-bold">{averageLevel.toFixed(1)}m</p>
          </div>
          <TrendingDown className="w-8 h-8 text-yellow-500" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-500 flex justify-between">
          <div>
            <p className="text-sm text-gray-600">Critical Stations</p>
            <p className="text-3xl font-bold">{criticalStations.length}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <p>{error}</p>
        </div>
      )}

      {/* ---------- CHARTS ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Status Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Station Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aquifer Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Aquifer Type Distribution</h3>
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

      {/* ---------- MAP + CRITICAL SECTION ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Map View */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-4">
          <h3 className="font-semibold mb-4">Station Network Overview</h3>
          <div className="h-80">
            <MapView stations={stations} selectedStation={selectedStationId} onStationSelect={setSelectedStationId} />
          </div>
        </div>

        {/* Scrollable Critical Station Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col" style={{ height: "400px" }}>
          <div className="flex items-center mb-2 sticky top-0 bg-white z-10 pb-2 border-b">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="font-semibold">Critical Stations</h3>
          </div>

          <div className="overflow-y-auto custom-scroll pr-1">
            {criticalStations.length ? (
              <div className="space-y-3">
                {criticalStations.map(station => (
                  <div key={station.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-900">{station.name}</h4>
                    <p className="text-sm text-red-700">Water Level: {station.currentLevel.toFixed(1)}m</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No critical stations.</p>
            )}
          </div>
        </div>
      </div>

      {/* ---------- POLICY ACTIONS ---------- */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Policy Actions & Reports</h3>
          <button onClick={generateReport} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" /> Generate Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <FileText className="w-6 h-6 text-blue-600 mb-2" />
            <p className="font-medium">Water Security Assessment</p>
          </div>

          <div className="p-4 border rounded-lg">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mb-2" />
            <p className="font-medium">Risk Management</p>
          </div>

          <div className="p-4 border rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
            <p className="font-medium">Strategic Planning</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PolicymakerDashboard;
