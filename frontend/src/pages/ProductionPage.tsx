import React, { useState } from 'react';
import { Machine, MachineStatus, AuthUser } from '../types';
import { api } from '../services/api';
import {
  Factory,
  Search,
  Edit3,
  Clock,
  AlertTriangle,
  PauseCircle,
  CheckCircle2,
  MapPin,
  Tag,
  X,
  Save,
  Calendar
} from 'lucide-react';
import { formatLiveDuration } from '../hooks/useRealtimeDashboard';

interface ProductionPageProps {
  machines: Machine[];
  authUser: AuthUser;
  onRefresh: () => void;
  currentTimeMs: number;
}

const toLocalDatetimeInputValue = (isoString: string | null): string => {
  const d = isoString ? new Date(isoString) : new Date();
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

export const ProductionPage: React.FC<ProductionPageProps> = ({
  machines,
  authUser,
  onRefresh,
  currentTimeMs
}) => {
  void currentTimeMs;

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Edit Modal State
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [editStatus, setEditStatus] = useState<MachineStatus>('BREAKDOWN');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editStartTime, setEditStartTime] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredMachines = machines.filter((m) => {
    const matchesSearch =
      m.machine_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.machine_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLoc = selectedLocation === 'ALL' || m.location === selectedLocation;
    const matchesStatus = selectedStatus === 'ALL' || m.status === selectedStatus;
    return matchesSearch && matchesLoc && matchesStatus;
  });

  const handleOpenEditModal = (machine: Machine) => {
    setEditingMachine(machine);
    setEditStatus(machine.status);
    setEditDescription(
      machine.status === 'BREAKDOWN'
        ? machine.breakdown_description || ''
        : machine.status === 'STOPPED'
        ? machine.stop_reason || ''
        : ''
    );
    const existingTime =
      machine.status === 'BREAKDOWN'
        ? machine.breakdown_start_time
        : machine.status === 'STOPPED'
        ? machine.stopped_start_time
        : null;
    setEditStartTime(toLocalDatetimeInputValue(existingTime));
    setFeedback(null);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMachine) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      let desc: string | undefined = undefined;
      let reason: string | undefined = undefined;
      let startTimeIso: string | undefined = undefined;

      if (editStatus === 'BREAKDOWN') {
        desc = editDescription.trim() || 'แจ้งเครื่องจักรขัดข้องจากฝ่าย Production';
        if (editStartTime) {
          startTimeIso = new Date(editStartTime).toISOString();
        }
      } else if (editStatus === 'STOPPED') {
        reason = editDescription.trim() || 'หยุดเครื่องจักรชั่วคราวโดยฝ่าย Production';
        if (editStartTime) {
          startTimeIso = new Date(editStartTime).toISOString();
        }
      }

      await api.updateMachineStatus(
        editingMachine.machine_id,
        editStatus,
        desc,
        reason,
        startTimeIso
      );

      setFeedback({
        type: 'success',
        text: `บันทึกสถานะและเวลาของ ${editingMachine.machine_id} เรียบร้อยแล้ว (ซิงค์ไปยังจอฝ่าย PM ทันที)`
      });
      onRefresh();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: `เกิดข้อผิดพลาด: ${err.message}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDisplayTime = (iso: string | null) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="space-y-6">
      {/* Production Banner */}
      <div className="bg-[#121826] border border-amber-500/40 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40">
            <Factory className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-mono font-bold text-white tracking-wider">
                หน้าจัดการสำหรับฝ่าย PRODUCTION
              </h2>
              <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-mono font-bold text-[10px]">
                {authUser.username}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              แจ้งเครื่องจักรขัดข้อง (BREAKDOWN) หยุดทำงาน (STOPPED) และแก้ไขวันเวลาเริ่มเกิดเหตุของเครื่องจักรได้โดยตรง
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#121826] border border-[#253248] rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหารหัสเครื่องจักร (MC-001...)"
            className="w-full bg-[#060B18] border border-[#253248] rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="bg-[#060B18] border border-[#253248] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
        >
          <option value="ALL">ทุกพื้นที่ (PM1 / PM2)</option>
          <option value="PM1 Shop">PM1 Shop</option>
          <option value="PM1 Overhaul">PM1 Overhaul</option>
          <option value="PM2 Shop">PM2 Shop</option>
          <option value="PM2 Overhaul">PM2 Overhaul</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#060B18] border border-[#253248] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
        >
          <option value="ALL">ทุกสถานะ</option>
          <option value="BREAKDOWN">ขัดข้อง (BREAKDOWN)</option>
          <option value="STOPPED">หยุดทำงาน (STOPPED)</option>
          <option value="NORMAL">ปกติ (NORMAL)</option>
        </select>
      </div>

      {/* Machine Table for Production Editing */}
      <div className="bg-[#121826] border border-[#253248] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#0A0D14] text-slate-400 border-b border-[#253248] uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3.5">เครื่องจักร</th>
                <th className="px-4 py-3.5">พื้นที่</th>
                <th className="px-4 py-3.5">สถานะปัจจุบัน</th>
                <th className="px-4 py-3.5">เวลาเริ่มขัดข้อง / หยุดทำงาน</th>
                <th className="px-4 py-3.5">ระยะเวลาสะสม</th>
                <th className="px-4 py-3.5">รายละเอียด / สาเหตุ</th>
                <th className="px-4 py-3.5 text-right">จัดการข้อมูล</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#253248]/60">
              {filteredMachines.map((m) => {
                const startTime =
                  m.status === 'BREAKDOWN'
                    ? m.breakdown_start_time
                    : m.status === 'STOPPED'
                    ? m.stopped_start_time
                    : null;

                return (
                  <tr key={m.machine_id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white">{m.machine_id}</div>
                      <div className="text-[11px] text-slate-400">{m.machine_name}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">
                      <span className="inline-flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-[#ED1C24]" />
                        <span>{m.location}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {m.status === 'BREAKDOWN' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[#ED1C24]/20 text-[#ED1C24] border border-[#ED1C24]/40 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>ขัดข้อง</span>
                        </span>
                      )}
                      {m.status === 'STOPPED' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold">
                          <PauseCircle className="w-3.5 h-3.5" />
                          <span>หยุดทำงาน</span>
                        </span>
                      )}
                      {m.status === 'NORMAL' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ปกติ</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">
                      {formatDisplayTime(startTime)}
                    </td>
                    <td className="px-4 py-3.5 font-bold">
                      {startTime ? (
                        <span className={m.status === 'BREAKDOWN' ? 'text-[#ED1C24]' : 'text-amber-400'}>
                          {formatLiveDuration(startTime)}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      {m.sr_number && (
                        <div className="text-cyan-400 font-bold flex items-center space-x-1 mb-0.5">
                          <Tag className="w-3 h-3" />
                          <span>{m.sr_number}</span>
                        </div>
                      )}
                      <span className="text-slate-300 line-clamp-2">
                        {m.status === 'BREAKDOWN'
                          ? m.breakdown_description
                          : m.status === 'STOPPED'
                          ? m.stop_reason
                          : 'ทำงานปกติ'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenEditModal(m)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors shadow"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>แก้ไขสถานะ / เวลา</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Breakdown/Stopped Time Modal */}
      {editingMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121826] border-2 border-[#253248] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl font-mono">
            <div className="bg-[#0A0D14] px-6 py-4 border-b border-[#253248] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  แก้ไขข้อมูลเครื่องจักร: {editingMachine.machine_id}
                </h3>
                <p className="text-xs text-slate-400">
                  {editingMachine.machine_name} &bull; {editingMachine.location}
                </p>
              </div>
              <button
                onClick={() => setEditingMachine(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChanges} className="p-6 space-y-4 text-xs">
              {feedback && (
                <div
                  className={`p-3 rounded-xl border ${
                    feedback.type === 'success'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : 'bg-red-950/60 border-[#ED1C24] text-red-200'
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              {/* Status Selector */}
              <div>
                <label className="text-[11px] text-slate-400 uppercase block mb-2">
                  เลือกสถานะเครื่องจักร
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditStatus('BREAKDOWN')}
                    className={`py-2.5 px-2 rounded-xl border-2 font-bold flex flex-col items-center space-y-1 transition-all ${
                      editStatus === 'BREAKDOWN'
                        ? 'bg-[#ED1C24]/20 border-[#ED1C24] text-white'
                        : 'bg-[#0A0D14] border-[#253248] text-slate-400 hover:text-white'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-[#ED1C24]" />
                    <span>ขัดข้อง (BD)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus('STOPPED')}
                    className={`py-2.5 px-2 rounded-xl border-2 font-bold flex flex-col items-center space-y-1 transition-all ${
                      editStatus === 'STOPPED'
                        ? 'bg-amber-500/20 border-amber-500 text-white'
                        : 'bg-[#0A0D14] border-[#253248] text-slate-400 hover:text-white'
                    }`}
                  >
                    <PauseCircle className="w-4 h-4 text-amber-400" />
                    <span>หยุดทำงาน</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus('NORMAL')}
                    className={`py-2.5 px-2 rounded-xl border-2 font-bold flex flex-col items-center space-y-1 transition-all ${
                      editStatus === 'NORMAL'
                        ? 'bg-emerald-500/20 border-emerald-500 text-white'
                        : 'bg-[#0A0D14] border-[#253248] text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>ปกติ (Normal)</span>
                  </button>
                </div>
              </div>

              {/* Start Time Picker (Only for BREAKDOWN or STOPPED) */}
              {editStatus !== 'NORMAL' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] text-slate-400 uppercase flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        เวลาเริ่ม{editStatus === 'BREAKDOWN' ? 'ขัดข้อง' : 'หยุดทำงาน'}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditStartTime(toLocalDatetimeInputValue(null))}
                      className="text-[11px] text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <Clock className="w-3 h-3" />
                      <span>ใช้เวลาปัจจุบัน</span>
                    </button>
                  </div>
                  <input
                    type="datetime-local"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-[#060B18] border border-[#253248] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              {/* Reason / Description */}
              {editStatus !== 'NORMAL' && (
                <div>
                  <label className="text-[11px] text-slate-400 uppercase block mb-1.5">
                    {editStatus === 'BREAKDOWN'
                      ? 'รายละเอียดอาการขัดข้อง (Breakdown Description)'
                      : 'สาเหตุการหยุดทำงาน (Stop Reason)'}
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder={
                      editStatus === 'BREAKDOWN'
                        ? 'ระบุอาการเสีย เช่น มอเตอร์หลักร้อนจัด, ปั๊มไฮดรอลิกรั่ว...'
                        : 'ระบุสาเหตุ เช่น รอเปลี่ยนทูลลิ่ง, ตรวจสอบคุณภาพชิ้นงาน...'
                    }
                    className="w-full bg-[#060B18] border border-[#253248] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMachine(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  ปิดหน้าต่าง
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
