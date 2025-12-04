import { useState, useEffect, memo } from 'react';
import { Clock } from 'lucide-react';
import { formatISTDateTime, getCurrentIST } from '../utils/dateUtils';

/**
 * Last Update Section Component
 * Shows the last data update time and current live time in IST
 * Updates independently without causing full page reloads
 */
const LastUpdateSection = memo(({ lastUpdateTime }) => {
  const [currentTime, setCurrentTime] = useState(() => formatISTDateTime(getCurrentIST()));

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatISTDateTime(getCurrentIST()));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedLastUpdate = lastUpdateTime 
    ? formatISTDateTime(lastUpdateTime) 
    : 'Unavailable';

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <Clock className="w-6 h-6 text-teal-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">Last Update</h3>
      <p className="text-lg font-bold text-teal-600 mt-2">{formattedLastUpdate}</p>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-1">Current Time (IST)</p>
        <p className="font-mono text-sm font-semibold text-teal-600">
          {currentTime} IST
        </p>
      </div>
    </div>
  );
});

LastUpdateSection.displayName = 'LastUpdateSection';

export default LastUpdateSection;

