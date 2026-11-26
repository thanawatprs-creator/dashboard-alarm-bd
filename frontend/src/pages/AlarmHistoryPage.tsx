import React, { useState, useEffect } from 'react';
import { AlarmHistoryItem } from '../types';
import { api } from '../services/api';
import {
  History,
  Filter,
  Download,
  Calendar,
  Tag,
  MapPin,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  PauseCircle,
  Clock
} from 'lucide-react';

export const AlarmHistoryPage: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<AlarmHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Convert local date strings (YYYY-MM-DD) to ISO format with local time boundaries
      const formattedStartDate = startDate
        ? new Date(`${startDate}T00:00:00`).toISOString()
        : undefined;
      const formattedEndDate = endDate
        ? new Date(`${endDate}T23:59:59.999`).toISOString()
        : undefined;

      const items = await api.getAlarmHistory({
        machine_id: selectedMachine || undefined,
        status: selectedStatus || undefined,
        location: selectedLocation || undefined,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        limit: 200
      });
      setHistoryItems(items);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [selectedMachine, selectedStatus, selectedLocation, startDate, endDate]);

  const handleResetFilters = () => {
    setSelectedMachine('');
    setSelectedStatus('');
    setSelectedLocation('');
    setStartDate('');
    setEndDate('');
  };

  const handleSetDatePreset = (preset: 'today' | 'yesterday' | '7days' | '30days' | 'all') => {
    const now = new Date();
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (preset === 'today') {
      const todayStr = formatDate(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'yesterday') {
      const yest = new Date(now);
      yest.setDate(yest.getDate() - 1);
      const yestStr = formatDate(yest);
      setStartDate(yestStr);
      setEndDate(yestStr);
    } else if (preset === '7days') {
      const past7 = new Date(now);
      past7.setDate(past7.getDate() - 7);
      setStartDate(formatDate(past7));
      setEndDate(formatDate(now));
    } else if (preset === '30days') {
      const past30 = new Date(now);
      past30.setDate(past30.getDate() - 30);
      setStartDate(formatDate(past30));
      setEndDate(formatDate(now));
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleExportCSV = () => {
    if (historyItems.length === 0) return;
    const headers = [
      'Event ID',
      'Machine ID',
      'Machine Name',
      'Location',
      'Previous Status',
      'New Status',
      'SR Number',
      'Event Description',
      'Timestamp'
    ];
    const rows = historyItems.map((h) => [
      h.id,
      h.machine_id,
      `"${h.machine_name}"`,
      `"${h.location}"`,
      h.previous_status,
      h.new_status,
      h.sr_number || '',
      `"${(h.event_description || '').replace(/"/g, '""')}"`,
      h.event_timestamp
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `alarm_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateTime = (isoString: string) => {
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

  return (
    <div className="space-y-6">
      {/* Page Title & Export (Thai) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-white tracking-wider flex items-center space-x-2">
            <History className="w-5 h-5 text-cyan-400" />
            <span>ประวัติการแจ้งเตือนและการเปลี่ยนสถานะ (ALARM HISTORY)</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            บันทึกการตรวจสอบย้อนกลับของการเปลี่ยนสถานะเครื่องจักร &bull; จัดเก็บอย่างถาวรในตาราง SQLite <code>alarm_history</code>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            disabled={historyItems.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออกไฟล์ CSV</span>
          </button>
          <button
            onClick={loadHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 text-xs font-mono transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>รีเฟรช</span>
          </button>
        </div>
      </div>

      {/* Filter Panel (Thai) */}
      <div className="industrial-card rounded-xl p-4 border border-[#1C2541] space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between text-slate-400 font-bold uppercase">
          <span className="flex items-center space-x-1.5">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>ตัวกรองประวัติเหตุการณ์</span>
          </span>
          <button
            onClick={handleResetFilters}
            className="text-cyan-400 hover:underline capitalize font-normal"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Machine Filter */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase block mb-1">
              รหัสเครื่องจักร:
            </label>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="w-full bg-[#060B18] border border-[#1C2541] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="">ทุกเครื่องจักร (MC-001 ... MC-010)</option>
              {Array.from({ length: 10 }, (_, i) => {
                const id = `MC-${String(i + 1).padStart(3, '0')}`;
                return (
                  <option key={id} value={id}>
                    {id} – Machine {String(i + 1).padStart(2, '0')}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase block mb-1">
              สถานะเป้าหมาย:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#060B18] border border-[#1C2541] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="">ทุกสถานะ</option>
              <option value="BREAKDOWN">ขัดข้อง (BREAKDOWN)</option>
              <option value="STOPPED">หยุดทำงาน (STOPPED)</option>
              <option value="NORMAL">ปกติ (NORMAL)</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase block mb-1">
              ตำแหน่งติดตั้ง:
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-[#060B18] border border-[#1C2541] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="">ทุกพื้นที่</option>
              <option value="PM1 Shop">PM1 Shop</option>
              <option value="PM1 Overhaul">PM1 Overhaul</option>
              <option value="PM2 Shop">PM2 Shop</option>
              <option value="PM2 Overhaul">PM2 Overhaul</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase block mb-1 flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-[#ED1C24]" />
              <span>ตั้งแต่วันที่:</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ colorScheme: 'dark' }}
              className="w-full bg-[#060B18] border border-[#1C2541] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#ED1C24] transition-colors cursor-pointer"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase block mb-1 flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-[#ED1C24]" />
              <span>ถึงวันที่:</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ colorScheme: 'dark' }}
              className="w-full bg-[#060B18] border border-[#1C2541] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#ED1C24] transition-colors cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Date Presets */}
        <div className="pt-2 border-t border-[#1C2541]/70 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>ช่วงเวลาด่วน:</span>
          </span>
          <button
            type="button"
            onClick={() => handleSetDatePreset('today')}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
              startDate && startDate === endDate && startDate === new Date().toISOString().slice(0, 10)
                ? 'bg-[#ED1C24] text-white font-bold'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
            }`}
          >
            วันนี้
          </button>
          <button
            type="button"
            onClick={() => handleSetDatePreset('yesterday')}
            className="px-2.5 py-1 rounded text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            เมื่อวาน
          </button>
          <button
            type="button"
            onClick={() => handleSetDatePreset('7days')}
            className="px-2.5 py-1 rounded text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            7 วันล่าสุด
          </button>
          <button
            type="button"
            onClick={() => handleSetDatePreset('30days')}
            className="px-2.5 py-1 rounded text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            30 วันล่าสุด
          </button>
          <button
            type="button"
            onClick={() => handleSetDatePreset('all')}
            className="px-2.5 py-1 rounded text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            ทั้งหมด (ไม่จำกัดวัน)
          </button>
        </div>
      </div>

      {/* History Log Table */}
      <div className="industrial-card rounded-xl border border-[#1C2541] overflow-hidden">
        <div className="px-4 py-3 bg-[#060B18] border-b border-[#1C2541] flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            จำนวนเหตุการณ์ที่พบ: <strong className="text-white">{historyItems.length}</strong> รายการ
          </span>
          <span className="text-slate-500">บันทึกสด SQLite Audit Trail</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#090F24] text-slate-400 uppercase tracking-wider border-b border-[#1C2541]">
              <tr>
                <th className="px-4 py-3">เวลาที่เกิดเหตุการณ์</th>
                <th className="px-4 py-3">เครื่องจักร</th>
                <th className="px-4 py-3">ตำแหน่ง</th>
                <th className="px-4 py-3">การเปลี่ยนสถานะ</th>
                <th className="px-4 py-3">หมายเลข SR</th>
                <th className="px-4 py-3">รายละเอียดเหตุการณ์</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2541]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    กำลังโหลดประวัติเหตุการณ์...
                  </td>
                </tr>
              ) : historyItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    ไม่พบข้อมูลประวัติการแจ้งเตือนตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                historyItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Timestamp */}
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {formatDateTime(item.event_timestamp)}
                    </td>

                    {/* Machine */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-white">{item.machine_id}</div>
                      <div className="text-[11px] text-slate-400">{item.machine_name}</div>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                      {item.location}
                    </td>

                    {/* Transition Badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.new_status === 'BREAKDOWN'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : item.new_status === 'STOPPED'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {item.new_status === 'BREAKDOWN' ? 'ขัดข้อง' : item.new_status === 'STOPPED' ? 'หยุดทำงาน' : 'ปกติ'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          (&larr; {item.previous_status})
                        </span>
                      </div>
                    </td>

                    {/* SR Number */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.sr_number ? (
                        <span className="text-cyan-400 font-bold flex items-center space-x-1">
                          <Tag className="w-3 h-3 text-cyan-500" />
                          <span>{item.sr_number}</span>
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3 text-slate-200 max-w-md">
                      {item.event_description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
