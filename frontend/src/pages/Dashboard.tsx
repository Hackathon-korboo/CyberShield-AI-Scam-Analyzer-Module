import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Server,
  Terminal,
  Zap
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { getStats, getSystemStatus } from '../services/api';
import { StatsOverviewResponse, SystemStatusResponse } from '../types';
import { RiskBadge } from '../components/RiskBadge';

const RISK_COLORS: Record<string, string> = {
  Critical: '#dc2626',
  High: '#ea580c',
  Medium: '#d97706',
  Low: '#16a34a',
  Unknown: '#52504c',
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsOverviewResponse | null>(null);
  const [system, setSystem] = useState<SystemStatusResponse | null>(null);
  const [quickUrl, setQuickUrl] = useState('');
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, sysData] = await Promise.all([getStats(), getSystemStatus()]);
        setStats(statsData);
        setSystem(sysData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickUrl.trim()) {
      navigate(`/scanner?url=${encodeURIComponent(quickUrl.trim())}`);
    }
  };

  const chartData = stats?.risk_distribution
    ? Object.entries(stats.risk_distribution).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Hero Header with Quick Scan */}
      <div className="relative overflow-hidden rounded-3xl bg-[#141416] border border-[#27272a] p-8 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-[#ff5500]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff5500]/15 border border-[#ff5500]/30 text-[#ff8a3d] text-xs font-bold mb-4 uppercase tracking-wider font-mono">
            <Zap size={13} className="text-[#ff5500]" /> Next-Gen AI Cyber Threat Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Comprehensive Threat Detection &amp; Automated Triage
          </h1>
          <p className="mt-3 text-[#b4b0a8] text-sm sm:text-base leading-relaxed">
            Scan suspicious links, verify domain reputation against authoritative feeds, analyze phishing pretexts, and generate cryptographic SHA-256 audit reports.
          </p>

          {/* Quick Scan Input Form */}
          <form onSubmit={handleQuickScan} className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#787570] w-5 h-5" />
              <input
                type="text"
                placeholder="Enter URL or domain (e.g. https://secure-bank-login.xyz)"
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#dedad2] rounded-xl text-[#141416] placeholder-[#787570] text-sm focus:outline-none focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] font-mono transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-[#ff5500] hover:bg-[#e04b00] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all shrink-0 cursor-pointer"
            >
              <Shield size={16} /> Scan Target
            </button>
          </form>
        </div>
      </div>

      {/* Primary Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-[#dedad2] rounded-2xl p-5 hover:border-[#141416]/20 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[#52504c]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Scans Executed</span>
            <div className="p-2 rounded-lg bg-[#f7f5f0] text-[#141416] border border-[#dedad2]">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#141416] font-mono">
              {stats?.total_scans ?? 0}
            </span>
            <span className="text-xs font-medium text-[#52504c]">records</span>
          </div>
        </div>

        <div className="bg-white border border-[#dedad2] rounded-2xl p-5 hover:border-[#141416]/20 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[#52504c]">
            <span className="text-xs font-bold uppercase tracking-wider">Malicious Threats</span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600 font-mono">
              {stats?.malicious_count ?? 0}
            </span>
            <span className="text-xs font-semibold text-red-700">blocked</span>
          </div>
        </div>

        <div className="bg-white border border-[#dedad2] rounded-2xl p-5 hover:border-[#141416]/20 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[#52504c]">
            <span className="text-xs font-bold uppercase tracking-wider">Suspicious / Medium</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-700 font-mono">
              {stats?.suspicious_count ?? 0}
            </span>
            <span className="text-xs font-semibold text-amber-800">flagged</span>
          </div>
        </div>

        <div className="bg-white border border-[#dedad2] rounded-2xl p-5 hover:border-[#141416]/20 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[#52504c]">
            <span className="text-xs font-bold uppercase tracking-wider">Clean / Benign</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700 font-mono">
              {stats?.benign_count ?? 0}
            </span>
            <span className="text-xs font-semibold text-emerald-800">verified</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Threat Breakdown Chart & Threat Intelligence Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Distribution Chart */}
        <div className="bg-white border border-[#dedad2] rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Threat Severity Profile</span>
            <span className="text-xs text-[#52504c] font-medium font-mono">Global</span>
          </h3>

          <div className="h-52 w-full flex items-center justify-center">
            {chartData.length > 0 && stats?.total_scans ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={RISK_COLORS[entry.name] || '#52504c'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#141416',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-[#52504c] text-xs font-medium">
                No telemetry recorded yet. Perform a scan to populate distribution charts.
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#dedad2] text-xs font-semibold text-[#52504c]">
            {['Critical', 'High', 'Medium', 'Low'].map((level) => (
              <div key={level} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: RISK_COLORS[level] }}
                />
                <span>{level}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Feeds & Engine Status */}
        <div className="lg:col-span-2 bg-white border border-[#dedad2] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider flex items-center gap-2">
                <Server size={16} className="text-[#ff5500]" /> Connected Intelligence Engines
              </h3>
              <Link
                to="/settings"
                className="text-xs font-bold text-[#ff5500] hover:text-[#e04b00] flex items-center gap-1"
              >
                Configure APIs <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {system?.providers.map((p) => (
                <div
                  key={p.provider_name}
                  className="p-3.5 rounded-xl bg-[#f7f5f0] border border-[#dedad2] flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-[#141416]">
                      {p.provider_name}
                    </div>
                    <div className="text-[11px] text-[#52504c] mt-0.5 line-clamp-1 font-medium">
                      {p.details}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                      p.status === 'active'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : p.status === 'community_fallback' || p.status === 'local_sha256_active' || p.status === 'heuristic_fallback'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    {p.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-[#f7f5f0] border border-[#dedad2] flex items-center justify-between text-xs text-[#141416] font-mono">
            <span className="flex items-center gap-2">
              <Terminal size={14} className="text-[#ff5500]" /> Database Engine: <strong>{system?.database_type}</strong>
            </span>
            <span className="text-[11px] text-[#52504c] font-sans font-semibold">Zero-Crash Architecture</span>
          </div>
        </div>
      </div>

      {/* Recent Scans Feed */}
      <div className="bg-white border border-[#dedad2] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-[#141416]">Recent Threat Investigations</h3>
            <p className="text-xs text-[#52504c] font-medium">Latest URLs and messages evaluated by the platform</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-bold text-[#ff5500] hover:text-[#e04b00] flex items-center gap-1"
          >
            Full Investigation History <ArrowRight size={13} />
          </Link>
        </div>

        {stats?.recent_scans && stats.recent_scans.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-[#dedad2]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#dedad2] bg-[#f7f5f0] text-xs font-bold text-[#52504c] uppercase tracking-wider">
                  <th className="py-3.5 pl-3">Target</th>
                  <th className="py-3.5">Type</th>
                  <th className="py-3.5">Risk Assessment</th>
                  <th className="py-3.5">Score</th>
                  <th className="py-3.5">Investigated At</th>
                  <th className="py-3.5 text-right pr-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dedad2]/70 font-mono text-xs">
                {stats.recent_scans.map((item) => (
                  <tr key={item.id} className="hover:bg-[#faf8f4] transition-colors">
                    <td className="py-3.5 pl-3 font-semibold text-[#141416] max-w-xs truncate">
                      {item.target}
                    </td>
                    <td className="py-3.5 text-[#52504c] font-sans font-medium capitalize">{item.scan_type}</td>
                    <td className="py-3.5 font-sans">
                      <RiskBadge level={item.risk_level} size="sm" />
                    </td>
                    <td className="py-3.5 text-[#141416] font-bold">{item.risk_score}/100</td>
                    <td className="py-3.5 text-[#52504c] font-sans text-xs">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right pr-3 font-sans">
                      <Link
                        to={`/report/${item.id}`}
                        className="text-xs font-bold text-[#ff5500] hover:text-[#e04b00] hover:underline inline-flex items-center gap-1"
                      >
                        Inspect <ArrowRight size={11} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-[#52504c] text-sm font-medium">
            No scans recorded yet. Use the scanner above to run your first threat intelligence audit.
          </div>
        )}
      </div>
    </div>
  );
};
