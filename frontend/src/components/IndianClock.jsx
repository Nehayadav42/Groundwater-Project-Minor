import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getCurrentIST, formatISTDateTime } from '../utils/dateUtils';

/**
 * Real-time Indian Standard Time (IST) clock component
 * Updates every second to show current Indian time
 */
const IndianClock = ({ className = '', showIcon = true }) => {
  const [currentTime, setCurrentTime] = useState(() => formatISTDateTime(getCurrentIST()));

  useEffect(() => {
    // Update every second
    const interval = setInterval(() => {
      setCurrentTime(formatISTDateTime(getCurrentIST()));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showIcon && <Clock className="w-4 h-4 text-teal-600" />}
      <span className="font-mono text-sm font-semibold text-teal-600">
        {currentTime} IST
      </span>
    </div>
  );
};

export default IndianClock;


