import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Clock,
  RefreshCw,
  Sliders,
  Server,
  Layers,
  FileText,
  Radio,
  Wifi,
  WifiOff
} from 'lucide-react';
import { WebSocketConnectionStatus } from '../types';

interface HeaderProps {
  currentTab: 'dashboard' | 'management' | 'history';
  onSelectTab: (tab: 'dashboard' | 'management' | 'history') => void;
  lastUpdated: string | null;
  onRefresh: () => void;
  connectionStatus: WebSocketConnectionStatus;
  onOpenSimulation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  lastUpdated,
  onRefresh,
  connectionStatus,
  onOpenSimulation
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
      setCurrentDate(
        now.toLocaleDateString('th-TH', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatLastUpdated = (isoString: string | null) => {
    if (!isoString) return '--:--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const getConnectionConfig = () => {
    switch (connectionStatus) {
      case 'CONNECTED':
        return {
          label: 'เชื่อมต่อเรียลไทม์แล้ว (Connected)',
          badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          dotClass: 'bg-emerald-400 status-glow-green animate-pulse',
          icon: <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        };
      case 'RECONNECTING':
        return {
          label: 'กำลังเชื่อมต่อใหม่... (Reconnecting)',
          badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse',
          dotClass: 'bg-amber-400 status-glow-yellow animate-ping',
          icon: <Radio className="w-3.5 h-3.5 text-amber-400 animate-spin" />
        };
      case 'DISCONNECTED':
        return {
          label: 'ขาดการเชื่อมต่อ (Disconnected)',
          badgeClass: 'bg-[#ED1C24]/20 text-[#ED1C24] border-[#ED1C24]/40',
          dotClass: 'bg-[#ED1C24] status-glow-red',
          icon: <WifiOff className="w-3.5 h-3.5 text-[#ED1C24]" />
        };
    }
  };

  const conn = getConnectionConfig();

  return (
    <header className="bg-[#0E131F] border-b border-[#253248] sticky top-0 z-40 shadow-2xl">
      {/* Top Banner: Isuzu Engine Notice & Demo Warning */}
      <div className="bg-[#121826] border-b border-[#253248] px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-300 font-medium gap-2">
        <div className="flex items-center space-x-2">
          {/* Isuzu Red Corporate Tag */}
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#ED1C24] text-white font-mono font-black tracking-wider uppercase text-[10px] shadow-sm">
            ISUZU ENGINE
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold tracking-wider uppercase border border-amber-500/40 text-[10px]">
            DEMO MODE
          </span>
          <span className="text-[11px] sm:text-xs text-slate-400">
            ระบบจำลองเครื่องจักรขัดข้อง &bull; SQLite Data Engine &bull; ไม่ได้เชื่อมต่อกับ IBM Maximo
          </span>
        </div>
        <div className="flex items-center space-x-3 text-slate-400 text-xs">
          <span className="hidden md:inline text-slate-400">Isuzu Engine Manufacturing (Thailand) Co., Ltd.</span>
          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-bold ${conn.badgeClass}`}>
            <span className={`w-2 h-2 rounded-full ${conn.dotClass}`}></span>
            <span>{conn.label}</span>
          </span>
        </div>
      </div>

      {/* Main Header Bar with Isuzu Logo & Red Highlights */}
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-3 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Isuzu Logo and Dashboard Identity */}
        <div className="flex items-center space-x-4 w-full lg:w-auto">
          {/* Brand Logo Container */}
          <div className="h-12 px-3 rounded-xl bg-white flex items-center justify-center border-2 border-[#ED1C24] shadow-md shadow-[#ED1C24]/10 overflow-hidden">
            <img
              src="/isuzu-featured.webp"
              alt="ISUZU Logo"
              className="h-8 max-w-[140px] object-contain"
              onError={(e) => {
                // Fallback to isuzu-logo.webp if featured fails
                (e.target as HTMLImageElement).src = '/isuzu-logo.webp';
              }}
            />
          </div>

          <div className="border-l border-slate-700/80 pl-3">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl lg:text-2xl font-black tracking-wider text-white font-mono uppercase flex items-center space-x-1.5">
                <span className="text-[#ED1C24]">ALARM BD</span>
                <span className="text-slate-200">MONITORING</span>
              </h1>
              <span className="text-xs px-2 py-0.5 rounded bg-[#ED1C24]/20 text-[#ED1C24] border border-[#ED1C24]/40 font-mono font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ED1C24] animate-ping"></span>
                <span>REAL-TIME</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono tracking-wide">
              ระบบตรวจจับการแจ้งเตือนเครื่องจักรขัดข้อง &bull; PM SHOP MAINTENANCE
            </p>
          </div>
        </div>

        {/* Center: Navigation Tabs (Isuzu Themed) */}
        <div className="flex items-center bg-[#0A0D14] p-1 rounded-xl border border-[#253248] w-full sm:w-auto justify-center">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all ${
              currentTab === 'dashboard'
                ? 'bg-[#ED1C24] text-white shadow-lg shadow-[#ED1C24]/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>แดชบอร์ดหลัก</span>
          </button>
          <button
            onClick={() => onSelectTab('management')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all ${
              currentTab === 'management'
                ? 'bg-[#ED1C24] text-white shadow-lg shadow-[#ED1C24]/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>จัดการเครื่องจักร (10 เครื่อง)</span>
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all ${
              currentTab === 'history'
                ? 'bg-[#ED1C24] text-white shadow-lg shadow-[#ED1C24]/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>ประวัติการแจ้งเตือน</span>
          </button>
        </div>

        {/* Right: Digital Clock & Isuzu Controls */}
        <div className="flex items-center space-x-3 w-full lg:w-auto justify-end">
          {/* Simulation Console Trigger */}
          <button
            onClick={onOpenSimulation}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#ED1C24]/10 hover:bg-[#ED1C24]/20 border border-[#ED1C24]/30 text-red-300 text-xs font-mono font-medium transition-all"
            title="เปิดแผงควบคุมการจำลองข้อมูล"
          >
            <Sliders className="w-3.5 h-3.5 text-[#ED1C24]" />
            <span className="hidden sm:inline">ควบคุมการจำลอง</span>
          </button>

          {/* Sync Button */}
          <div className="flex items-center space-x-2 bg-[#0A0D14] px-3 py-1.5 rounded-lg border border-[#253248]">
            <button
              onClick={onRefresh}
              className="text-slate-300 hover:text-[#ED1C24] transition-all"
              title="ซิงค์ข้อมูลจากฐานข้อมูลทันที"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <div className="flex flex-col text-[10px] font-mono leading-tight">
              <span className="text-slate-400">
                สถานะ: <span className="text-emerald-400 font-bold">WebSocket สด</span>
              </span>
              <span className="text-slate-500">
                อัปเดต: {formatLastUpdated(lastUpdated)}
              </span>
            </div>
          </div>

          {/* Digital Clock Box with Isuzu Red Accents */}
          <div className="bg-[#0A0D14] px-3 py-1.5 rounded-lg border border-[#253248] flex items-center space-x-2 font-mono">
            <Clock className="w-4 h-4 text-[#ED1C24]" />
            <div className="text-right leading-none">
              <div className="text-sm font-bold text-white tracking-widest">{currentTime}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-tight">{currentDate}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
