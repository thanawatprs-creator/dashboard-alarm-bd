import React from 'react';
import { Machine } from '../types';
import {
  CheckCircle2,
  AlertOctagon,
  PauseCircle,
  MapPin,
  Clock,
  Tag,
  ArrowUpRight,
  Flame
} from 'lucide-react';
import { formatLiveDuration } from '../hooks/useRealtimeDashboard';

interface MachineOverviewGridProps {
  machines: Machine[];
  onSelectMachine: (machine: Machine) => void;
  filterStatus?: string | null;
  currentTimeMs: number; // For live 1s ticker
}

export const MachineOverviewGrid: React.FC<MachineOverviewGridProps> = ({
  machines,
  onSelectMachine,
  filterStatus,
  currentTimeMs
}) => {
  const filtered = filterStatus
    ? machines.filter((m) => m.status === filterStatus)
    : machines;

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (machine: Machine) => {
    switch (machine.status) {
      case 'NORMAL':
        return {
          label: 'ปกติ (NORMAL)',
          badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          indicatorClass: 'bg-emerald-500 status-glow-green',
          borderClass: 'border-emerald-500/30 hover:border-emerald-400',
          accentColor: 'text-emerald-400',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        };
      case 'BREAKDOWN':
        return {
          label: 'ขัดข้อง (BREAKDOWN)',
          badgeClass: 'bg-[#ED1C24]/20 text-[#ED1C24] border-[#ED1C24]/40 animate-pulse font-bold',
          indicatorClass: 'bg-[#ED1C24] status-glow-red animate-ping',
          borderClass: 'border-[#ED1C24]/60 hover:border-[#ED1C24] bg-[#ED1C24]/5',
          accentColor: 'text-[#ED1C24]',
          icon: <AlertOctagon className="w-4 h-4 text-[#ED1C24]" />
        };
      case 'STOPPED':
        return {
          label: 'หยุดทำงาน (STOPPED)',
          badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          indicatorClass: 'bg-amber-500 status-glow-yellow',
          borderClass: 'border-amber-500/40 hover:border-amber-400 bg-amber-950/10',
          accentColor: 'text-amber-400',
          icon: <PauseCircle className="w-4 h-4 text-amber-400" />
        };
    }
  };

  return (
    <div className="space-y-3">
      {/* Grid Subheader (Isuzu Theme) */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold font-mono tracking-wider text-white flex items-center space-x-2">
            <span>ภาพรวมสถานะเครื่องจักร (MACHINE STATUS OVERVIEW)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {filtered.length} / {machines.length} เครื่อง
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            ISUZU PM SHOP &bull; คลิกที่บัตรเครื่องจักรเพื่อตรวจสอบข้อมูลเทเลเมทรีและเปลี่ยนสถานะ
          </p>
        </div>

        {filterStatus && (
          <div className="text-xs font-mono text-[#ED1C24] flex items-center space-x-2 font-bold">
            <span>กำลังกรอง: <strong>{filterStatus}</strong></span>
          </div>
        )}
      </div>

      {/* 10 Machines Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-3.5">
        {filtered.map((machine) => {
          const cfg = getStatusBadge(machine);
          const liveDowntime = formatLiveDuration(machine.breakdown_start_time);
          const liveStopped = formatLiveDuration(machine.stopped_start_time);

          return (
            <div
              key={machine.machine_id}
              onClick={() => onSelectMachine(machine)}
              className={`industrial-card rounded-2xl p-4 border transition-all cursor-pointer relative overflow-hidden group hover:scale-[1.01] hover:shadow-2xl ${cfg.borderClass}`}
            >
              {/* Header inside Card: Machine ID + Status Badge */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xl font-mono font-black text-white tracking-wider flex items-center space-x-1.5">
                    <span>{machine.machine_id}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#ED1C24] transition-colors" />
                  </div>
                  <div className="text-xs font-medium text-slate-300">
                    {machine.machine_name}
                  </div>
                </div>

                <div className={`px-2 py-0.5 rounded-md border text-[11px] font-mono font-bold flex items-center space-x-1 ${cfg.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.indicatorClass}`}></span>
                  <span>{cfg.label}</span>
                </div>
              </div>

              {/* Location Badge */}
              <div className="mt-2.5 flex items-center space-x-1.5 text-xs font-mono text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-300 font-medium">{machine.location}</span>
              </div>

              {/* Dynamic State Info Box with Live 1-Second Counter */}
              <div className="mt-3 min-h-[58px] p-2.5 rounded-xl bg-[#0A0D14] border border-[#253248] text-xs font-mono flex flex-col justify-center">
                {machine.status === 'BREAKDOWN' ? (
                  <div>
                    <div className="flex items-center justify-between text-[#ED1C24] font-bold mb-0.5">
                      <span className="flex items-center space-x-1">
                        <Tag className="w-3 h-3" />
                        <span>{machine.sr_number || 'SR-PENDING'}</span>
                      </span>
                      <span className="text-[11px] flex items-center space-x-1">
                        <Flame className="w-3 h-3 text-[#ED1C24] animate-pulse" />
                        <span>{liveDowntime}</span>
                      </span>
                    </div>
                    <div className="text-red-200/90 truncate text-[11px]" title={machine.breakdown_description || ''}>
                      {machine.breakdown_description}
                    </div>
                  </div>
                ) : machine.status === 'STOPPED' ? (
                  <div>
                    <div className="flex items-center justify-between text-amber-400 font-bold mb-0.5">
                      <span>เวลาหยุดเครื่อง:</span>
                      <span className="text-[11px]">{liveStopped}</span>
                    </div>
                    <div className="text-amber-200/90 truncate text-[11px]" title={machine.stop_reason || ''}>
                      {machine.stop_reason}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-xs">เครื่องจักรเดินปกติ</div>
                      <div className="text-[10px] text-emerald-500/80">พร้อมทำงานตามสายการผลิต</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Footer: Last Updated */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>ซิงค์: {formatTime(machine.last_updated)}</span>
                </span>
                <span className="text-xs text-slate-500 group-hover:text-[#ED1C24] transition-colors font-bold">
                  ดูรายละเอียด &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
