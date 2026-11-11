import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Server,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ExternalLink
} from 'lucide-react';
import { getScanById } from '../services/api';
import { ScanDetail } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ScoreGauge } from '../components/ScoreGauge';
import { VerificationCard } from '../components/VerificationCard';

export const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [scan, setScan] = useState<ScanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getScanById(id);
        setScan(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to retrieve investigation record.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-3 font-sans">
        <div className="w-8 h-8 border-2 border-[#ff5500] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#52504c] font-medium">Loading comprehensive investigation dossier...</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4 font-sans">
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          {error || 'Investigation record could not be located.'}
        </div>
        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#ff5500] hover:underline"
        >
          <ArrowLeft size={14} /> Return to Investigation Registry
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/history"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#52504c] hover:text-[#141416] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Registry
        </Link>
        <span className="text-xs text-[#52504c] font-mono">
          UUID: <span className="font-semibold text-[#141416]">{scan.scan_id}</span>
        </span>
      </div>

      {/* Main Dossier Banner */}
      <div className="bg-white border border-[#dedad2] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <RiskBadge level={scan.risk_level} size="lg" />
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f7f5f0] text-[#141416] border border-[#dedad2] capitalize font-mono">
                {scan.scan_type} Target
              </span>
              <span className="text-xs text-[#52504c] flex items-center gap-1 font-sans font-medium">
                <Clock size={12} /> {new Date(scan.created_at).toUTCString()}
              </span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#52504c] uppercase tracking-wider block mb-1 font-mono">
                Target Under Investigation
              </label>
              <div className="p-3.5 bg-[#f7f5f0] border border-[#dedad2] rounded-xl font-mono text-xs text-[#141416] font-semibold break-all select-all">
                {scan.target}
              </div>
            </div>

            <p className="text-sm text-[#141416] leading-relaxed font-sans font-medium">
              {scan.report?.summary}
            </p>
          </div>

          {/* Calibrated Gauge */}
          <div className="flex justify-center">
            <ScoreGauge score={scan.risk_score} riskLevel={scan.risk_level} />
          </div>
        </div>
      </div>

      {/* Detected Threat Indicators Breakdown (for Message Scans) */}
      {scan.message_indicators && scan.message_indicators.length > 0 && (
        <div className="bg-white border border-[#dedad2] rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
            <AlertTriangle size={16} className="text-amber-600" /> Specific Phishing Indicators Detected
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {scan.message_indicators.map((ind, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-[#f7f5f0] border border-[#dedad2] flex items-start gap-3"
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    ind.severity === 'Critical'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : ind.severity === 'High'
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#141416]">{ind.category}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      ind.severity === 'Critical'
                        ? 'bg-red-100 text-red-800'
                        : ind.severity === 'High'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {ind.severity}
                    </span>
                  </div>
                  <p className="text-xs text-[#52504c] mt-1 font-medium">{ind.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provider Intelligence Findings Table */}
      {scan.providers_checked && scan.providers_checked.length > 0 && (
        <div className="bg-white border border-[#dedad2] rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
            <Server size={16} className="text-[#ff5500]" /> Threat Intelligence Feed Query Results
          </h3>
          <div className="overflow-x-auto rounded-xl border border-[#dedad2]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#dedad2] bg-[#f7f5f0] text-[#52504c] uppercase font-bold">
                  <th className="py-3.5 pl-3">Provider Feed</th>
                  <th className="py-3.5">Indicator Type</th>
                  <th className="py-3.5">Query Verdict</th>
                  <th className="py-3.5">Verification</th>
                  <th className="py-3.5 text-right pr-3">Reference / Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dedad2]/70 font-mono">
                {scan.providers_checked.map((prov, i) => (
                  <tr key={i} className="hover:bg-[#faf8f4] transition-colors">
                    <td className="py-3.5 pl-3 font-bold text-[#141416] font-sans">{prov.provider}</td>
                    <td className="py-3.5 text-[#52504c] font-medium">{prov.indicator_type}</td>
                    <td className="py-3.5 font-sans">
                      {prov.matched ? (
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                          Threat Matched
                        </span>
                      ) : prov.status === 'clean' ? (
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Clean (No Blacklist Match)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                          {prov.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-[#52504c] font-sans font-medium">
                      {prov.verified ? 'Verified Active Feed' : 'Unverified / Fallback'}
                    </td>
                    <td className="py-3.5 text-right pr-3">
                      {prov.reference ? (
                        <a
                          href={prov.reference}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ff5500] hover:text-[#e04b00] hover:underline inline-flex items-center gap-1 font-sans font-bold"
                        >
                          Source Link <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span className="text-[#52504c] font-sans">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Evidence and Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evidence Card */}
        <div className="bg-white border border-[#dedad2] rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
            <AlertTriangle size={16} className="text-amber-600" /> Evidence &amp; Indicators
          </h3>
          {scan.report?.evidence && scan.report.evidence.length > 0 ? (
            <ul className="space-y-2.5">
              {scan.report.evidence.map((ev, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-[#f7f5f0] border border-[#dedad2] text-xs text-[#141416] flex items-start gap-2.5 font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500] mt-1.5 shrink-0" />
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#52504c] font-medium">No adverse threat indicators logged.</p>
          )}
        </div>

        {/* Recommendations Card */}
        <div className="bg-white border border-[#dedad2] rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
            <CheckCircle2 size={16} className="text-emerald-600" /> Prescribed Mitigation Steps
          </h3>
          <ul className="space-y-2.5">
            {scan.report?.recommendations.map((rec, idx) => (
              <li
                key={idx}
                className="p-3 rounded-xl bg-[#f7f5f0] border border-[#dedad2] text-xs text-[#141416] flex items-start gap-2.5 font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Audit Events Timeline */}
      {scan.events && scan.events.length > 0 && (
        <div className="bg-white border border-[#dedad2] rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
            <Activity size={16} className="text-[#ff5500]" /> Transparent Investigation Audit Trail
          </h3>
          <div className="space-y-3 font-mono text-xs">
            {scan.events.map((ev, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#f7f5f0] border border-[#dedad2]">
                <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-white text-[#141416] border border-[#dedad2] shrink-0">
                  {ev.event_type}
                </span>
                <span className="text-[#141416] font-sans font-medium flex-grow">{ev.description}</span>
                <span className="text-[11px] text-[#52504c] shrink-0 font-sans font-medium">
                  {new Date(ev.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cryptographic Report Verification Card */}
      {scan.report && (
        <VerificationCard
          reportId={scan.report.report_id}
          reportHash={scan.report.report_hash}
          initialStatus={scan.report.verification_status}
          blockchainTx={scan.report.blockchain_tx}
        />
      )}
    </div>
  );
};
