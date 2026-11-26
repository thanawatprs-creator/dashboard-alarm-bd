import React, { useState, useEffect } from 'react';
import { AuthUser, Machine } from './types';
import { useRealtimeDashboard } from './hooks/useRealtimeDashboard';
import { Header } from './components/Header';
import { PMViewPage } from './pages/PMViewPage';
import { ProductionPage } from './pages/ProductionPage';
import { DashboardPage } from './pages/DashboardPage';
import { ManagementPage } from './pages/ManagementPage';
import { AlarmHistoryPage } from './pages/AlarmHistoryPage';
import { MachineDetailModal } from './components/MachineDetailModal';
import { SimulationControlModal } from './components/SimulationControlModal';
import { LoginModal } from './components/LoginModal';
import {
  AlertTriangle,
  WifiOff,
  Radio,
  CheckCircle2,
  X,
  Tag,
  MapPin
} from 'lucide-react';

const AUTH_STORAGE_KEY = 'isuzu_dashboard_auth_user';

export const App: React.FC = () => {
  // Auth state (persisted in localStorage)
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Active department portal: 'pm' (default public 4-area view), 'production', or 'it'
  const [activePortal, setActivePortal] = useState<'pm' | 'production' | 'it'>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const user: AuthUser = JSON.parse(saved);
        if (user.role === 'IT') return 'it';
        if (user.role === 'PRODUCTION') return 'production';
      }
    } catch {
      // ignore
    }
    return 'pm';
  });

  // Sub-tab inside IT Portal
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'management' | 'history'>('dashboard');

  // Login Modal state
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [loginTargetRole, setLoginTargetRole] = useState<'PRODUCTION' | 'IT'>('PRODUCTION');

  // Real-Time Data & WebSocket Hook
  const {
    machines,
    summary,
    statistics,
    activeAlarms,
    simulationStatus,
    connectionStatus,
    loading,
    lastUpdated,
    notifications,
    dismissNotification,
    refreshData,
    currentTimeMs
  } = useRealtimeDashboard();

  // Selected machine for inspection modal
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);

  // Sync selected machine if its data updates via WebSocket
  const liveSelectedMachine = selectedMachine
    ? machines.find((m) => m.machine_id === selectedMachine.machine_id) || selectedMachine
    : null;

  useEffect(() => {
    if (authUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [authUser]);

  const handleOpenLogin = (role: 'PRODUCTION' | 'IT') => {
    setLoginTargetRole(role);
    setIsLoginOpen(true);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    setIsLoginOpen(false);
    if (user.role === 'IT') {
      setActivePortal('it');
      setCurrentTab('dashboard');
    } else if (user.role === 'PRODUCTION') {
      setActivePortal('production');
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
    setActivePortal('pm');
    setIsSimModalOpen(false);
  };

  // Can current user edit machines in detail modal? (Only Production & IT)
  const canEditMachines =
    activePortal !== 'pm' &&
    (authUser?.role === 'IT' || authUser?.role === 'PRODUCTION');

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex flex-col font-sans selection:bg-[#ED1C24] selection:text-white">
      {/* Top Industrial Header with Department Role Switcher & WebSocket Status */}
      <Header
        activePortal={activePortal}
        onSelectPortal={setActivePortal}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        authUser={authUser}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
        lastUpdated={lastUpdated}
        onRefresh={refreshData}
        connectionStatus={connectionStatus}
        onOpenSimulation={() => setIsSimModalOpen(true)}
      />

      {/* Global Connection / WebSocket Alert Banner */}
      {connectionStatus === 'DISCONNECTED' && (
        <div className="bg-[#ED1C24]/90 border-b-2 border-white px-4 py-2.5 text-xs font-mono text-white flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-white animate-pulse flex-shrink-0" />
            <span>
              <strong>แจ้งเตือนการเชื่อมต่อ (CONNECTION ALERT):</strong> สัญญาณ WebSocket ขาดหาย กำลังแสดงข้อมูลล่าสุดที่มีในระบบและพยายามเชื่อมต่อใหม่อัตโนมัติ...
            </span>
          </div>
          <button
            onClick={refreshData}
            className="px-3 py-1 rounded bg-black/40 hover:bg-black/60 text-white font-bold text-[11px] transition-colors border border-white/40"
          >
            เชื่อมต่อใหม่ทันที
          </button>
        </div>
      )}

      {connectionStatus === 'RECONNECTING' && (
        <div className="bg-amber-950/80 border-b border-amber-500/40 px-4 py-1.5 text-xs font-mono text-amber-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>กำลังเจรจาเชื่อมต่อสัญญาณ WebSocket แบบเรียลไทม์กับ FastAPI Backend...</span>
          </div>
        </div>
      )}

      {/* Real-Time Live Alarm Notification Toast Banners */}
      <div className="fixed top-24 right-4 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border-2 shadow-2xl backdrop-blur-md flex items-start space-x-3 transition-all animate-slideDown ${
              notif.type === 'breakdown'
                ? 'bg-[#121826] border-[#ED1C24] text-white shadow-[#ED1C24]/30'
                : 'bg-[#121826] border-emerald-500 text-white shadow-emerald-950/50'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${notif.type === 'breakdown' ? 'bg-[#ED1C24]/20' : 'bg-emerald-500/20'} mt-0.5`}>
              {notif.type === 'breakdown' ? (
                <AlertTriangle className="w-5 h-5 text-[#ED1C24] animate-bounce" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </div>

            <div className="flex-1 min-w-0 font-mono text-xs">
              <div className="font-bold flex items-center justify-between">
                <span className="truncate">{notif.title}</span>
                <span className="text-[10px] text-slate-400 ml-1">สด</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                {notif.message}
              </p>
              <div className="mt-1.5 flex items-center space-x-2 text-[10px] text-slate-400">
                <span className="flex items-center space-x-0.5">
                  <MapPin className="w-2.5 h-2.5 text-[#ED1C24]" />
                  <span>{notif.location}</span>
                </span>
                {notif.sr_number && (
                  <span className="flex items-center space-x-0.5 text-cyan-400 font-semibold">
                    <Tag className="w-2.5 h-2.5" />
                    <span>{notif.sr_number}</span>
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => dismissNotification(notif.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Main View Container */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 lg:px-8 py-6">
        {loading && machines.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#ED1C24] border-t-transparent rounded-full animate-spin"></div>
            <div className="font-mono text-sm tracking-wider text-[#ED1C24] uppercase font-bold">
              กำลังเชื่อมต่อฐานข้อมูล SQLITE &bull; รอรับสัญญาณ REAL-TIME WEBSOCKET
            </div>
          </div>
        ) : (
          <>
            {/* 1. PM View (4 Areas, Read-only) */}
            {activePortal === 'pm' && (
              <PMViewPage
                machines={machines}
                onSelectMachine={(m) => setSelectedMachine(m)}
                currentTimeMs={currentTimeMs}
              />
            )}

            {/* 2. Production Portal (Requires Production or IT login) */}
            {activePortal === 'production' && authUser && (
              <ProductionPage
                machines={machines}
                authUser={authUser}
                onRefresh={refreshData}
                currentTimeMs={currentTimeMs}
              />
            )}

            {/* 3. IT Admin Portal (Requires IT login) */}
            {activePortal === 'it' && authUser?.role === 'IT' && (
              <>
                {currentTab === 'dashboard' && (
                  <DashboardPage
                    summary={summary}
                    statistics={statistics}
                    machines={machines}
                    activeAlarms={activeAlarms}
                    onSelectMachine={(m) => setSelectedMachine(m)}
                    onRefresh={refreshData}
                    currentTimeMs={currentTimeMs}
                  />
                )}

                {currentTab === 'management' && (
                  <ManagementPage
                    machines={machines}
                    onSelectMachine={(m) => setSelectedMachine(m)}
                    onRefresh={refreshData}
                    simulationStatus={simulationStatus}
                    currentTimeMs={currentTimeMs}
                  />
                )}

                {currentTab === 'history' && <AlarmHistoryPage />}
              </>
            )}
          </>
        )}
      </main>

      {/* Industrial Footer */}
      <footer className="bg-[#0E131F] border-t border-[#253248] px-4 lg:px-8 py-3.5 text-xs font-mono text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xl">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-white flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ED1C24]"></span>
            <span>ISUZU ENGINE MANUFACTURING (THAILAND) CO., LTD.</span>
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-amber-400 font-medium">โหมดสาธิต – ข้อมูลจำลอง (SIMULATED DATA)</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-400">
          <span>เป้าหมายการแสดงผล: จอมอนิเตอร์ PM Shop TV Wall Display</span>
          <span className="text-slate-500">FastAPI WebSocket + SQLite + React Vite</span>
        </div>
      </footer>

      {/* Machine Inspection & Manual Override Modal */}
      <MachineDetailModal
        machine={liveSelectedMachine}
        onClose={() => setSelectedMachine(null)}
        onStatusUpdated={refreshData}
        currentTimeMs={currentTimeMs}
        canEdit={canEditMachines}
      />

      {/* Central Simulation Control Modal (IT Only) */}
      {authUser?.role === 'IT' && (
        <SimulationControlModal
          isOpen={isSimModalOpen}
          onClose={() => setIsSimModalOpen(false)}
          simulationStatus={simulationStatus}
          machines={machines}
          onTriggerSuccess={refreshData}
        />
      )}

      {/* Department Login Modal (Production & IT) */}
      <LoginModal
        isOpen={isLoginOpen}
        targetRole={loginTargetRole}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};
