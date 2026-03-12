import { useEffect, useState } from 'react';
import { AlertTriangle, Shield, TrendingDown, MapPin } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const RiskAssessment = () => {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiskAssessment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/evaluations/risk`);
        if (!response.ok) throw new Error('Failed to fetch risk assessment');
        const data = await response.json();
        setRiskData(data);
      } catch (err) {
        console.error('Risk assessment error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRiskAssessment();
    const interval = setInterval(fetchRiskAssessment, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!riskData) {
    return null;
  }

  const totalRisk = riskData.critical + riskData.high;
  const riskPercentage = riskData.total > 0 
    ? ((totalRisk / riskData.total) * 100).toFixed(1) 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold text-gray-900">Risk Assessment Summary</h3>
      </div>

      {/* Overall Risk Indicator */}
      <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Stations Requiring Attention</p>
            <p className="text-2xl font-bold text-red-600">{totalRisk} / {riskData.total}</p>
            <p className="text-xs text-gray-500 mt-1">{riskPercentage}% of total stations</p>
          </div>
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
      </div>

      {/* Risk Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <p className="text-xs font-medium text-gray-700">Critical</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{riskData.critical}</p>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <p className="text-xs font-medium text-gray-700">High</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">{riskData.high}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <p className="text-xs font-medium text-gray-700">Moderate</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{riskData.moderate}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <p className="text-xs font-medium text-gray-700">Low</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{riskData.low}</p>
        </div>
      </div>

      {/* Critical Stations List */}
      {riskData.stations && riskData.stations.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <h4 className="text-sm font-medium text-gray-700">Critical & High Risk Stations</h4>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {riskData.stations.map((station) => (
              <div
                key={station.id}
                className="p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <MapPin className="w-3 h-3 text-red-600" />
                      <p className="font-medium text-gray-900">{station.name}</p>
                    </div>
                    <p className="text-xs text-gray-600">ID: {station.id}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-600">
                        Level: <span className="font-semibold">{station.currentLevel}m</span>
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        station.riskLevel === 'Critical' 
                          ? 'bg-red-200 text-red-800' 
                          : 'bg-orange-200 text-orange-800'
                      }`}>
                        {station.riskLevel}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Risk Score</p>
                    <p className="text-lg font-bold text-red-600">{station.riskScore}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAssessment;

