import {
  Machine,
  DashboardSummary,
  DashboardStatistics,
  ActiveAlarm,
  AlarmHistoryItem,
  SimulationStatus,
  MachineStatus
} from '../types';

const API_BASE = '/api';

export const api = {
  // Machine Endpoints
  async getMachines(): Promise<Machine[]> {
    const res = await fetch(`${API_BASE}/machines`);
    if (!res.ok) throw new Error(`Failed to fetch machines: ${res.statusText}`);
    return res.json();
  },

  async getMachineById(machineId: string): Promise<Machine> {
    const res = await fetch(`${API_BASE}/machines/${encodeURIComponent(machineId)}`);
    if (!res.ok) throw new Error(`Failed to fetch machine ${machineId}`);
    return res.json();
  },

  async updateMachineStatus(
    machineId: string,
    status: MachineStatus,
    description?: string,
    reason?: string,
    startTime?: string
  ): Promise<Machine> {
    const res = await fetch(`${API_BASE}/machines/${encodeURIComponent(machineId)}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        description,
        reason,
        start_time: startTime || undefined,
      }),
    });
    if (!res.ok) throw new Error(`Failed to update machine status: ${res.statusText}`);
    return res.json();
  },

  // Dashboard Endpoints
  async getSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/dashboard/summary`);
    if (!res.ok) throw new Error(`Failed to fetch summary: ${res.statusText}`);
    return res.json();
  },

  async getStatistics(): Promise<DashboardStatistics> {
    const res = await fetch(`${API_BASE}/dashboard/statistics`);
    if (!res.ok) throw new Error(`Failed to fetch statistics: ${res.statusText}`);
    return res.json();
  },

  // Alarm Endpoints
  async getActiveAlarms(): Promise<ActiveAlarm[]> {
    const res = await fetch(`${API_BASE}/alarms/active`);
    if (!res.ok) throw new Error(`Failed to fetch active alarms: ${res.statusText}`);
    return res.json();
  },

  async getAlarmHistory(params?: {
    machine_id?: string;
    status?: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<AlarmHistoryItem[]> {
    const query = new URLSearchParams();
    if (params?.machine_id) query.append('machine_id', params.machine_id);
    if (params?.status) query.append('status', params.status);
    if (params?.location) query.append('location', params.location);
    if (params?.start_date) query.append('start_date', params.start_date);
    if (params?.end_date) query.append('end_date', params.end_date);
    if (params?.limit) query.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/alarms/history?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch alarm history: ${res.statusText}`);
    return res.json();
  },

  // Simulation Endpoints
  async getSimulationStatus(): Promise<SimulationStatus> {
    const res = await fetch(`${API_BASE}/simulation/status`);
    if (!res.ok) throw new Error(`Failed to fetch simulation status: ${res.statusText}`);
    return res.json();
  },

  async toggleSimulation(enabled: boolean): Promise<SimulationStatus> {
    const res = await fetch(`${API_BASE}/simulation/toggle?enabled=${enabled}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Failed to toggle simulation: ${res.statusText}`);
    return res.json();
  },

  async setSimulationInterval(seconds: number): Promise<SimulationStatus> {
    const res = await fetch(`${API_BASE}/simulation/interval?seconds=${seconds}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Failed to set simulation interval: ${res.statusText}`);
    return res.json();
  },

  async triggerSimulation(action: string, machineId?: string, description?: string): Promise<any> {
    const query = new URLSearchParams({ action });
    if (machineId) query.append('machine_id', machineId);
    if (description) query.append('description', description);

    const res = await fetch(`${API_BASE}/simulation/trigger?${query.toString()}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Failed to trigger simulation: ${res.statusText}`);
    return res.json();
  },
};
