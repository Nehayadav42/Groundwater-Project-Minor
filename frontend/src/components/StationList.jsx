import { memo } from 'react';
import { Activity, AlertTriangle, Wrench, Droplets, Clock, Map } from 'lucide-react';
import { formatISTDateTime } from '../utils/dateUtils';

const StationList = memo(({ 
  stations, 
  selectedStation, 
  onStationSelect 
}) => {
  const getStatusIcon = (status = 'active') => {
    const normalized = status.toLowerCase();
    switch (normalized) {
      case 'active':
      case 'normal':
        return <Activity className="w-4 h-4 text-green-600" />;
      case 'maintenance':
      case 'warning':
        return <Wrench className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status = 'active') => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    const normalized = status.toLowerCase();
    switch (normalized) {
      case 'active':
      case 'normal':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'maintenance':
      case 'warning':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-red-100 text-red-800`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-500 to-teal-500">
        <h2 className="text-lg font-semibold text-white">DWLR Stations</h2>
        <p className="text-blue-100 text-sm">{stations.length} monitoring points</p>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {stations.map((station) => (
          <div
            key={station.id}
            onClick={() => onStationSelect(station.id)}
            className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
              selectedStation === station.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(station.status)}
                <h3 className="font-medium text-gray-900">{station.name}</h3>
              </div>
              <span className={getStatusBadge(station.status)}>
                {station.statusLabel || station.status}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <Droplets className="w-3 h-3 mr-1 text-blue-500" />
                <span>
                  Current:{' '}
                  {typeof station.currentLevel === 'number'
                    ? `${station.currentLevel.toFixed(1)}m`
                    : 'N/A'}
                </span>
                <span className="mx-2">•</span>
                <span>Depth: {station.wellDepth ? `${station.wellDepth}m` : 'N/A'}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Map className="w-3 h-3 mr-1 text-gray-400" />
                <span>{station.aquifer || 'Unknown'} aquifer</span>
              </div>
              
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                <span>
                  Updated:{' '}
                  {station.lastUpdate
                    ? formatISTDateTime(station.lastUpdate)
                    : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

StationList.displayName = 'StationList';

export default StationList;