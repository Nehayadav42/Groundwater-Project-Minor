import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Droplets, Activity, AlertTriangle, Wrench } from 'lucide-react';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const STATUS_COLORS = {
  active: '#22c55e',
  maintenance: '#f59e0b',
  inactive: '#ef4444',
  normal: '#22c55e',
  warning: '#f59e0b',
  alert: '#ef4444',
};

const DEFAULT_CENTER = [22.9734, 78.6569]; // Geographic center of India

const createCustomIcon = (status = 'active', isSelected = false) => {
  const color = STATUS_COLORS[status] || STATUS_COLORS.active;
  const size = isSelected ? 32 : 24;
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: ${isSelected ? '0 0 0 4px rgba(59,130,246,0.35)' : '0 2px 4px rgba(0,0,0,0.3)'};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

const MapView = ({ stations = [], selectedStation, onStationSelect }) => {
  const getStatusIcon = (status = 'active') => {
    const value = status.toLowerCase();
    switch (value) {
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

  const getStatusColor = (status = 'active') => {
    const value = status.toLowerCase();
    switch (value) {
      case 'active':
      case 'normal':
        return 'border-green-500 bg-green-50';
      case 'maintenance':
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-red-500 bg-red-50';
    }
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={5}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {stations.map((station) => {
          const latitude = station.latitude ?? station.location?.lat;
          const longitude = station.longitude ?? station.location?.lng;
          if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return null;
          }

          const latestLevel = typeof station.currentLevel === 'number'
            ? `${station.currentLevel.toFixed(1)}m`
            : 'N/A';
          const wellDepth = station.wellDepth ? `${station.wellDepth}m` : 'N/A';
          const aquifer = station.aquifer || 'Not specified';
          const lastUpdated = station.lastUpdate
            ? new Date(station.lastUpdate).toLocaleString()
            : 'Unavailable';

          return (
          <Marker
            key={station.id}
            position={[latitude, longitude]}
            icon={createCustomIcon(station.status, station.id === selectedStation)}
            eventHandlers={{
              click: () => onStationSelect(station.id),
            }}
          >
            <Popup className="custom-popup">
              <div className={`p-3 border-l-4 ${getStatusColor(station.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{station.name}</h3>
                  {getStatusIcon(station.status)}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center">
                    <Droplets className="w-3 h-3 text-blue-500 mr-1" />
                    <span>Level: {latestLevel}</span>
                  </div>
                  <div className="text-gray-600">
                    Well Depth: {wellDepth}
                  </div>
                  <div className="text-gray-600">
                    Aquifer: {aquifer}
                  </div>
                  <div className="text-xs text-gray-500">
                    Last Update: {lastUpdated}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;