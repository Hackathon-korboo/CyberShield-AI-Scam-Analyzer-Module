import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Server
} from 'lucide-react';
import { scanUrl } from '../services/api';
import { ScanDetail } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ScoreGauge } from '../components/ScoreGauge';
import { VerificationCard } from '../components/VerificationCard';

export const Scanner: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sample quick test buttons
  const samples = [
    { label: 'Synthetic Malware C2', url: 'https://test-malware.cyber/payload.exe' },
    { label: 'Synthetic Phish Login', url: 'https://test-phish.cyber/banking/auth' },
    { label: 'Suspicious IP Literal', url: 'http://185.220.101.5:8080/admin' },
    { label: 'Clean Baseline', url: 'https://example.com' },
  ];

  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setInputUrl(urlParam);
      executeScan(urlParam);
    }
  }, [searchParams]);

  const executeScan = async (target: string) => {
    if (!target.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await scanUrl(target.trim());
      setResult(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          'Failed to execute threat intelligence scan. Please verify target syntax.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeScan(inputUrl);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Page Title & Intro */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/30 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
          <Shield size={14} /> Multi-Provider Threat Evaluation
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141416]">
          URL &amp; Domain Reputation Scanner
        </h1>
        <p className="text-sm text-[#52504c] mt-1 max-w-2xl font-medium leading-relaxed">
          Queries threat intelligence feeds without downloading or executing the target.
          Evaluates malicious payloads, domain heuristics, and outputs a tamper-evident risk report.
        </p>
      </div>

      {/* Input Box Card */}
      <div className="bg-white border border-[#dedad2] rounded-2xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#787570] w-5 h-5" />
            <input
              type="text"
              placeholder="Enter URL, hostname, or IP (e.g., https://login-verify-account.top/auth)"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full pl-12 pr-32 py-4 bg-[#f7f5f0] border border-[#dedad2] rounded-xl text-[#141416] placeholder-[#787570] text-sm focus:outline-none focus:bg-white focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] font-mono transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !inputUrl.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-[#ff5500] hover:bg-[#e04b00] text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Shield size={14} /> Scan URL
                </>
              )}
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-[#52504c]">
            <span className="font-bold text-[#141416]">Quick Test Samples:</span>
            {samples.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setInputUrl(s.url);
                  executeScan(s.url);
                }}
                className="px-2.5 py-1 rounded-md bg-[#f7f5f0] hover:bg-white text-[#141416] border border-[#dedad2] font-medium transition-colors cursor-pointer shadow-xs"
              >
                {s.label}
              </button>
            ))}
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 font-medium">
            <AlertTriangle size={16} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Loading Radar Animation */}
      {loading && (
        <div className="bg-white border border-[#dedad2] rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-[#ff5500]/20 animate-ping" />
            <div className="w-16 h-16 rounded-full border-2 border-[#ff5500]/30 border-t-[#ff5500] animate-spin flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#ff5500]" />
            </div>
          </div>
          <div>
            <h4 className="text-base font-bold text-[#141416]">Analyzing Target Destination</h4>
            <p className="text-xs text-[#52504c] mt-1 font-medium">
              Normalizing URL syntax &bull; Interrogating URLhaus &amp; PhishTank &bull; Evaluating heuristics
            </p>
          </div>
        </div>
      )}

      {/* Scan Results Display */}
      {result && !loading && (
        <div className="space-y-8">
          {/* Target Overview Card */}
          <div className="bg-white border border-[#dedad2] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <RiskBadge level={result.risk_level} size="lg" />
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f7f5f0] text-[#141416] border border-[#dedad2] capitalize">
                    {result.scan_type} Target
                  </span>
                  {(result.domain?.endsWith('.example') || result.hostname?.endsWith('.example') || result.domain?.endsWith('.test')) && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                      RFC 2606 Reserved Test Domain
                    </span>
                  )}
                  <span className="text-xs text-[#52504c] font-medium">
                    Scan ID: <span className="font-mono font-bold text-[#141416]">{result.scan_id.slice(0, 8)}...</span>
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#52504c] uppercase tracking-wider block mb-1">
                    Defanged Target (Safe for Display)
                  </label>
                  <div className="p-3.5 bg-[#f7f5f0] border border-[#dedad2] rounded-xl font-mono text-xs text-[#141416] font-semibold break-all select-all">
                    {result.normalized_target || result.target}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-3 bg-[#f7f5f0] rounded-xl border border-[#dedad2]">
                    <span className="text-[#52504c] block text-[10px] uppercase font-bold">Domain</span>
                    <span className="text-[#141416] font-mono font-semibold break-all">{result.domain || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-[#f7f5f0] rounded-xl border border-[#dedad2]">
                    <span className="text-[#52504c] block text-[10px] uppercase font-bold">Hostname</span>
                    <span className="text-[#141416] font-mono font-semibold break-all">{result.hostname || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-[#f7f5f0] rounded-xl border border-[#dedad2] col-span-2 sm:col-span-1">
                    <span className="text-[#52504c] block text-[10px] uppercase font-bold">Triage Status</span>
                    <span className="text-emerald-700 font-bold uppercase">{result.status}</span>
                  </div>
                </div>
              </div>

              {/* Threat Score Gauge */}
              <div className="flex justify-center">
                <ScoreGauge score={result.risk_score} riskLevel={result.risk_level} />
              </div>
            </div>
          </div>

          {/* Intelligence Feeds Breakdown */}
          <div className="bg-white border border-[#dedad2] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Server size={16} className="text-[#ff5500]" /> Threat Intelligence Provider Findings
            </h3>

            <div className="overflow-x-auto rounded-xl border border-[#dedad2]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#dedad2] bg-[#f7f5f0] text-[#52504c] uppercase font-bold">
                    <th className="py-3.5 pl-3">Security Provider</th>
                    <th className="py-3.5">Query Verdict</th>
                    <th className="py-3.5">Confidence Status</th>
                    <th className="py-3.5">Reference Link</th>
                    <th className="py-3.5 text-right pr-3">Granular Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dedad2]/70 font-sans">
                  {result.providers_checked.map((prov) => (
                    <tr key={prov.provider} className="hover:bg-[#faf8f4] transition-colors">
                      <td className="py-3.5 pl-3 font-bold text-[#141416]">{prov.provider}</td>
                      <td className="py-3.5">
                        {prov.matched ? (
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                            Threat Match Found
                          </span>
                        ) : prov.status === 'clean' ? (
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            No Match (Clean)
                          </span>
                        ) : prov.status === 'not_configured' ? (
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                            Key Not Configured
                          </span>
                        ) : prov.status === 'skipped_synthetic' ? (
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                            Reserved / Test Domain
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {prov.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-[#52504c] font-medium">
                        {prov.verified ? 'Analyst / Feed Verified' : 'Community / Unverified'}
                      </td>
                      <td className="py-3.5">
                        {prov.reference ? (
                          <a
                            href={prov.reference}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#ff5500] hover:text-[#e04b00] hover:underline inline-flex items-center gap-1 font-bold"
                          >
                            Intel Dossier <ExternalLink size={11} />
                          </a>
                        ) : (
                          <span className="text-[#52504c]">None</span>
                        )}
                      </td>
                      <td className="py-3.5 text-right pr-3 font-mono text-[11px] text-[#52504c]">
                        {prov.details?.threat || prov.details?.query_status || JSON.stringify(prov.details || {})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Evidence and Recommendations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Evidence Card */}
            <div className="bg-white border border-[#dedad2] rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-600" /> Evidence &amp; Detection Indicators
              </h3>
              {result.report.evidence.length > 0 ? (
                <ul className="space-y-2.5">
                  {result.report.evidence.map((ev, idx) => (
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
                <p className="text-xs text-[#52504c] font-medium">No adverse evidence detected for this target.</p>
              )}
            </div>

            {/* Recommendations Card */}
            <div className="bg-white border border-[#dedad2] rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" /> Recommended Cybersecurity Actions
              </h3>
              <ul className="space-y-2.5">
                {result.report.recommendations.map((rec, idx) => (
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

          {/* Report Cryptographic Integrity Card */}
          <VerificationCard
            reportId={result.report.report_id}
            reportHash={result.report.report_hash}
            initialStatus={result.report.verification_status}
            blockchainTx={result.report.blockchain_tx}
          />
        </div>
      )}
    </div>
  );
};
