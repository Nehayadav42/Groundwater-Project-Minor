import { useCallback, useEffect, useMemo, useState } from 'react';
import { mockStations, generateChartData } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const mapStatus = (statusLabel = 'active') => {
  const normalized = statusLabel.toLowerCase();
  if (['normal', 'active'].includes(normalized)) return 'active';
  if (['warning', 'maintenance'].includes(normalized)) return 'maintenance';
  if (['alert', 'inactive'].includes(normalized)) return 'inactive';
  return normalized || 'active';
};

const normalizeStationSummary = (station) => {
  if (!station) return null;

  const latestReading =
    station.latestReading ||
    (Array.isArray(station.time_series) && station.time_series.length
      ? station.time_series[station.time_series.length - 1]
      : null);

  const statusLabel = station.status || 'Normal';

  return {
    id: station.id,
    name: station.name,
    latitude: station.latitude ?? station.location?.lat ?? 0,
    longitude: station.longitude ?? station.location?.lng ?? 0,
    status: mapStatus(statusLabel),
    statusLabel,
    currentLevel:
      typeof latestReading?.water_level === 'number'
        ? latestReading.water_level
        : station.currentLevel ?? null,
    lastUpdate: latestReading?.date || station.lastUpdate || station.updatedAt || null,
    wellDepth: station.wellDepth ?? station.well_depth ?? null,
    aquifer: station.aquifer ?? 'Not Available',
  };
};

const transformSeries = (series = []) =>
  series
    .filter(Boolean)
    .map((point) => ({
      time: point.time || point.date || point.timestamp,
      level: Number(point.level ?? point.water_level ?? 0),
      temperature: point.temperature ?? null,
    }))
    .filter((point) => !!point.time)
    .sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

export const useRealtimeStations = (refreshInterval = 30000) => {
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [selectedStationDetail, setSelectedStationDetail] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchStations = useCallback(async (isInitial = false) => {
    try {
      // Only show loading on initial load, not on subsequent updates
      if (isInitial) {
        setLoading(true);
      }
      const response = await fetch(`${API_BASE_URL}/api/stations`);
      if (!response.ok) {
        throw new Error('Failed to load station list');
      }
      const data = await response.json();
      const normalized = data
        .map((station) => normalizeStationSummary(station))
        .filter(Boolean);

      if (normalized.length) {
        setStations((prevStations) => {
          // Only update if data actually changed to prevent unnecessary re-renders
          const hasChanged = JSON.stringify(prevStations) !== JSON.stringify(normalized);
          return hasChanged ? normalized : prevStations;
        });
        setSelectedStationId((current) => current || normalized[0].id);
      }
      setError(null);
    } catch (err) {
      console.error('Station fetch error:', err);
      setError(err.message || 'Unable to load stations');
      if (isInitial) {
        const fallback = mockStations
          .map((station) => normalizeStationSummary(station))
          .filter(Boolean);
        setStations(fallback);
        setSelectedStationId((current) => current || fallback[0]?.id || null);
      }
    } finally {
      if (isInitial) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, []);

  const fetchStationDetail = useCallback(async (stationId, isInitial = false) => {
    if (!stationId) return;
    try {
      // Only show loading on initial load
      if (isInitial) {
        setDetailLoading(true);
      }
      const response = await fetch(`${API_BASE_URL}/api/stations/${stationId}`);
      if (!response.ok) {
        throw new Error('Failed to load station details');
      }
      const station = await response.json();
      const normalized = normalizeStationSummary(station);
      const series = transformSeries(station.time_series || []);

      setSelectedStationDetail((prevDetail) => {
        // Only update if data actually changed
        const newDetail = {
          ...normalized,
          timeSeries: series,
        };
        const hasChanged = JSON.stringify(prevDetail) !== JSON.stringify(newDetail);
        return hasChanged ? newDetail : prevDetail;
      });
      setChartData((prevData) => {
        const hasChanged = JSON.stringify(prevData) !== JSON.stringify(series);
        return hasChanged ? series : prevData;
      });
      setError(null);
    } catch (err) {
      console.error('Station detail error:', err);
      setError(err.message || 'Unable to load station details');

      if (isInitial) {
        const fallbackStation = mockStations.find((s) => s.id === stationId);
        if (fallbackStation) {
          const normalized = normalizeStationSummary(fallbackStation);
          const series = transformSeries(generateChartData(stationId, 7));
          setSelectedStationDetail({
            ...normalized,
            timeSeries: series,
          });
          setChartData(series);
        }
      }
    } finally {
      if (isInitial) {
        setDetailLoading(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStations(true);
  }, [fetchStations]);

  // Initial station detail load
  useEffect(() => {
    if (!selectedStationId) return;
    fetchStationDetail(selectedStationId, true);
  }, [fetchStationDetail, selectedStationId]);

  // Periodic updates (without loading states)
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0 || isInitialLoad) return undefined;
    const intervalId = setInterval(() => {
      fetchStations(false); // Don't show loading on updates
      if (selectedStationId) {
        fetchStationDetail(selectedStationId, false); // Don't show loading on updates
      }
    }, refreshInterval);
    return () => clearInterval(intervalId);
  }, [fetchStations, fetchStationDetail, refreshInterval, selectedStationId, isInitialLoad]);

  const activeStations = useMemo(
    () => stations.filter((station) => station.status === 'active'),
    [stations]
  );

  return {
    stations,
    activeStations,
    selectedStationId,
    setSelectedStationId,
    selectedStationDetail,
    chartData,
    loading,
    detailLoading,
    error,
    refresh: fetchStations,
  };
};

