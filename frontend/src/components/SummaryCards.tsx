import React from 'react';
import { DashboardSummary } from '../types';
import { Cpu, CheckCircle2, AlertOctagon, PauseCircle, Clock } from 'lucide-react';

interface SummaryCardsProps {
  summary: DashboardSummary | null;
  onFilterStatus?: (status: string | null) => void;
  activeFilter?: string | null;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  onFilterStatus,
  activeFilter
}) => {
  const total = summary?.total_machines ?? 10;
  const normal = summary?.normal_count ?? 0;
  const breakdown = summary?.breakdown_count ?? 0;
  const stopped = summary?.stopped_count ?? 0;

  const normalPct = total > 0 ? Math.round((normal / total) * 100) : 0;
  const breakdownPct = total > 0 ? Math.round((breakdown / total) * 100) : 0;
  const stoppedPct = total > 0 ? Math.round((stopped / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. เครื่องจักรทั้งหมด (TOTAL MACHINES) - Isuzu Styled */}
      <div
        onClick={() => onFilterStatus && onFilterStatus(null)}
        className={`industrial-card rounded-xl p-5 border relative overflow-hidden transition-all cursor-pointer ${
          activeFilter === null
            ? 'ring-2 ring-slate-400 border-white/60 shadow-lg'
            : 'border-[#253248] hover:border-slate-500'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold tracking-wider text-slate-300">
            เครื่องจักรทั้งหมด (TOTAL)
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-4xl lg:text-5xl font-mono font-extrabold text-white tracking-tight">
            {total}
          </div>
          <span className="text-xs font-mono text-slate-400">
            เครื่องในระบบ PM Shop
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>ความครอบคลุมการตรวจสอบ</span>
          <span className="text-slate-300 font-semibold font-mono">100% เชื่อมต่อสด</span>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-500"></div>
      </div>

      {/* 2. ปกติ (NORMAL) */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('NORMAL')}
        className={`industrial-card rounded-xl p-5 border relative overflow-hidden transition-all cursor-pointer ${
          activeFilter === 'NORMAL'
            ? 'ring-2 ring-emerald-500/60 border-emerald-500/40 bg-emerald-950/20'
            : 'border-[#253248] hover:border-emerald-500/40'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 status-glow-green"></span>
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-400">
              เครื่องจักรปกติ (NORMAL)
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-4xl lg:text-5xl font-mono font-extrabold text-emerald-400 tracking-tight">
            {normal}
          </div>
          <span className="text-xs font-mono text-emerald-500/80 font-bold">
            {normalPct}% เดินเครื่องปกติ
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>สถานะการทำงาน</span>
          <span className="text-emerald-400 font-medium">พร้อมทำงานเต็มกำลัง</span>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
      </div>

      {/* 3. ขัดข้อง (BREAKDOWN) - Highlighted in Isuzu Corporate Red */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('BREAKDOWN')}
        className={`industrial-card rounded-xl p-5 border relative overflow-hidden transition-all cursor-pointer ${
          breakdown > 0 ? 'alarm-pulse bg-[#ED1C24]/10' : ''
        } ${
          activeFilter === 'BREAKDOWN'
            ? 'ring-2 ring-[#ED1C24] border-[#ED1C24]'
            : 'border-[#253248] hover:border-[#ED1C24]/60'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ED1C24] status-glow-red animate-ping"></span>
            <span className="text-xs font-mono font-bold tracking-wider text-[#ED1C24]">
              เครื่องจักรขัดข้อง (BREAKDOWN)
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#ED1C24]/20 flex items-center justify-center text-[#ED1C24] border border-[#ED1C24]/30">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-4xl lg:text-5xl font-mono font-extrabold text-[#ED1C24] tracking-tight">
            {breakdown}
          </div>
          <span className="text-xs font-mono text-red-400 font-bold">
            {breakdownPct}% ขัดข้องฉุกเฉิน
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-[#ED1C24]" />
            <span>เวลารวมที่หยุดทำงาน (Downtime)</span>
          </span>
          <span className="text-[#ED1C24] font-semibold font-mono">
            {summary?.total_breakdown_minutes ?? 0} นาที
          </span>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#ED1C24]"></div>
      </div>

      {/* 4. หยุดทำงาน (STOPPED) */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('STOPPED')}
        className={`industrial-card rounded-xl p-5 border relative overflow-hidden transition-all cursor-pointer ${
          activeFilter === 'STOPPED'
            ? 'ring-2 ring-amber-500/60 border-amber-500/40 bg-amber-950/20'
            : 'border-[#253248] hover:border-amber-500/40'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 status-glow-yellow"></span>
            <span className="text-xs font-mono font-bold tracking-wider text-amber-400">
              เครื่องจักรหยุดทำงาน (STOPPED)
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <PauseCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-4xl lg:text-5xl font-mono font-extrabold text-amber-400 tracking-tight">
            {stopped}
          </div>
          <span className="text-xs font-mono text-amber-500/80 font-bold">
            {stoppedPct}% หยุดซ่อมบำรุง
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>เวลารวมที่หยุดพักเครื่อง</span>
          </span>
          <span className="text-amber-400 font-semibold font-mono">
            {summary?.total_stopped_minutes ?? 0} นาที
          </span>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
      </div>
    </div>
  );
};
