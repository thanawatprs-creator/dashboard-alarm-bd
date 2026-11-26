import React from 'react';
import { ActiveAlarm } from '../types';
import { AlertTriangle, Clock, MapPin, Tag, Wrench, ChevronRight, CheckCircle, Flame } from 'lucide-react';
import { formatLiveDuration } from '../hooks/useRealtimeDashboard';

interface BreakdownAlarmPanelProps {
  alarms: ActiveAlarm[];
  onSelectMachine: (machineId: string) => void;
  currentTimeMs: number; // Ticks every second
}

export const BreakdownAlarmPanel: React.FC<BreakdownAlarmPanelProps> = ({
  alarms,
  onSelectMachine,
  currentTimeMs
}) => {
  const formatStartTime = (isoString: string) => {
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

  return (
    <div className="bg-[#121826] border-2 border-[#ED1C24]/50 rounded-2xl overflow-hidden shadow-2xl">
      {/* Alarm Panel Header (Isuzu Red Theme) */}
      <div className="bg-gradient-to-r from-[#ED1C24]/30 via-[#ED1C24]/10 to-transparent px-5 py-3.5 border-b border-[#ED1C24]/40 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#ED1C24]/20 flex items-center justify-center text-[#ED1C24] border border-[#ED1C24]/50 animate-pulse shadow-md shadow-[#ED1C24]/20">
            <AlertTriangle className="w-5 h-5 text-[#ED1C24]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm lg:text-base font-bold font-mono text-red-300 tracking-wider">
                แผงแจ้งเตือนเครื่องจักรขัดข้อง (BREAKDOWN ALARMS)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#ED1C24] text-white shadow-sm">
                {alarms.length} เครื่องกำลังขัดข้อง
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono">
              ISUZU PM SHOP &bull; ต้องการการดำเนินการซ่อมบำรุงเร่งด่วน &bull; คำนวณ Downtime แบบนับวินาทีเรียลไทม์
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-red-400 font-semibold hidden sm:flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ED1C24] animate-ping"></span>
          <span>WEBSOCKET แจ้งเตือนสด</span>
        </div>
      </div>

      {/* Alarms Content */}
      <div className="p-4">
        {alarms.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
              <CheckCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-mono font-bold text-emerald-400 uppercase tracking-wide">
              ไม่มีการแจ้งเตือนเครื่องจักรขัดข้องในขณะนี้
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              เครื่องจักรทั้ง 10 เครื่องในแผนก PM Shop กำลังทำงานอยู่ในเกณฑ์ปกติ หรืออยู่ในแผนงานหยุดซ่อมบำรุงตามกำหนดการ
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {alarms.map((alarm) => {
              // Real-time downtime calculation ticking every second!
              const liveDowntimeStr = formatLiveDuration(alarm.breakdown_start_time);

              return (
                <div
                  key={alarm.machine_id}
                  onClick={() => onSelectMachine(alarm.machine_id)}
                  className="bg-[#0A0D14] border-2 border-[#ED1C24]/60 hover:border-[#ED1C24] rounded-xl p-3.5 transition-all cursor-pointer relative overflow-hidden group hover:shadow-xl hover:shadow-[#ED1C24]/20"
                >
                  {/* Red edge marker */}
                  <div className="absolute top-0 left-0 bottom-0 w-2 bg-[#ED1C24]"></div>

                  <div className="pl-2">
                    {/* Top: Machine ID + SR Tag + Real-time ticking downtime */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-white text-base tracking-wide">
                          {alarm.machine_id}
                        </span>
                        <span className="text-xs text-slate-300 font-medium">
                          {alarm.machine_name}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#ED1C24]/20 text-[#ED1C24] border border-[#ED1C24]/40 font-mono font-bold text-xs flex items-center space-x-1">
                        <Flame className="w-3.5 h-3.5 text-[#ED1C24] animate-pulse" />
                        <span>{liveDowntimeStr}</span>
                      </span>
                    </div>

                    {/* SR Number & Location */}
                    <div className="mt-2 flex items-center space-x-3 text-xs text-slate-300 font-mono">
                      <span className="inline-flex items-center space-x-1 text-cyan-400">
                        <Tag className="w-3 h-3 text-cyan-500" />
                        <span className="font-semibold">{alarm.sr_number}</span>
                      </span>
                      <span className="inline-flex items-center space-x-1 text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{alarm.location}</span>
                      </span>
                    </div>

                    {/* Description Box */}
                    <div className="mt-2.5 p-2.5 rounded-lg bg-[#161F33] border border-[#253248] text-xs text-red-200 font-mono">
                      <div className="text-[10px] text-[#ED1C24] uppercase font-bold tracking-wider mb-0.5">
                        อาการขัดข้อง (FAULT DIAGNOSTIC):
                      </div>
                      <p className="line-clamp-2 leading-relaxed">
                        {alarm.breakdown_description}
                      </p>
                    </div>

                    {/* Bottom: Start Time & Action */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>เริ่มขัดข้อง: {formatStartTime(alarm.breakdown_start_time)}</span>
                      </span>
                      <span className="text-[#ED1C24] group-hover:text-red-300 flex items-center space-x-1 font-bold">
                        <span>ตรวจสอบ &rarr;</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
