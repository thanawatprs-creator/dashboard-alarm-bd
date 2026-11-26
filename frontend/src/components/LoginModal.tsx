import React, { useState, useEffect } from 'react';
import { AuthUser } from '../types';
import {
  X,
  Lock,
  User,
  ShieldCheck,
  Factory,
  LogIn,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

export interface DemoAccount {
  username: string;
  password: string;
  displayName: string;
  role: 'PRODUCTION' | 'IT';
  department: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    username: 'prod_user',
    password: 'prod@isuzu2026',
    displayName: 'เจ้าหน้าที่ฝ่าย Production',
    role: 'PRODUCTION',
    department: 'Production Department (ฝ่ายผลิต)'
  },
  {
    username: 'it_admin',
    password: 'it@isuzu2026',
    displayName: 'ผู้ดูแลระบบฝ่าย IT',
    role: 'IT',
    department: 'IT Department (ฝ่ายเทคโนโลยีสารสนเทศ)'
  }
];

interface LoginModalProps {
  isOpen: boolean;
  targetRole?: 'PRODUCTION' | 'IT';
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  targetRole = 'PRODUCTION',
  onClose,
  onLoginSuccess
}) => {
  const [selectedPortal, setSelectedPortal] = useState<'PRODUCTION' | 'IT'>(targetRole);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedPortal(targetRole);
      setUsername('');
      setPassword('');
      setErrorMsg(null);
    }
  }, [isOpen, targetRole]);

  if (!isOpen) return null;

  const handleAutofill = (acc: DemoAccount) => {
    setSelectedPortal(acc.role);
    setUsername(acc.username);
    setPassword(acc.password);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const matched = DEMO_ACCOUNTS.find(
      (acc) =>
        acc.username === username.trim() &&
        acc.password === password &&
        acc.role === selectedPortal
    );

    if (!matched) {
      // Check if credentials belong to the other role
      const otherRoleMatch = DEMO_ACCOUNTS.find(
        (acc) => acc.username === username.trim() && acc.password === password
      );
      if (otherRoleMatch) {
        setErrorMsg(
          `บัญชีนี้เป็นของ${otherRoleMatch.department} กรุณาเลือกแท็บฝ่ายให้ถูกต้อง`
        );
        return;
      }
      setErrorMsg('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง หรือใช้รหัสจำลองด้านล่าง');
      return;
    }

    onLoginSuccess({
      username: matched.username,
      displayName: matched.displayName,
      role: matched.role,
      department: matched.department
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#121826] border-2 border-[#253248] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Top Isuzu Header */}
        <div className="bg-[#0A0D14] px-6 py-4 border-b border-[#253248] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#ED1C24]/15 border border-[#ED1C24] flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#ED1C24]" />
            </div>
            <div>
              <h3 className="text-base font-mono font-bold text-white tracking-wider">
                เข้าสู่ระบบ (DEPARTMENT LOGIN)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                ISUZU ENGINE &bull; ระบบยืนยันตัวตนจำลอง
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

        {/* Portal Role Tabs */}
        <div className="grid grid-cols-2 bg-[#0E131F] border-b border-[#253248] p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSelectedPortal('PRODUCTION');
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
              selectedPortal === 'PRODUCTION'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Factory className="w-4 h-4" />
            <span>ฝ่าย Production</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedPortal('IT');
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
              selectedPortal === 'IT'
                ? 'bg-[#ED1C24] text-white shadow-lg shadow-[#ED1C24]/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ฝ่าย IT (Admin)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-mono">
          <div className="text-xs text-slate-300 bg-[#0A0D14] border border-[#253248] rounded-xl p-3">
            {selectedPortal === 'PRODUCTION' ? (
              <span>
                <strong className="text-amber-400">สิทธิ์ฝ่าย Production:</strong> แจ้งเครื่องจักรขัดข้อง/หยุดทำงาน และแก้ไขวันเวลาเริ่มเหตุการณ์ของเครื่องจักร
              </span>
            ) : (
              <span>
                <strong className="text-[#ED1C24]">สิทธิ์ฝ่าย IT:</strong> ควบคุมระบบทั้งหมด แดชบอร์ดภาพรวม ประวัติแจ้งเตือน และแผงจำลองระบบ
              </span>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-[#ED1C24] text-red-200 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-[#ED1C24] flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="text-[11px] text-slate-400 uppercase block mb-1.5">
              ชื่อผู้ใช้งาน (Username)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={selectedPortal === 'PRODUCTION' ? 'prod_user' : 'it_admin'}
                required
                className="w-full bg-[#060B18] border border-[#253248] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ED1C24] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 uppercase block mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-[#060B18] border border-[#253248] rounded-xl pl-9 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-[#ED1C24] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg ${
              selectedPortal === 'PRODUCTION'
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                : 'bg-[#ED1C24] hover:bg-red-600 text-white shadow-[#ED1C24]/30'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>
              เข้าสู่ระบบ{selectedPortal === 'PRODUCTION' ? 'ฝ่าย Production' : 'ฝ่าย IT'}
            </span>
          </button>

          {/* Demo Credentials Box */}
          <div className="pt-3 border-t border-[#253248]">
            <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
              <span>รหัสล็อกอินจำลองสำหรับทดสอบ (คลิกเพื่อกรอกอัตโนมัติ):</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleAutofill(acc)}
                  className="text-left p-2.5 rounded-xl bg-[#0A0D14] hover:bg-[#182235] border border-[#253248] hover:border-slate-500 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          acc.role === 'IT' ? 'bg-[#ED1C24]' : 'bg-amber-400'
                        }`}
                      ></span>
                      <span>{acc.displayName}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      User: <span className="text-cyan-400">{acc.username}</span> &bull; Pass:{' '}
                      <span className="text-cyan-400">{acc.password}</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-300 group-hover:bg-[#ED1C24] group-hover:text-white transition-colors">
                    กรอกอัตโนมัติ
                  </span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
