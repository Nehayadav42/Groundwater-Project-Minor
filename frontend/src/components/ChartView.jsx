import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart
} from 'recharts';
import { formatISTDate, formatISTTime } from '../utils/dateUtils';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const date = new Date(label);
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">
          {formatISTDate(date)} {formatISTTime(date)}
        </p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.dataKey === 'level' ? 'Water Level' : 'Temperature'}: {entry.value?.toFixed(2)}
            {entry.dataKey === 'level' ? 'm' : '°C'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartView = ({ data = [], title }) => {
  const formatXAxisLabel = (tickItem) => {
    const date = new Date(tickItem);
    return formatISTDate(date);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              tickFormatter={formatXAxisLabel}
              stroke="#6b7280"
              fontSize={12}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              yAxisId="level"
              orientation="left"
              stroke="#3b82f6"
              fontSize={12}
              tick={{ fontSize: 12 }}
              label={{ value: 'Water Level (m)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId="temp"
              orientation="right"
              stroke="#f59e0b"
              fontSize={12}
              tick={{ fontSize: 12 }}
              label={{ value: 'Temperature (°C)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="level"
              type="monotone"
              dataKey="level"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              name="Water Level"
              connectNulls={false}
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temperature"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
              name="Temperature"
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartView;