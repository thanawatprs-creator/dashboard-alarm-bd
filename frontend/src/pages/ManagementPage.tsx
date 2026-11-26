import React, { useState } from 'react';
import { Machine, MachineStatus, SimulationStatus } from '../types';
import { api } from '../services/api';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertOctagon,
  PauseCircle,
  MapPin,
  Clock,
  Tag,
  Edit3,
  Eye,
  RefreshCw,
  Send,
  Play,
  Pause,
  AlertTriangle,
  RotateCw,
  Sliders,
  Flame
} from 'lucide-react';
import { formatLiveDuration } from '../hooks/useRealtimeDashboard';

interface ManagementPageProps {
  machines: Machine[];
  onSelectMachine: (machine: Machine) => void;
  onRefresh: () => void;
  simulationStatus: SimulationStatus | null;
  currentTimeMs: number;
}

export const ManagementPage: React.FC<ManagementPageProps> = ({
  machines,
  onSelectMachine,
  onRefresh,
  simulationStatus,
  currentTimeMs
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');

  // Quick edit modal inside management
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [editStatus, setEditStatus] = useState<MachineStatus>('NORMAL');
  const [editReason, setEditReason] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Management simulation action state
  const [isSimProcessing, setIsSimProcessing] = useState<boolean>(false);
  const [simFeedback, setSimFeedback] = useState<string | null>(null);

  // Filter machines
  const filteredMachines = machines.filter((m) => {
    const matchesSearch =
      m.machine_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.machine_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'ALL' || m.status === selectedStatus;

    const matchesLocation =
      selectedLocation === 'ALL' || m.location === selectedLocation;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const handleOpenEdit = (m: Machine, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMachine(m);
    setEditStatus(m.status);
    setEditReason(
      m.status === 'BREAKDOWN'
        ? m.breakdown_description || ''
        : m.status === 'STOPPED'
        ? m.stop_reason || ''
        : ''
    );
    setSaveMessage(null);
  };

  const handleSaveEdit = async () => {
    if (!editingMachine) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      let desc = undefined;
      let reason = undefined;
      if (editStatus === 'BREAKDOWN') {
        desc = editReason.trim() || 'เกิดข้อบกพร่องทางกลไกในการทำงาน';
      } else if (editStatus === 'STOPPED') {
        reason = editReason.trim() || 'หยุดพักเครื่องเพื่อตรวจสอบการซ่อมบำรุง';
      }

      await api.updateMachineStatus(editingMachine.machine_id, editStatus, desc, reason);
      setSaveMessage('บันทึกลง SQLite และส่งสัญญาณสดผ่าน WebSocket สำเร็จ!');
      onRefresh();
      setTimeout(() => {
        setEditingMachine(null);
      }, 700);
    } catch (err: any) {
      setSaveMessage(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Requirement 10: Simulation Controls in Machine Management Page (Isuzu Theme)
  const handleToggleSimulation = async (enabled: boolean) => {
    setIsSimProcessing(true);
    setSimFeedback(null);
    try {
      await api.toggleSimulation(enabled);
      setSimFeedback(`ระบบจำลองสถานะอัตโนมัติ: ${enabled ? 'เริ่มทำงานแล้ว (Start Simulation)' : 'หยุดทำงานแล้ว (Stop Simulation)'}`);
      onRefresh();
    } catch (err: any) {
      setSimFeedback(`Error: ${err.message}`);
    } finally {
      setIsSimProcessing(false);
    }
  };

  const handleSimulateQuickAction = async (action: 'BREAKDOWN' | 'STOPPED' | 'NORMAL', machineId?: string) => {
    setIsSimProcessing(true);
    setSimFeedback(null);
    try {
      await api.triggerSimulation(action, machineId);
      setSimFeedback(`ส่งคำสั่ง [${action}] ไปยัง SQLite และ Broadcast WebSocket สดเรียบร้อย!`);
      onRefresh();
    } catch (err: any) {
      setSimFeedback(`Error: ${err.message}`);
    } finally {
      setIsSimProcessing(false);
    }
  };

  const handleRestoreAll = async () => {
    setIsSimProcessing(true);
    setSimFeedback(null);
    try {
      for (const m of machines) {
        if (m.status !== 'NORMAL') {
          await api.updateMachineStatus(m.machine_id, 'NORMAL');
        }
      }
      setSimFeedback('คืนค่าเครื่องจักรทุกเครื่องสู่สถานะปกติ (NORMAL) ครบถ้วนแล้ว');
      onRefresh();
    } catch (err: any) {
      setSimFeedback(`Error: ${err.message}`);
    } finally {
      setIsSimProcessing(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Page Header (Isuzu Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-white tracking-wider flex items-center space-x-2">
            <span>การจัดการเครื่องจักร (MACHINE FLEET MANAGEMENT)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ED1C24]/20 text-[#ED1C24] border border-[#ED1C24]/30 font-mono font-bold">
              10 เครื่องในระบบ ISUZU
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            ค้นหา กรองสถานะ ตรวจสอบข้อมูลเทเลเมทรี และควบคุมการจำลองสถานะแบบเรียลไทม์
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>ซิงค์ข้อมูล</span>
        </button>
      </div>

      {/* Requirement 10: Dedicated Simulation Controls Panel inside Machine Management */}
      <div className="industrial-card rounded-2xl p-5 border-2 border-[#ED1C24]/50 bg-[#121826] space-y-3.5 shadow-xl shadow-[#ED1C24]/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#253248] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ED1C24]/20 border border-[#ED1C24] flex items-center justify-center text-[#ED1C24]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold text-white tracking-wide">
                แผงควบคุมการจำลองสถานะเครื่องจักร (SIMULATION CONTROLS)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                ควบคุมการทำงานของ Background Machine Simulator &bull; อัปเดต SQLite และ Broadcast ผ่าน WebSocket ทันที
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {simulationStatus?.enabled ? (
              <button
                type="button"
                onClick={() => handleToggleSimulation(false)}
                disabled={isSimProcessing}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#ED1C24] hover:bg-[#C41219] text-white font-mono text-xs font-bold transition-all shadow-md shadow-[#ED1C24]/30 disabled:opacity-50"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Stop Simulation (หยุดการจำลอง)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggleSimulation(true)}
                disabled={isSimProcessing}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Simulation (เริ่มการจำลอง)</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback message */}
        {simFeedback && (
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono">
            {simFeedback}
          </div>
        )}

        {/* Action Trigger Buttons (Isuzu Themed) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => handleSimulateQuickAction('BREAKDOWN')}
            disabled={isSimProcessing}
            className="py-2.5 px-3 rounded-xl bg-[#ED1C24]/10 hover:bg-[#ED1C24]/20 text-red-300 border border-[#ED1C24]/40 font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-all disabled:opacity-50 shadow-sm"
          >
            <AlertTriangle className="w-4 h-4 text-[#ED1C24]" />
            <span>Simulate Breakdown (จำลองขัดข้อง)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSimulateQuickAction('STOPPED')}
            disabled={isSimProcessing}
            className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-all disabled:opacity-50 shadow-sm"
          >
            <PauseCircle className="w-4 h-4 text-amber-400" />
            <span>Simulate Stopped (จำลองหยุดเครื่อง)</span>
          </button>

          <button
            type="button"
            onClick={() => handleRestoreAll()}
            disabled={isSimProcessing}
            className="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-all disabled:opacity-50 shadow-sm"
          >
            <RotateCw className="w-4 h-4 text-emerald-400" />
            <span>Restore to Normal (คืนสถานะปกติทั้งหมด)</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="industrial-card rounded-2xl p-4 border border-[#253248] grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาด้วยรหัสเครื่อง (เช่น MC-001) หรือชื่อ..."
            className="w-full bg-[#0A0D14] border border-[#253248] rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#ED1C24]"
          />
        </div>

        {/* Filter by Status */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-[#0A0D14] border border-[#253248] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ED1C24]"
          >
            <option value="ALL">ทุกสถานะ (ปกติ, ขัดข้อง, หยุดทำงาน)</option>
            <option value="NORMAL">ปกติ (NORMAL)</option>
            <option value="BREAKDOWN">ขัดข้อง (BREAKDOWN)</option>
            <option value="STOPPED">หยุดทำงาน (STOPPED)</option>
          </select>
        </div>

        {/* Filter by Location */}
        <div>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full bg-[#0A0D14] border border-[#253248] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ED1C24]"
          >
            <option value="ALL">ทุกพื้นที่ (PM1 Shop, Overhaul, PM2...)</option>
            <option value="PM1 Shop">PM1 Shop</option>
            <option value="PM1 Overhaul">PM1 Overhaul</option>
            <option value="PM2 Shop">PM2 Shop</option>
            <option value="PM2 Overhaul">PM2 Overhaul</option>
          </select>
        </div>
      </div>

      {/* Machine Table / Detailed Card List */}
      <div className="industrial-card rounded-2xl border border-[#253248] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0A0D14] text-slate-400 uppercase tracking-wider border-b border-[#253248]">
              <tr>
                <th className="px-4 py-3.5">เครื่องจักร</th>
                <th className="px-4 py-3.5">ตำแหน่ง</th>
                <th className="px-4 py-3.5">สถานะ</th>
                <th className="px-4 py-3.5">อาการขัดข้อง / เหตุผล</th>
                <th className="px-4 py-3.5">หมายเลข SR</th>
                <th className="px-4 py-3.5">ระยะเวลา Downtime (สด)</th>
                <th className="px-4 py-3.5">ซิงค์ล่าสุด</th>
                <th className="px-4 py-3.5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#253248]">
              {filteredMachines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    ไม่พบเครื่องจักรที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredMachines.map((m) => {
                  const liveDowntime = formatLiveDuration(m.breakdown_start_time);
                  const liveStopped = formatLiveDuration(m.stopped_start_time);

                  return (
                    <tr
                      key={m.machine_id}
                      onClick={() => onSelectMachine(m)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Machine ID & Name */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white text-sm group-hover:text-[#ED1C24] transition-colors">
                          {m.machine_id}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans">
                          {m.machine_name}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center space-x-1 text-slate-300">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{m.location}</span>
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3.5">
                        {m.status === 'BREAKDOWN' ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ED1C24]/20 text-[#ED1C24] border border-[#ED1C24]/40 animate-pulse">
                            <AlertOctagon className="w-3 h-3 text-[#ED1C24]" />
                            <span>ขัดข้อง (BREAKDOWN)</span>
                          </span>
                        ) : m.status === 'STOPPED' ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                            <PauseCircle className="w-3 h-3 text-amber-500" />
                            <span>หยุดทำงาน (STOPPED)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>ปกติ (NORMAL)</span>
                          </span>
                        )}
                      </td>

                      {/* Diagnostic / Reason */}
                      <td className="px-4 py-3.5 max-w-xs">
                        {m.status === 'BREAKDOWN' ? (
                          <span className="text-red-300 line-clamp-1" title={m.breakdown_description || ''}>
                            {m.breakdown_description || '-'}
                          </span>
                        ) : m.status === 'STOPPED' ? (
                          <span className="text-amber-300 line-clamp-1" title={m.stop_reason || ''}>
                            {m.stop_reason || '-'}
                          </span>
                        ) : (
                          <span className="text-slate-500">เครื่องจักรทำงานปกติ</span>
                        )}
                      </td>

                      {/* SR Number */}
                      <td className="px-4 py-3.5">
                        {m.sr_number ? (
                          <span className="text-cyan-400 font-bold flex items-center space-x-1">
                            <Tag className="w-3 h-3 text-cyan-500" />
                            <span>{m.sr_number}</span>
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Live Ticking Downtime */}
                      <td className="px-4 py-3.5">
                        {m.status === 'BREAKDOWN' ? (
                          <span className="text-[#ED1C24] font-bold flex items-center space-x-1">
                            <Flame className="w-3 h-3 text-[#ED1C24] animate-pulse" />
                            <span>{liveDowntime}</span>
                          </span>
                        ) : m.status === 'STOPPED' ? (
                          <span className="text-amber-400 font-bold">{liveStopped}</span>
                        ) : (
                          <span className="text-slate-600">0 วินาที</span>
                        )}
                      </td>

                      {/* Last Updated */}
                      <td className="px-4 py-3.5 text-slate-400">
                        {formatTime(m.last_updated)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={(e) => handleOpenEdit(m, e)}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors"
                            title="แก้ไขสถานะใน SQLite ทันที"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSelectMachine(m)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="ดูรายละเอียดเทเลเมทรี"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inline Quick Edit Status Modal */}
      {editingMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121826] border-2 border-[#ED1C24] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#253248] pb-3">
              <div>
                <h3 className="text-base font-mono font-bold text-white uppercase">
                  เปลี่ยนสถานะ: {editingMachine.machine_id}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {editingMachine.machine_name} &bull; {editingMachine.location}
                </p>
              </div>
              <button
                onClick={() => setEditingMachine(null)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            {saveMessage && (
              <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-mono">
                {saveMessage}
              </div>
            )}

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 uppercase font-bold block mb-1">
                  เลือกสถานะเป้าหมาย:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['NORMAL', 'BREAKDOWN', 'STOPPED'] as MachineStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStatus(st)}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all ${
                        editStatus === st
                          ? st === 'NORMAL'
                            ? 'bg-emerald-600 text-white border-emerald-400'
                            : st === 'BREAKDOWN'
                            ? 'bg-[#ED1C24] text-white border-[#ED1C24]'
                            : 'bg-amber-600 text-white border-amber-400'
                          : 'bg-[#0A0D14] border-[#253248] text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {st === 'NORMAL' ? 'ปกติ' : st === 'BREAKDOWN' ? 'ขัดข้อง' : 'หยุดทำงาน'}
                    </button>
                  ))}
                </div>
              </div>

              {editStatus !== 'NORMAL' && (
                <div>
                  <label className="text-slate-400 uppercase font-bold block mb-1">
                    {editStatus === 'BREAKDOWN' ? 'อาการขัดข้อง (Fault Description):' : 'เหตุผลการหยุดเครื่อง (Stop Reason):'}
                  </label>
                  <input
                    type="text"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="กรอกรายละเอียด..."
                    className="w-full bg-[#0A0D14] border border-[#253248] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ED1C24]"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#253248]">
              <button
                onClick={() => setEditingMachine(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono hover:bg-slate-700"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-4 py-1.5 rounded-xl bg-[#ED1C24] text-white text-xs font-mono font-bold hover:bg-[#C41219] flex items-center space-x-1.5 disabled:opacity-50 shadow-md shadow-[#ED1C24]/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>บันทึกลง SQLite และ Broadcast</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
