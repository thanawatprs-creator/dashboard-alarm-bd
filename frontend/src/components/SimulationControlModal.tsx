import React, { useState } from 'react';
import { SimulationStatus, Machine } from '../types';
import { api } from '../services/api';
import {
  X,
  Sliders,
  AlertTriangle,
  PauseCircle,
  CheckCircle2,
  Play,
  Pause,
  RotateCw,
  Zap,
  Info,
  Clock
} from 'lucide-react';

interface SimulationControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulationStatus: SimulationStatus | null;
  machines: Machine[];
  onTriggerSuccess: () => void;
}

export const SimulationControlModal: React.FC<SimulationControlModalProps> = ({
  isOpen,
  onClose,
  simulationStatus,
  machines,
  onTriggerSuccess
}) => {
  if (!isOpen) return null;

  const [selectedMachine, setSelectedMachine] = useState<string>('RANDOM');
  const [customFault, setCustomFault] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [intervalSec, setIntervalSec] = useState<number>(simulationStatus?.interval_seconds ?? 5);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggleAutoSim = async (enabled: boolean) => {
    try {
      setIsProcessing(true);
      await api.toggleSimulation(enabled);
      setMsg({
        type: 'success',
        text: `ระบบจำลองอัตโนมัติ ${enabled ? 'เริ่มทำงานแล้ว (ENABLED)' : 'หยุดชั่วคราวแล้ว (PAUSED)'}`
      });
      onTriggerSuccess();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetInterval = async (sec: number) => {
    try {
      setIsProcessing(true);
      setIntervalSec(sec);
      await api.setSimulationInterval(sec);
      setMsg({
        type: 'success',
        text: `ปรับรอบเวลาการจำลองข้อมูลเป็นทุกๆ ${sec} วินาที เรียบร้อยแล้ว`
      });
      onTriggerSuccess();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAction = async (action: 'BREAKDOWN' | 'STOPPED' | 'NORMAL') => {
    try {
      setIsProcessing(true);
      setMsg(null);
      const targetId = selectedMachine === 'RANDOM' ? undefined : selectedMachine;
      const desc = customFault.trim() || undefined;
      await api.triggerSimulation(action, targetId, desc);
      setMsg({
        type: 'success',
        text: `คำสั่งจำลองสถานะ [${action}] บันทึกลง SQLite และบรอดแคสต์ผ่าน WebSocket สำเร็จ!`
      });
      setCustomFault('');
      onTriggerSuccess();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreAllToNormal = async () => {
    try {
      setIsProcessing(true);
      setMsg(null);
      for (const m of machines) {
        if (m.status !== 'NORMAL') {
          await api.updateMachineStatus(m.machine_id, 'NORMAL');
        }
      }
      setMsg({
        type: 'success',
        text: 'คืนค่าเครื่องจักรทั้ง 10 เครื่องสู่สถานะปกติ (NORMAL) ครบถ้วนแล้ว!'
      });
      onTriggerSuccess();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#121826] border-2 border-[#ED1C24]/50 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#0A0D14] px-6 py-4 border-b border-[#253248] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#ED1C24]/20 border border-[#ED1C24] flex items-center justify-center text-[#ED1C24]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-mono font-bold text-white tracking-wider uppercase">
                แผงควบคุมการจำลองข้อมูล (SIMULATION CONSOLE)
              </h3>
              <p className="text-xs text-[#ED1C24] font-mono">
                ISUZU ENGINE REAL-TIME DATA ENGINE &bull; WEBSOCKET
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Demo Disclaimer Box (Thai) */}
          <div className="p-3 bg-[#0A0D14] border border-[#253248] rounded-xl text-xs font-mono text-slate-300 flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-[#ED1C24] flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[#ED1C24] font-bold">โหมดทดสอบระบบเพื่อการนำเสนอ:</span>{' '}
              ระบบจำลองการเปลี่ยนสถานะเครื่องจักร อัปเดตฐานข้อมูล SQLite และส่งข้อมูลแบบ Push สดผ่าน WebSocket ไปยังทุกหน้าจอที่เปิดอยู่พร้อมกันโดยไม่ต้องกดรีเฟรชหน้าเว็บ
            </div>
          </div>

          {/* Feedback banner */}
          {msg && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono ${
                msg.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}
            >
              {msg.text}
            </div>
          )}

          {/* 1. Automated Simulation Loop Toggle & Interval Selector */}
          <div className="p-4 rounded-xl bg-[#0A0D14] border border-[#253248] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-mono font-bold text-white">
                  ระบบจำลองสถานะอัตโนมัติ (Continuous Simulation)
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  รอบเวลาปัจจุบัน: {simulationStatus?.interval_seconds ?? 5} วินาที &bull; เหตุการณ์ที่สร้างแล้ว: {simulationStatus?.total_events_generated ?? 0} ครั้ง
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {simulationStatus?.enabled ? (
                  <button
                    onClick={() => handleToggleAutoSim(false)}
                    disabled={isProcessing}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#ED1C24] hover:bg-[#C41219] text-white border border-[#ED1C24] text-xs font-mono font-bold transition-all shadow-md shadow-[#ED1C24]/30"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>หยุดจำลอง</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleAutoSim(true)}
                    disabled={isProcessing}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/30 text-xs font-mono font-bold transition-all shadow-md shadow-emerald-950/40"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>เริ่มจำลอง</span>
                  </button>
                )}
              </div>
            </div>

            {/* Interval buttons */}
            <div className="pt-2 border-t border-[#253248] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>ปรับความถี่จำลอง:</span>
              </span>
              <div className="flex items-center space-x-1.5">
                {[2, 5, 10, 30].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => handleSetInterval(sec)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                      (simulationStatus?.interval_seconds ?? 5) === sec
                        ? 'bg-[#ED1C24] text-white border-[#ED1C24] font-extrabold shadow-sm'
                        : 'bg-[#121826] text-slate-300 border-[#253248] hover:border-slate-500'
                    }`}
                  >
                    {sec}วิ
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Manual Action Controls */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase text-slate-300">
              ทดสอบจำลองเปลี่ยนสถานะทันที (Manual Fault Injection):
            </div>

            {/* Target Machine Selection */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase">
                เลือกเครื่องจักรเป้าหมาย:
              </label>
              <select
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                className="w-full mt-1 bg-[#0A0D14] border border-[#253248] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ED1C24]"
              >
                <option value="RANDOM">สุ่มเลือกเครื่องจักรที่เหมาะสม (Auto Random)</option>
                {machines.map((m) => (
                  <option key={m.machine_id} value={m.machine_id}>
                    {m.machine_id} – {m.machine_name} ({m.location}) [{m.status}]
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Description (Optional) */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase">
                ระบุข้อความอาการหรือเหตุผล (ไม่บังคับ):
              </label>
              <input
                type="text"
                value={customFault}
                onChange={(e) => setCustomFault(e.target.value)}
                placeholder="เช่น มอเตอร์แกนหมุนหลักโอเวอร์ฮีตเกิน 85°C"
                className="w-full mt-1 bg-[#0A0D14] border border-[#253248] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-[#ED1C24]"
              />
            </div>

            {/* Trigger Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleAction('BREAKDOWN')}
                disabled={isProcessing}
                className="py-3 px-3 rounded-xl bg-[#ED1C24] hover:bg-[#C41219] text-white font-mono text-xs font-bold tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-lg shadow-[#ED1C24]/30 disabled:opacity-50"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>จำลองขัดข้อง</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('STOPPED')}
                disabled={isProcessing}
                className="py-3 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-lg shadow-amber-900/30 disabled:opacity-50"
              >
                <PauseCircle className="w-4 h-4" />
                <span>จำลองหยุดเครื่อง</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('NORMAL')}
                disabled={isProcessing}
                className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>คืนสถานะปกติ</span>
              </button>
            </div>

            {/* Quick Bulk Restore */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleRestoreAllToNormal}
                disabled={isProcessing}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-medium uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>รีเซ็ตเครื่องจักรทั้ง 10 เครื่องกลับเป็นสถานะปกติ (NORMAL)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#0A0D14] px-6 py-3 border-t border-[#253248] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
