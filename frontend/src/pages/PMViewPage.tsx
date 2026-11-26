import React, { useState } from 'react';
import { Machine } from '../types';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  PauseCircle,
  Clock,
  Tag,
  Monitor,
  Shield
} from 'lucide-react';
import { formatLiveDuration } from '../hooks/useRealtimeDashboard';

interface PMViewPageProps {
  machines: Machine[];
  onSelectMachine: (machine: Machine) => void;
  currentTimeMs: number;
}

const LOCATIONS = [
  { key: 'PM1 Shop', subtitle: 'สายการผลิตหลักแผนก PM1' },
  { key: 'PM1 Overhaul', subtitle: 'พื้นที่ซ่อมบำรุงใหญ่เครื่องจักร PM1' },
  { key: 'PM2 Shop', subtitle: 'สายการผลิตเครื่องยนต์ดีเซล PM2' },
  { key: 'PM2 Overhaul', subtitle: 'พื้นที่ปรับปรุงสภาพเครื่องยนต์ PM2' }
];

export const PMViewPage: React.FC<PMViewPageProps> = ({
  machines,
  onSelectMachine,
  currentTimeMs
}) => {
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('ALL');

  // Keep reference to currentTimeMs so 1-second live counter re-renders smoothly
  void currentTimeMs;

  const visibleLocations =
    selectedAreaFilter === 'ALL'
      ? LOCATIONS
      : LOCATIONS.filter((loc) => loc.key === selectedAreaFilter);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'BREAKDOWN':
        return {
          border: 'border-[#ED1C24] shadow-lg shadow-[#ED1C24]/20',
          bg: 'bg-gradient-to-br from-[#1B0E14] to-[#121826]',
          badge: 'bg-[#ED1C24] text-white animate-pulse',
          label: 'ขัดข้อง (BREAKDOWN)',
          icon: <AlertTriangle className="w-4 h-4 text-[#ED1C24]" />,
          timeColor: 'text-[#ED1C24]'
        };
      case 'STOPPED':
        return {
          border: 'border-amber-500/80 shadow-lg shadow-amber-500/10',
          bg: 'bg-gradient-to-br from-[#1C170D] to-[#121826]',
          badge: 'bg-amber-500 text-black font-bold',
          label: 'หยุดทำงาน (STOPPED)',
          icon: <PauseCircle className="w-4 h-4 text-amber-400" />,
          timeColor: 'text-amber-400'
        };
      default:
        return {
          border: 'border-emerald-500/40 hover:border-emerald-400/70',
          bg: 'bg-[#121826]',
          badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
          label: 'ปกติ (NORMAL)',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          timeColor: 'text-emerald-400'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* PM View Header Banner */}
      <div className="bg-[#121826] border border-[#253248] rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-[#ED1C24]/15 border border-[#ED1C24]/40">
            <Monitor className="w-6 h-6 text-[#ED1C24]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-mono font-bold text-white tracking-wider">
                หน้าจอแสดงสถานะเครื่องจักรฝ่าย PM (4 พื้นที่)
              </h2>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>READ-ONLY VIEW</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              แสดงเฉพาะเครื่องจักรและสถานะเครื่องจักรแบบเรียลไทม์แยกตามพื้นที่ปฏิบัติงานทั้ง 4 พื้นที่ (PM1 Shop, PM1 Overhaul, PM2 Shop, PM2 Overhaul)
            </p>
          </div>
        </div>

        {/* Area Quick Filter */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => setSelectedAreaFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              selectedAreaFilter === 'ALL'
                ? 'bg-[#ED1C24] border-[#ED1C24] text-white font-bold'
                : 'bg-[#0A0D14] border-[#253248] text-slate-400 hover:text-white'
            }`}
          >
            ทุกพื้นที่ (4 พื้นที่)
          </button>
          {LOCATIONS.map((loc) => (
            <button
              key={loc.key}
              onClick={() => setSelectedAreaFilter(loc.key)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                selectedAreaFilter === loc.key
                  ? 'bg-[#ED1C24] border-[#ED1C24] text-white font-bold'
                  : 'bg-[#0A0D14] border-[#253248] text-slate-400 hover:text-white'
              }`}
            >
              {loc.key}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Area Sections Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {visibleLocations.map((loc) => {
          const areaMachines = machines.filter((m) => m.location === loc.key);
          const normalCount = areaMachines.filter((m) => m.status === 'NORMAL').length;
          const breakdownCount = areaMachines.filter((m) => m.status === 'BREAKDOWN').length;
          const stoppedCount = areaMachines.filter((m) => m.status === 'STOPPED').length;

          return (
            <section
              key={loc.key}
              className={`rounded-2xl border-2 overflow-hidden bg-[#0E131F] transition-all ${
                breakdownCount > 0
                  ? 'border-[#ED1C24]/70 shadow-xl shadow-[#ED1C24]/10'
                  : 'border-[#253248]'
              }`}
            >
              {/* Area Header */}
              <div className="px-5 py-4 bg-[#121826] border-b border-[#253248] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <MapPin className="w-5 h-5 text-[#ED1C24]" />
                  <div>
                    <h3 className="text-base font-mono font-black text-white tracking-wider">
                      {loc.key}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">{loc.subtitle}</p>
                  </div>
                </div>

                {/* Area Status Counters */}
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                    ปกติ: {normalCount}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#ED1C24]/15 border border-[#ED1C24]/40 text-[#ED1C24] font-bold">
                    ขัดข้อง: {breakdownCount}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">
                    หยุด: {stoppedCount}
                  </span>
                </div>
              </div>

              {/* Machines in this Area */}
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {areaMachines.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-slate-500 font-mono text-xs">
                    ไม่มีเครื่องจักรในพื้นที่นี้
                  </div>
                ) : (
                  areaMachines.map((machine) => {
                    const style = getStatusStyle(machine.status);
                    const startTime =
                      machine.status === 'BREAKDOWN'
                        ? machine.breakdown_start_time
                        : machine.status === 'STOPPED'
                        ? machine.stopped_start_time
                        : null;
                    const liveDuration = startTime ? formatLiveDuration(startTime) : null;

                    return (
                      <div
                        key={machine.machine_id}
                        onClick={() => onSelectMachine(machine)}
                        className={`rounded-xl border-2 p-4 cursor-pointer transition-all hover:scale-[1.01] ${style.border} ${style.bg}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-base font-mono font-black text-white tracking-wider">
                              {machine.machine_id}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              {machine.machine_name}
                            </div>
                          </div>
                          {style.icon}
                        </div>

                        <div className="mt-3">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-mono font-bold tracking-wide ${style.badge}`}
                          >
                            {style.label}
                          </span>
                        </div>

                        {/* Breakdown / Stopped Extra Details */}
                        {machine.status === 'BREAKDOWN' && (
                          <div className="mt-3 pt-2.5 border-t border-[#ED1C24]/30 space-y-1 font-mono text-xs">
                            {machine.sr_number && (
                              <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
                                <Tag className="w-3 h-3" />
                                <span>{machine.sr_number}</span>
                              </div>
                            )}
                            <p className="text-[11px] text-red-200 line-clamp-2">
                              {machine.breakdown_description || 'เครื่องจักรขัดข้อง'}
                            </p>
                            {liveDuration && (
                              <div className={`flex items-center space-x-1.5 font-bold pt-1 ${style.timeColor}`}>
                                <Clock className="w-3.5 h-3.5" />
                                <span>Downtime: {liveDuration}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {machine.status === 'STOPPED' && (
                          <div className="mt-3 pt-2.5 border-t border-amber-500/30 space-y-1 font-mono text-xs">
                            <p className="text-[11px] text-amber-200 line-clamp-2">
                              {machine.stop_reason || 'หยุดทำงานชั่วคราว'}
                            </p>
                            {liveDuration && (
                              <div className={`flex items-center space-x-1.5 font-bold pt-1 ${style.timeColor}`}>
                                <Clock className="w-3.5 h-3.5" />
                                <span>หยุดสะสม: {liveDuration}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {machine.status === 'NORMAL' && (
                          <div className="mt-3 pt-2.5 border-t border-[#253248] text-[11px] font-mono text-slate-400">
                            เครื่องจักรทำงานปกติ &bull; ไม่มี Downtime
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
