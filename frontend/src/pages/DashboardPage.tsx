import React, { useState } from 'react';
import {
  Machine,
  DashboardSummary,
  DashboardStatistics,
  ActiveAlarm
} from '../types';
import { SummaryCards } from '../components/SummaryCards';
import { BreakdownAlarmPanel } from '../components/BreakdownAlarmPanel';
import { MachineOverviewGrid } from '../components/MachineOverviewGrid';
import { MachineStatisticsCharts } from '../components/MachineStatisticsCharts';

interface DashboardPageProps {
  summary: DashboardSummary | null;
  statistics: DashboardStatistics | null;
  machines: Machine[];
  activeAlarms: ActiveAlarm[];
  onSelectMachine: (machine: Machine) => void;
  onRefresh: () => void;
  currentTimeMs: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  statistics,
  machines,
  activeAlarms,
  onSelectMachine,
  onRefresh,
  currentTimeMs
}) => {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const handleSelectMachineById = (machineId: string) => {
    const found = machines.find((m) => m.machine_id === machineId);
    if (found) {
      onSelectMachine(found);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards Section */}
      <SummaryCards
        summary={summary}
        activeFilter={statusFilter}
        onFilterStatus={(st) => setStatusFilter(st)}
      />

      {/* 2. Breakdown Alarm Panel (Dedicated section for BREAKDOWN only with live seconds downtime) */}
      <BreakdownAlarmPanel
        alarms={activeAlarms}
        onSelectMachine={handleSelectMachineById}
        currentTimeMs={currentTimeMs}
      />

      {/* 3. Machine Status Overview (All 10 machines with live ticker) */}
      <MachineOverviewGrid
        machines={machines}
        onSelectMachine={onSelectMachine}
        filterStatus={statusFilter}
        currentTimeMs={currentTimeMs}
      />

      {/* 4. Machine Statistics & Downtime Analytics (Recharts - real-time synced) */}
      <MachineStatisticsCharts
        statistics={statistics}
        machines={machines}
        currentTimeMs={currentTimeMs}
      />
    </div>
  );
};
