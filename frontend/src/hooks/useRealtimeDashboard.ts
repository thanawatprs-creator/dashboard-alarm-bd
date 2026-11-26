import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Machine,
  DashboardSummary,
  DashboardStatistics,
  ActiveAlarm,
  SimulationStatus,
  WebSocketConnectionStatus,
  LiveAlarmNotification
} from '../types';
import { api } from '../services/api';

export const formatLiveDuration = (startTime: string | null): string => {
  if (!startTime) return '0 วินาที';
  try {
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const totalSeconds = Math.max(0, Math.floor((now - start) / 1000));

    if (totalSeconds < 60) {
      return `${totalSeconds} วินาที`;
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes < 60) {
      return `${minutes} นาที ${seconds} วิ`;
    }
    const hours = Math.floor(minutes / 60);
    const remMinutes = minutes % 60;
    if (hours < 24) {
      return `${hours} ชม. ${remMinutes} นาที ${seconds} วิ`;
    }
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days} วัน ${remHours} ชม. ${remMinutes} น.`;
  } catch {
    return '0 วินาที';
  }
};

export const useRealtimeDashboard = () => {
  // Core Data States
  const [machines, setMachines] = useState<Machine[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [activeAlarms, setActiveAlarms] = useState<ActiveAlarm[]>([]);
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus | null>(null);

  // Connection & Loading States
  const [connectionStatus, setConnectionStatus] = useState<WebSocketConnectionStatus>('RECONNECTING');
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Live Alarm Notifications / Toasts
  const [notifications, setNotifications] = useState<LiveAlarmNotification[]>([]);

  // Ticker for 1-second live downtime counter
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(Date.now());

  // WebSocket & Reconnect Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const pingIntervalRef = useRef<any>(null);
  const retryCountRef = useRef<number>(0);

  // 1. Initial Data Fetch via REST API
  const fetchInitialData = useCallback(async () => {
    try {
      const [
        fetchedMachines,
        fetchedSummary,
        fetchedStats,
        fetchedAlarms,
        fetchedSimStatus
      ] = await Promise.all([
        api.getMachines(),
        api.getSummary(),
        api.getStatistics(),
        api.getActiveAlarms(),
        api.getSimulationStatus()
      ]);

      setMachines(fetchedMachines);
      setSummary(fetchedSummary);
      setStatistics(fetchedStats);
      setActiveAlarms(fetchedAlarms);
      setSimulationStatus(fetchedSimStatus);
      setLastUpdated(new Date().toISOString());
      setError(null);
    } catch (err: any) {
      console.error('Failed to load initial REST dashboard data', err);
      setError(err.message || 'Cannot connect to backend');
    } finally {
      setLoading(false);
    }
  }, []);

  // Dismiss a notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // 2. WebSocket Connection Management
  const connectWebSocket = useCallback(() => {
    // Clear any existing reconnect timer
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Determine WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use window.location.host via Vite proxy (/ws) or fallback to localhost:8000
    const host = window.location.port === '5173' ? 'localhost:8000' : window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    console.log(`[WebSocket] Connecting to ${wsUrl}...`);
    setConnectionStatus('RECONNECTING');

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connection established successfully.');
        setConnectionStatus('CONNECTED');
        setError(null);
        retryCountRef.current = 0;

        // Re-synchronize full database state on reconnect
        fetchInitialData();

        // Start heartbeat ping every 10 seconds
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: 'ping', timestamp: Date.now() }));
          }
        }, 10000);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { event: eventName, data, timestamp } = payload;

          setLastUpdated(timestamp || new Date().toISOString());

          if (eventName === 'pong') {
            return;
          }

          if (eventName === 'machine_status_changed') {
            // Update the specific machine in state immediately
            setMachines((prevMachines) => {
              return prevMachines.map((m) => {
                if (m.machine_id === data.machine_id) {
                  return {
                    ...m,
                    status: data.current_status,
                    breakdown_description: data.breakdown_description,
                    stop_reason: data.stop_reason,
                    sr_number: data.sr_number,
                    breakdown_start_time: data.breakdown_start_time,
                    stopped_start_time: data.stopped_start_time,
                    last_updated: data.last_updated || timestamp
                  };
                }
                return m;
              });
            });

            // Trigger notification
            if (data.current_status === 'BREAKDOWN') {
              const newNotif: LiveAlarmNotification = {
                id: `alarm-${data.machine_id}-${Date.now()}`,
                type: 'breakdown',
                machine_id: data.machine_id,
                title: `แจ้งเตือนฉุกเฉิน: เครื่องจักร ${data.machine_id} ขัดข้อง!`,
                message: data.breakdown_description || 'เกิดข้อผิดพลาดทางเทคนิคในระบบ',
                sr_number: data.sr_number,
                location: data.location,
                timestamp: timestamp || new Date().toISOString()
              };
              setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);
            } else if (data.previous_status === 'BREAKDOWN' && data.current_status === 'NORMAL') {
              const newNotif: LiveAlarmNotification = {
                id: `recov-${data.machine_id}-${Date.now()}`,
                type: 'recovered',
                machine_id: data.machine_id,
                title: `เครื่องจักร ${data.machine_id} ซ่อมบำรุงเสร็จสิ้น`,
                message: 'เครื่องจักรกลับคืนสู่สถานะการทำงานปกติ (NORMAL)',
                sr_number: data.sr_number,
                location: data.location,
                timestamp: timestamp || new Date().toISOString()
              };
              setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);
            }
          }

          if (eventName === 'dashboard_summary_updated') {
            setSummary(data);
          }

          if (eventName === 'machine_data_updated') {
            if (data.active_alarms) {
              setActiveAlarms(data.active_alarms);
            }
            // Fetch latest statistics when machine data updates
            api.getStatistics().then(setStatistics).catch(console.error);
          }

          if (eventName === 'alarm_created') {
            setActiveAlarms((prev) => {
              const exists = prev.some((a) => a.machine_id === data.machine_id);
              if (exists) return prev;
              const newAlarm: ActiveAlarm = {
                machine_id: data.machine_id,
                machine_name: data.machine_name,
                location: data.location,
                sr_number: data.sr_number,
                breakdown_description: data.breakdown_description,
                breakdown_start_time: data.breakdown_start_time,
                downtime_minutes: 0,
                downtime_formatted: '0 วินาที'
              };
              return [newAlarm, ...prev];
            });
          }

          if (eventName === 'machine_recovered') {
            setActiveAlarms((prev) => prev.filter((a) => a.machine_id !== data.machine_id));
          }

          if (eventName === 'system_status') {
            if (data.status === 'connected') {
              setConnectionStatus('CONNECTED');
            }
          }
        } catch (err) {
          console.error('[WebSocket] Error processing incoming message', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('[WebSocket] Socket encountered error:', err);
        setConnectionStatus('RECONNECTING');
      };

      ws.onclose = (event) => {
        console.log(`[WebSocket] Closed (code: ${event.code}). Attempting reconnect...`);
        setConnectionStatus('RECONNECTING');
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

        // Exponential backoff reconnect: 1s, 2s, 3s, max 5s
        const delay = Math.min(5000, 1000 * Math.pow(1.5, retryCountRef.current));
        retryCountRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
      };
    } catch (err) {
      console.error('[WebSocket] Setup exception:', err);
      setConnectionStatus('DISCONNECTED');
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
    }
  }, [fetchInitialData]);

  // Initial load and WebSocket lifecycle
  useEffect(() => {
    fetchInitialData();
    connectWebSocket();

    // 1-Second live ticker for counting downtime with precision
    const ticker = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);

    return () => {
      clearInterval(ticker);
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, [fetchInitialData, connectWebSocket]);

  return {
    machines,
    summary,
    statistics,
    activeAlarms,
    simulationStatus,
    connectionStatus,
    loading,
    lastUpdated,
    error,
    notifications,
    dismissNotification,
    refreshData: fetchInitialData,
    currentTimeMs
  };
};

