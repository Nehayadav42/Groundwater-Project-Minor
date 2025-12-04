import { memo } from 'react';
import { Droplets, MapPin } from 'lucide-react';

/**
 * Live Data Section Component
 * Shows live station statistics that update independently
 * Uses React.memo to prevent unnecessary re-renders
 */
const LiveDataSection = memo(({ stations, activeStations }) => {
  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <MapPin className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Total Stations</h3>
        <p className="text-3xl font-bold text-blue-600">{stations.length}</p>
        <p className="text-sm text-gray-600">Monitoring Points</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Droplets className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Active Stations</h3>
        <p className="text-3xl font-bold text-green-600">{activeStations.length}</p>
        <p className="text-sm text-gray-600">Currently Online</p>
      </div>
    </>
  );
});

LiveDataSection.displayName = 'LiveDataSection';

export default LiveDataSection;

