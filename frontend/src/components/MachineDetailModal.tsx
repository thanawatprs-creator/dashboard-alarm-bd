import React, { useState, useEffect } from 'react';
import { Machine, MachineStatus, AlarmHistoryItem } from '../types';
import { api } from '../services/api';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  PauseCircle,
  Tag,
  MapPin,
  Clock,
  Wrench,
  RotateCcw,
  History,
  Send,
  Calendar,
  Flame
} from 'lucide-react';
import { formatLiveDuration } from '../hooks/useRealtimeDashboard';

interface MachineDetailModalProps {
  machine: Machine | null;
  onClose: () => void;
  onStatusUpdated: () => void;
  currentTimeMs: number;
}

export const MachineDetailModal: React.FC<MachineDetailModalProps> = ({
  machine,
  onClose,
  onStatusUpdated,
  currentTimeMs
}) => {
  if (!machine) return null;

  const [activeTab, setActiveTab] = useState<'info' | 'actions' | 'history'>('info');
  const [historyItems, setHistoryItems] = useState<AlarmHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  
  // Action form state
  const [actionStatus, setActionStatus] = useState<MachineStatus>('NORMAL');
  const [customText, setCustomText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (machine) {
      loadMachineHistory();
      setActionStatus(machine.status);
      setCustomText('');
      setActionMessage(null);
    }
  }, [machine?.machine_id]);

  const loadMachineHistory = async () => {
    if (!machine) return;
    setLoadingHistory(true);
    try {
      const items = await api.getAlarmHistory({ machine_id: machine.machine_id, limit: 15 });
      setHistoryItems(items);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleUpdateStatus = async (targetStatus: MachineStatus) => {
    if (!machine) return;
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      let desc = undefined;
      let reason = undefined;
      if (targetStatus === 'BREAKDOWN') {
        desc = customText.trim() || 'เกิดความดันไฮดรอลิกลดลงต่ำกว่าเกณฑ์ในกระบอกสูบหลัก';
      } else if (targetStatus === 'STOPPED') {
        reason = customText.trim() || 'หยุดตรวจสอบซ่อมบำรุงตามระยะและเปลี่ยนซีลกันรั่ว';
      }
      await api.updateMachineStatus(machine.machine_id, targetStatus, desc, reason);
      setActionMessage(`บันทึกการเปลี่ยนสถานะเครื่องจักรเป็น ${targetStatus} เรียบร้อยแล้ว (อัปเดต SQLite และ Broadcast ผ่าน WebSocket)`);
      onStatusUpdated();
      loadMachineHistory();
    } catch (err: any) {
      setActionMessage(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch {
      return isoString;
    }
  };

  const liveDowntime = formatLiveDuration(machine.breakdown_start_time);
  const liveStopped = formatLiveDuration(machine.stopped_start_time);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#121826] border-2 border-[#253248] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header (Isuzu Brand Header) */}
        <div className="bg-[#0A0D14] px-6 py-4 border-b border-[#253248] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#ED1C24]/10 border-2 border-[#ED1C24] flex items-center justify-center font-mono font-black text-[#ED1C24] text-lg">
              {machine.machine_id.split('-')[1] || '00'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-mono font-bold text-white tracking-wider">
                  {machine.machine_id} – {machine.machine_name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {machine.location}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                ISUZU PM SHOP &bull; เทเลเมทรีเครื่องจักร &bull; SQLite ID #{machine.id}
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

        {/* Tab Selector (Isuzu Red Active) */}
        <div className="flex border-b border-[#253248] bg-[#0E131F] px-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition-all ${
              activeTab === 'info'
                ? 'border-[#ED1C24] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ข้อมูลเครื่องจักร
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`py-3 px-4 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition-all ${
              activeTab === 'actions'
                ? 'border-[#ED1C24] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            เปลี่ยนสถานะด้วยตนเอง (Manual Override)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-[#ED1C24] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ประวัติการแจ้งเตือน
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  machine.status === 'BREAKDOWN'
                    ? 'bg-[#ED1C24]/10 border-[#ED1C24] text-red-200'
                    : machine.status === 'STOPPED'
                    ? 'bg-amber-950/30 border-amber-500/50 text-amber-400'
                    : 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {machine.status === 'BREAKDOWN' ? (
                    <AlertTriangle className="w-8 h-8 animate-pulse text-[#ED1C24]" />
                  ) : machine.status === 'STOPPED' ? (
                    <PauseCircle className="w-8 h-8 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  )}
                  <div>
                    <div className="font-mono font-black text-lg tracking-wider">
                      สถานะ: {machine.status === 'BREAKDOWN' ? 'ขัดข้อง (BREAKDOWN)' : machine.status === 'STOPPED' ? 'หยุดทำงาน (STOPPED)' : 'ปกติ (NORMAL)'}
                    </div>
                    <div className="text-xs opacity-90 font-mono">
                      {machine.status === 'BREAKDOWN'
                        ? 'ตรวจพบข้อผิดพลาดรุนแรง – ออกหมายเลข SR สำหรับช่าง PM แล้ว'
                        : machine.status === 'STOPPED'
                        ? 'เครื่องจักรหยุดพักชั่วคราวเพื่อการตรวจเช็กหรือปรับแต่ง'
                        : 'เครื่องจักรเดินระบบสมบูรณ์ 100%'}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs uppercase opacity-75">ระยะเวลาสด (Live Ticker)</div>
                  <div className="text-xl font-bold flex items-center justify-end space-x-1">
                    {machine.status === 'BREAKDOWN' && <Flame className="w-4 h-4 text-[#ED1C24] animate-pulse" />}
                    <span>
                      {machine.status === 'BREAKDOWN'
                        ? liveDowntime
                        : machine.status === 'STOPPED'
                        ? liveStopped
                        : '0 วินาที'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#0A0D14] border border-[#253248]">
                  <div className="text-slate-400 text-[10px] uppercase">ตำแหน่งติดตั้ง (Location)</div>
                  <div className="text-sm font-semibold text-white mt-0.5 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-[#ED1C24]" />
                    <span>{machine.location}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0A0D14] border border-[#253248]">
                  <div className="text-slate-400 text-[10px] uppercase">หมายเลข Service Request (SR)</div>
                  <div className="text-sm font-semibold text-cyan-400 mt-0.5 flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{machine.sr_number || 'ไม่มี (สถานะปกติ)'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0A0D14] border border-[#253248]">
                  <div className="text-slate-400 text-[10px] uppercase">เวลาที่เริ่มขัดข้อง</div>
                  <div className="text-xs text-white mt-0.5">
                    {formatDateTime(machine.breakdown_start_time)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0A0D14] border border-[#253248]">
                  <div className="text-slate-400 text-[10px] uppercase">เวลาที่เริ่มหยุดเครื่อง</div>
                  <div className="text-xs text-white mt-0.5">
                    {formatDateTime(machine.stopped_start_time)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0A0D14] border border-[#253248] sm:col-span-2">
                  <div className="text-slate-400 text-[10px] uppercase">อัปเดตฐานข้อมูล SQLite ล่าสุด</div>
                  <div className="text-xs text-slate-300 mt-0.5 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatDateTime(machine.last_updated)}</span>
                  </div>
                </div>
              </div>

              {/* Breakdown Description / Stop Reason */}
              {machine.breakdown_description && (
                <div className="p-3.5 rounded-xl bg-[#ED1C24]/10 border border-[#ED1C24]/40 text-xs font-mono">
                  <div className="text-[10px] text-[#ED1C24] uppercase font-bold tracking-wider mb-1">
                    อาการขัดข้อง (FAULT DIAGNOSTIC):
                  </div>
                  <div className="text-red-200 leading-relaxed">
                    {machine.breakdown_description}
                  </div>
                </div>
              )}

              {machine.stop_reason && (
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs font-mono">
                  <div className="text-[10px] text-amber-400 uppercase font-bold tracking-wider mb-1">
                    เหตุผลการหยุดพักเครื่อง (STOPPED REASON):
                  </div>
                  <div className="text-amber-200 leading-relaxed">
                    {machine.stop_reason}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#161F33] border border-[#253248] rounded-xl text-xs font-mono text-slate-300">
                <strong>Isuzu PM Shop Control:</strong> คุณสามารถจำลองเหตุการณ์ขัดข้อง หรือคืนค่าเครื่องจักรได้ทันที ระบบจะบันทึกลง SQLite และบรอดแคสต์ผ่าน WebSocket สดไปยังทุกหน้าจอพร้อมกัน
              </div>

              {actionMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                  {actionMessage}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-slate-300 font-bold">
                  เลือกสถานะเป้าหมาย:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionStatus('NORMAL')}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                      actionStatus === 'NORMAL'
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-emerald-950/20 border-emerald-800 text-emerald-400 hover:bg-emerald-950/40'
                    }`}
                  >
                    NORMAL (ปกติ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionStatus('BREAKDOWN')}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                      actionStatus === 'BREAKDOWN'
                        ? 'bg-[#ED1C24] text-white border-[#ED1C24]'
                        : 'bg-red-950/20 border-red-800 text-red-400 hover:bg-red-950/40'
                    }`}
                  >
                    BREAKDOWN (ขัดข้อง)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionStatus('STOPPED')}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                      actionStatus === 'STOPPED'
                        ? 'bg-amber-600 text-white border-amber-400'
                        : 'bg-amber-950/20 border-amber-800 text-amber-400 hover:bg-amber-950/40'
                    }`}
                  >
                    STOPPED (หยุดทำงาน)
                  </button>
                </div>
              </div>

              {actionStatus !== 'NORMAL' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-slate-300 font-bold">
                    {actionStatus === 'BREAKDOWN' ? 'ระบุอาการขัดข้อง (Breakdown Description):' : 'ระบุเหตุผลการหยุดเครื่อง (Stop Reason):'}
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder={
                      actionStatus === 'BREAKDOWN'
                        ? 'เช่น แรงดันไฮดรอลิกลดลงต่ำกว่าเกณฑ์ความปลอดภัย'
                        : 'เช่น การตรวจซ่อมบำรุงประจำสัปดาห์และหล่อลื่น'
                    }
                    className="w-full bg-[#0A0D14] border border-[#253248] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#ED1C24]"
                  />
                </div>
              )}

              <button
                onClick={() => handleUpdateStatus(actionStatus)}
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#ED1C24] hover:bg-[#C41219] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all disabled:opacity-50 shadow-lg shadow-[#ED1C24]/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>บันทึกสถานะและบรอดแคสต์ WebSocket สด</span>
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>ประวัติเหตุการณ์ของเครื่องจักรนี้</span>
                <span>{historyItems.length} รายการ</span>
              </div>

              {loadingHistory ? (
                <div className="text-center py-6 text-xs font-mono text-slate-400">
                  กำลังโหลดประวัติ...
                </div>
              ) : historyItems.length === 0 ? (
                <div className="text-center py-6 text-xs font-mono text-slate-500">
                  ไม่มีประวัติการบันทึกสถานะของเครื่องจักรนี้ในระบบ
                </div>
              ) : (
                <div className="space-y-2">
                  {historyItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-[#0A0D14] border border-[#253248] text-xs font-mono"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.new_status === 'BREAKDOWN'
                                ? 'bg-[#ED1C24]/20 text-[#ED1C24]'
                                : item.new_status === 'STOPPED'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {item.new_status}
                          </span>
                          <span className="text-slate-400">&larr; เดิมเป็น {item.previous_status}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {formatDateTime(item.event_timestamp)}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        {item.event_description}
                      </p>
                      {item.sr_number && (
                        <div className="mt-1 text-[10px] text-cyan-400 font-semibold">
                          SR Tag: {item.sr_number}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#0A0D14] px-6 py-3 border-t border-[#253248] flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            รหัสเครื่องจักร: <span className="text-white font-bold">{machine.machine_id}</span>
          </span>
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
