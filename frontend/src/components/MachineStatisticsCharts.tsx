import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { DashboardStatistics, Machine } from '../types';
import { BarChart3, PieChart as PieIcon, TrendingDown, CheckCircle2 } from 'lucide-react';
import { formatLiveDuration } from '../hooks/useRealtimeDashboard';

interface MachineStatisticsChartsProps {
  statistics: DashboardStatistics | null;
  machines?: Machine[];
  currentTimeMs?: number;
}

export const MachineStatisticsCharts: React.FC<MachineStatisticsChartsProps> = ({
  statistics,
  machines,
  currentTimeMs = Date.now()
}) => {
  // Isuzu Corporate Color Scheme
  const STATUS_COLORS: Record<string, string> = {
    NORMAL: '#10B981',    // Green
    BREAKDOWN: '#ED1C24', // Isuzu Red
    STOPPED: '#F59E0B'    // Amber
  };

  const STATUS_THAI_LABEL: Record<string, string> = {
    NORMAL: 'ปกติ (NORMAL)',
    BREAKDOWN: 'ขัดข้อง (BREAKDOWN)',
    STOPPED: 'หยุดทำงาน (STOPPED)'
  };

  // Derive real-time datasets from live machines array if provided, otherwise fallback to statistics prop
  const liveData = useMemo(() => {
    if (!machines || machines.length === 0) {
      return {
        statusDistribution: statistics?.status_distribution || [],
        locationDistribution: statistics?.location_distribution || [],
        downtimeOverview: statistics?.downtime_overview || []
      };
    }

    // 1. Live Status Distribution
    const counts = { NORMAL: 0, BREAKDOWN: 0, STOPPED: 0 };
    machines.forEach((m) => {
      if (m.status in counts) {
        counts[m.status]++;
      }
    });

    const statusDistribution = [
      { status: 'NORMAL', label: 'ปกติ (NORMAL)', count: counts.NORMAL, color: '#10B981' },
      { status: 'BREAKDOWN', label: 'ขัดข้อง (BREAKDOWN)', count: counts.BREAKDOWN, color: '#ED1C24' },
      { status: 'STOPPED', label: 'หยุดทำงาน (STOPPED)', count: counts.STOPPED, color: '#F59E0B' }
    ];

    // 2. Live Status by Location (4 Designated PM Areas)
    const locations = ['PM1 Shop', 'PM1 Overhaul', 'PM2 Shop', 'PM2 Overhaul'];
    const locMap: Record<string, { normal: number; breakdown: number; stopped: number; total: number }> = {};
    locations.forEach((loc) => {
      locMap[loc] = { normal: 0, breakdown: 0, stopped: 0, total: 0 };
    });

    machines.forEach((m) => {
      const loc = locMap[m.location] ? m.location : 'PM1 Shop';
      locMap[loc].total++;
      if (m.status === 'NORMAL') locMap[loc].normal++;
      else if (m.status === 'BREAKDOWN') locMap[loc].breakdown++;
      else if (m.status === 'STOPPED') locMap[loc].stopped++;
    });

    const locationDistribution = locations.map((loc) => ({
      location: loc,
      normal: locMap[loc].normal,
      breakdown: locMap[loc].breakdown,
      stopped: locMap[loc].stopped,
      total: locMap[loc].total
    }));

    // 3. Live Downtime Overview: include ALL machines currently in BREAKDOWN or STOPPED
    const downtimeOverview = machines
      .filter((m) => m.status === 'BREAKDOWN' || m.status === 'STOPPED')
      .map((m) => {
        const startTime = m.status === 'BREAKDOWN' ? m.breakdown_start_time : m.stopped_start_time;
        const liveSeconds = startTime
          ? Math.max(1, Math.floor((currentTimeMs - new Date(startTime).getTime()) / 1000))
          : 60;
        const liveMinutes = Math.max(1, Math.floor(liveSeconds / 60));
        const liveFormatted = formatLiveDuration(startTime);
        const reason =
          m.status === 'BREAKDOWN'
            ? m.breakdown_description || 'ตรวจพบข้อผิดพลาดรุนแรง'
            : m.stop_reason || 'หยุดซ่อมบำรุงตามระยะ';

        return {
          machine_id: m.machine_id,
          machine_name: m.machine_name,
          location: m.location,
          status: m.status,
          duration_minutes: liveMinutes,
          duration_seconds: liveSeconds,
          duration_formatted: liveFormatted,
          reason
        };
      })
      .sort((a, b) => b.duration_seconds - a.duration_seconds);

    return {
      statusDistribution,
      locationDistribution,
      downtimeOverview
    };
  }, [machines, statistics, currentTimeMs]);

  const { statusDistribution, locationDistribution, downtimeOverview } = liveData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0A0D14] border border-[#253248] p-3 rounded-xl shadow-2xl text-xs font-mono">
          <div className="font-bold text-white mb-1.5">{label || payload[0]?.name}</div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center space-x-2 text-slate-300">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color || entry.fill }}
              ></span>
              <span className="capitalize">{entry.name}:</span>
              <span className="font-bold text-white">{entry.value} เครื่อง</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Statistics Section Title (Thai) */}
      <div>
        <h2 className="text-base font-bold font-mono tracking-wider text-white flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-[#ED1C24]" />
          <span>สถิติเทเลเมทรีและวิเคราะห์เวลาหยุดทำงาน (TELEMETRY &amp; DOWNTIME ANALYTICS)</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          ISUZU ENGINE &bull; ข้อมูลมวลรวมสดแบบเรียลไทม์ครบทั้ง 10 เครื่อง &bull; อัปเดตกราฟทันทีเมื่อสถานะเปลี่ยน
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart 1: Status Distribution */}
        <div className="industrial-card rounded-2xl p-4 border border-[#253248]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold font-mono text-slate-300 tracking-wider flex items-center space-x-1.5">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <span>สัดส่วนสถานะเครื่องจักร</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">10 เครื่อง</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || '#3B82F6'}
                      stroke="#0A0D14"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => {
                    const found = statusDistribution.find((s) => s.status === value);
                    return (
                      <span className="text-xs font-mono text-slate-300">
                        {STATUS_THAI_LABEL[value] || value} ({found?.count ?? 0})
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status by Location */}
        <div className="industrial-card rounded-2xl p-4 border border-[#253248]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold font-mono text-slate-300 tracking-wider flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>สถานะเครื่องจักรแยกตามพื้นที่ (4 โซน)</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">PM1 &amp; PM2</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={locationDistribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#253248" />
                <XAxis
                  dataKey="location"
                  stroke="#64748B"
                  fontSize={10}
                  fontFamily="monospace"
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#64748B" fontSize={10} fontFamily="monospace" allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={30}
                  formatter={(value) => (
                    <span className="text-xs font-mono text-slate-300">
                      {value === 'normal'
                        ? 'ปกติ (Normal)'
                        : value === 'breakdown'
                        ? 'ขัดข้อง (Breakdown)'
                        : 'หยุดทำงาน (Stopped)'}
                    </span>
                  )}
                />
                <Bar dataKey="normal" name="normal" fill="#10B981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="breakdown" name="breakdown" fill="#ED1C24" radius={[3, 3, 0, 0]} />
                <Bar dataKey="stopped" name="stopped" fill="#F59E0B" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Machine Downtime Overview - Displays ALL Breakdown and Stopped machines */}
        <div className="industrial-card rounded-2xl p-4 border border-[#253248]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold font-mono text-slate-300 tracking-wider flex items-center space-x-1.5">
              <TrendingDown className="w-4 h-4 text-[#ED1C24]" />
              <span>เวลาหยุดทำงานสะสม (Downtime Overview)</span>
            </h3>
            <span className="text-[10px] font-mono text-amber-400 font-bold">
              {downtimeOverview.length} เครื่องกำลังหยุด/ขัดข้อง
            </span>
          </div>

          <div className="h-64 w-full">
            {downtimeOverview.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                <p className="text-xs text-emerald-400 font-mono font-bold">
                  ไม่มีเครื่องจักรขัดข้องหรือหยุดทำงานในขณะนี้
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-1">
                  เครื่องจักรทั้ง 10 เครื่องเดินระบบปกติสมบูรณ์ 100%
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={downtimeOverview}
                  layout="vertical"
                  margin={{ top: 5, right: 25, left: 15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#253248" />
                  <XAxis type="number" stroke="#64748B" fontSize={10} fontFamily="monospace" unit="m" />
                  <YAxis
                    dataKey="machine_id"
                    type="category"
                    stroke="#94A3B8"
                    fontSize={11}
                    fontFamily="monospace"
                    width={55}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-[#0A0D14] border border-[#253248] p-3 rounded-xl shadow-2xl text-xs font-mono">
                            <div className="font-bold text-white flex items-center space-x-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  item.status === 'BREAKDOWN' ? 'bg-[#ED1C24]' : 'bg-amber-400'
                                }`}
                              ></span>
                              <span>
                                {item.machine_id} - {item.machine_name}
                              </span>
                            </div>
                            <div className="text-slate-400 mt-1">พื้นที่: {item.location}</div>
                            <div className="text-slate-300">
                              สถานะ:{' '}
                              <span
                                className={`font-bold ${
                                  item.status === 'BREAKDOWN' ? 'text-[#ED1C24]' : 'text-amber-400'
                                }`}
                              >
                                {item.status === 'BREAKDOWN' ? 'ขัดข้อง (BREAKDOWN)' : 'หยุดทำงาน (STOPPED)'}
                              </span>
                            </div>
                            <div className="text-slate-300 mt-0.5">
                              ระยะเวลาสด:{' '}
                              <span className="text-cyan-400 font-bold">{item.duration_formatted}</span>
                            </div>
                            <div className="text-[11px] text-slate-300 mt-1 p-1.5 rounded bg-[#161F33] border border-[#253248] max-w-xs">
                              {item.reason}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="duration_minutes"
                    name="เวลาสะสม (นาที)"
                    radius={[0, 4, 4, 0]}
                  >
                    {downtimeOverview.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.status === 'BREAKDOWN' ? '#ED1C24' : '#F59E0B'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
