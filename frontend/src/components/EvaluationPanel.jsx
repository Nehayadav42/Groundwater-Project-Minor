import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Activity, BarChart3, Shield, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import IndianClock from './IndianClock';
import { formatISTDateTime } from '../utils/dateUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const EvaluationPanel = ({ stationId, stationName }) => {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (!stationId) return;

    const fetchEvaluation = async () => {
      try {
        // Only show loading on initial load, not on subsequent updates
        if (isInitialLoad) {
          setLoading(true);
        }
        const response = await fetch(`${API_BASE_URL}/api/evaluations/${stationId}`);
        if (!response.ok) throw new Error('Failed to fetch evaluation');
        const data = await response.json();
        setEvaluation(data);
        setError(null);
      } catch (err) {
        console.error('Evaluation fetch error:', err);
        setError(err.message);
      } finally {
        if (isInitialLoad) {
          setLoading(false);
          setIsInitialLoad(false);
        }
      }
    };

    fetchEvaluation();
    const interval = setInterval(fetchEvaluation, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [stationId, isInitialLoad]);

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

  if (error || !evaluation) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <p>Evaluation data unavailable</p>
        </div>
      </div>
    );
  }

  const riskColor = {
    Critical: 'bg-red-100 text-red-800 border-red-300',
    High: 'bg-orange-100 text-orange-800 border-orange-300',
    Moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Low: 'bg-green-100 text-green-800 border-green-300',
  }[evaluation.riskLevel] || 'bg-gray-100 text-gray-800 border-gray-300';

  const trendIcon = evaluation.trendDirection === 'Rising' 
    ? <TrendingUp className="w-5 h-5 text-green-600" />
    : evaluation.trendDirection === 'Declining'
    ? <TrendingDown className="w-5 h-5 text-red-600" />
    : <Activity className="w-5 h-5 text-gray-600" />;

  const trendColor = evaluation.trendDirection === 'Rising' 
    ? 'text-green-600' 
    : evaluation.trendDirection === 'Declining'
    ? 'text-red-600'
    : 'text-gray-600';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">Groundwater Evaluation</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${riskColor}`}>
          {evaluation.riskLevel} Risk
        </span>
      </div>

      {/* Last Update and Current Time */}
      <div className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center space-x-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Last Update: </span>
          <span className="font-medium">
            {evaluation.lastUpdate ? formatISTDateTime(evaluation.lastUpdate) : 'Unavailable'}
          </span>
        </div>
        <IndianClock showIcon={false} />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Current Level</p>
          <p className="text-2xl font-bold text-blue-600">{evaluation.currentLevel}m</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Average (7d)</p>
          <p className="text-2xl font-bold text-gray-700">{evaluation.averageLevel}m</p>
        </div>
        <div className={`p-4 rounded-lg ${trendColor.includes('green') ? 'bg-green-50' : trendColor.includes('red') ? 'bg-red-50' : 'bg-gray-50'}`}>
          <div className="flex items-center space-x-1 mb-1">
            {trendIcon}
            <p className="text-xs text-gray-600">Trend</p>
          </div>
          <p className={`text-2xl font-bold ${trendColor}`}>
            {evaluation.trend > 0 ? '+' : ''}{evaluation.trend.toFixed(2)}m
          </p>
          <p className="text-xs text-gray-500">{evaluation.trendPercent}%</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Depth Ratio</p>
          <p className="text-2xl font-bold text-purple-600">{evaluation.depthRatio}%</p>
        </div>
      </div>

      {/* Risk Score Visualization */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">Risk Score</h4>
          <span className="text-sm font-bold text-gray-900">{evaluation.riskScore}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${
              evaluation.riskScore >= 70 ? 'bg-red-500' :
              evaluation.riskScore >= 40 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${evaluation.riskScore}%` }}
          ></div>
        </div>
      </div>

      {/* Well Information */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div>
          <p className="text-xs text-gray-600 mb-1">Well Depth</p>
          <p className="text-lg font-semibold text-gray-900">{evaluation.wellDepth}m</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Aquifer Type</p>
          <p className="text-lg font-semibold text-gray-900">{evaluation.aquifer}</p>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="pt-4 border-t">
        <div className="flex items-center space-x-2 mb-3">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-medium text-gray-700">Trend Analysis</h4>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              evaluation.trendDirection === 'Rising' ? 'bg-green-500' :
              evaluation.trendDirection === 'Declining' ? 'bg-red-500' :
              'bg-gray-500'
            }`}></div>
            <span className="text-gray-600">{evaluation.trendDirection}</span>
          </div>
          <div className="text-gray-500">
            Change: {evaluation.trend > 0 ? '+' : ''}{evaluation.trend.toFixed(2)}m over 7 days
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationPanel;

