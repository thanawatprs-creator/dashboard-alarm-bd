export type MachineStatus = 'NORMAL' | 'BREAKDOWN' | 'STOPPED';

export type WebSocketConnectionStatus = 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';

export interface Machine {
  id: number;
  machine_id: string; // MC-001 ... MC-010
  machine_name: string; // Machine 01 ... Machine 10
  location: string; // PM1 Shop, PM1 Overhaul, PM2 Shop, PM2 Overhaul
  status: MachineStatus;
  breakdown_description: string | null;
  stop_reason: string | null;
  sr_number: string | null;
  breakdown_start_time: string | null;
  stopped_start_time: string | null;
  last_updated: string;
  downtime_minutes: number;
  downtime_formatted: string;
  duration_minutes: number;
  duration_formatted: string;
}

export interface DashboardSummary {
  total_machines: number;
  normal_count: number;
  breakdown_count: number;
  stopped_count: number;
  total_breakdown_minutes: number;
  total_stopped_minutes: number;
  last_updated: string;
  demo_mode: boolean;
}

export interface StatusDistributionItem {
  status: MachineStatus;
  label: string;
  count: number;
  color: string;
}

export interface LocationDistributionItem {
  location: string;
  normal: number;
  breakdown: number;
  stopped: number;
  total: number;
}

export interface DowntimeOverviewItem {
  machine_id: string;
  machine_name: string;
  location: string;
  status: MachineStatus;
  duration_minutes: number;
  duration_formatted: string;
  reason: string;
}

export interface DashboardStatistics {
  status_distribution: StatusDistributionItem[];
  location_distribution: LocationDistributionItem[];
  downtime_overview: DowntimeOverviewItem[];
}

export interface ActiveAlarm {
  machine_id: string;
  machine_name: string;
  location: string;
  sr_number: string;
  breakdown_description: string;
  breakdown_start_time: string;
  downtime_minutes: number;
  downtime_formatted: string;
}

export interface AlarmHistoryItem {
  id: number;
  machine_id: string;
  machine_name: string;
  location: string;
  previous_status: MachineStatus;
  new_status: MachineStatus;
  event_description: string;
  event_timestamp: string;
  sr_number: string | null;
}

export interface SimulationStatus {
  enabled: boolean;
  interval_seconds: number;
  last_run: string | null;
  total_events_generated: number;
  connected_clients?: number;
}

export interface LiveAlarmNotification {
  id: string;
  type: 'breakdown' | 'recovered' | 'info';
  machine_id: string;
  title: string;
  message: string;
  sr_number?: string | null;
  location: string;
  timestamp: string;
}
