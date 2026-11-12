import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Layers
} from 'lucide-react';
import { investigateDomainIntel } from '../services/api';
import { DomainIntelligenceResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';

const DomainIntelligence: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [domainInput, setDomainInput] = useState<string>('sbi.co.in.scam-portal.xyz');
  const [result, setResult] = useState<DomainIntelligenceResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const domainParam = searchParams.get('domain');
    if (domainParam) {
      setDomainInput(domainParam);
      runInvestigation(domainParam);
    }
  }, [searchParams]);

  const runInvestigation = async (targetDomain: string) => {
    if (!targetDomain.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await investigateDomainIntel(targetDomain.trim());
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to query domain intelligence.');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestigate = async () => {
    runInvestigation(domainInput);
  };

  const applyPreset = (preset: string) => {
    setDomainInput(preset);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-800 text-xs rounded-lg font-semibold">
          {error}
        </div>
      )}
      <div className="bg-[#1c1a17] text-white p-6 rounded-xl border border-[#2b2823] shadow-md">
        <div className="flex items-center space-x-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Core Innovation 5 • TrustLens & Vexora Inspired
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[#faf8f5] tracking-tight">
          Domain & Brand Trust Intelligence
        </h1>
        <p className="text-sm text-[#a8a29e] mt-1 max-w-3xl">
          Queries public authoritative RDAP registration directories, audits Certificate Transparency (CT) logs, and evaluates algorithmic brand impersonation, typosquatting, and IDN/punycode homoglyphs targeting monitored institutions.
        </p>
      </div>

      {/* Input Box & Presets */}
      <div className="bg-white p-6 rounded-xl border border-[#e5e2dc] shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#1c1a17] uppercase tracking-wider mb-2">
            Target Domain or Hostname
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="e.g. sbi.co.in.attacker-portal.xyz or paytm-kyc.com"
              className="flex-1 text-xs p-3 bg-[#f5f2eb] border border-[#e5e2dc] rounded-lg text-[#1c1a17] font-mono focus:outline-none focus:ring-1 focus:ring-[#1c1a17]"
            />
            <button
              onClick={handleInvestigate}
              disabled={loading || !domainInput.trim()}
              className="px-6 py-3 bg-[#1c1a17] hover:bg-[#2b2823] text-white text-xs font-bold rounded-lg shadow-sm transition-colors shrink-0"
            >
              {loading ? 'Querying RDAP/CT...' : 'Investigate Domain'}
            </button>
          </div>
        </div>

        {/* Presets */}
        <div>
          <span className="text-[11px] font-bold text-[#52504c] uppercase tracking-wider block mb-2">
            Test Scenarios:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => applyPreset('sbi.co.in.scam-portal.xyz')}
              className="px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 text-red-800 font-medium hover:bg-red-100 transition-colors"
            >
              🚨 Subdomain SBI Mimic
            </button>
            <button
              onClick={() => applyPreset('paytm-kyc-update.com')}
              className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 font-medium hover:bg-amber-100 transition-colors"
            >
              ⚠️ Keyword Typosquat (Paytm)
            </button>
            <button
              onClick={() => applyPreset('xn--app-9ka.com')}
              className="px-3 py-1.5 rounded-lg border border-purple-300 bg-purple-50 text-purple-800 font-medium hover:bg-purple-100 transition-colors"
            >
              🔤 Punycode / Homoglyph
            </button>
            <button
              onClick={() => applyPreset('google.com')}
              className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-medium hover:bg-emerald-100 transition-colors"
            >
              ✅ Established Domain
            </button>
          </div>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="bg-white p-6 rounded-xl border border-[#e5e2dc] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[#52504c] uppercase tracking-wider block">Assessed Domain Risk</span>
              <div className="mt-2 flex items-center space-x-3">
                <RiskBadge level={result.risk_level} size="lg" />
                <span className="text-sm font-bold text-[#1c1a17]">
                  Risk Score: {result.risk_score} / 100
                </span>
              </div>
              <p className="text-xs text-[#52504c] mt-2 font-medium">
                Domain Under Investigation: <span className="font-mono text-[#1c1a17]">{result.domain}</span>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {result.rdap.is_newly_registered && (
                <span className="px-3 py-1.5 rounded-lg bg-red-100 text-red-800 text-xs font-bold border border-red-200">
                  🚨 Newly Registered (&lt; 30 Days)
                </span>
              )}
              {result.brand_findings.length > 0 && (
                <span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
                  ⚠️ Brand Mimicry Detected
                </span>
              )}
            </div>
          </div>

          {/* RDAP & Certificate Transparency Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RDAP Lifecycle */}
            <div className="bg-white p-5 rounded-xl border border-[#e5e2dc] shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-[#1c1a17] uppercase tracking-wider flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>RDAP Registration Provenance</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#f5f2eb] p-2.5 rounded-lg border border-[#e5e2dc]">
                  <span className="text-[#52504c] block text-[10px] uppercase font-bold">Registration Age</span>
                  <span className="text-sm font-bold text-[#1c1a17] block mt-0.5">
                    {result.rdap.age_days !== null && result.rdap.age_days !== undefined ? `${result.rdap.age_days} days` : 'Unavailable'}
                  </span>
                </div>
                <div className="bg-[#f5f2eb] p-2.5 rounded-lg border border-[#e5e2dc]">
                  <span className="text-[#52504c] block text-[10px] uppercase font-bold">Creation Date</span>
                  <span className="text-xs font-medium text-[#1c1a17] block mt-0.5 truncate">
                    {result.rdap.creation_date ? result.rdap.creation_date.split('T')[0] : 'N/A'}
                  </span>
                </div>
                <div className="bg-[#f5f2eb] p-2.5 rounded-lg border border-[#e5e2dc] col-span-2">
                  <span className="text-[#52504c] block text-[10px] uppercase font-bold">Authoritative Registrar</span>
                  <span className="text-xs font-semibold text-[#1c1a17] block mt-0.5 truncate">
                    {result.rdap.registrar || 'Registry Privacy Shield / Unavailable'}
                  </span>
                </div>
              </div>
            </div>

            {/* Certificate Transparency */}
            <div className="bg-white p-5 rounded-xl border border-[#e5e2dc] shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-[#1c1a17] uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Certificate Transparency Log Telemetry</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#f5f2eb] p-2.5 rounded-lg border border-[#e5e2dc]">
                  <span className="text-[#52504c] block text-[10px] uppercase font-bold">Certificates Logged</span>
                  <span className="text-sm font-bold text-[#1c1a17] block mt-0.5">
                    {result.certificate_transparency.certificate_count}
                  </span>
                </div>
                <div className="bg-[#f5f2eb] p-2.5 rounded-lg border border-[#e5e2dc]">
                  <span className="text-[#52504c] block text-[10px] uppercase font-bold">Observed Subdomains</span>
                  <span className="text-sm font-bold text-[#1c1a17] block mt-0.5">
                    {result.certificate_transparency.observed_subdomains.length}
                  </span>
                </div>
                <div className="bg-[#f5f2eb] p-2.5 rounded-lg border border-[#e5e2dc] col-span-2">
                  <span className="text-[#52504c] block text-[10px] uppercase font-bold">Historical Certificate Issuers</span>
                  <span className="text-xs text-[#1c1a17] block mt-0.5 truncate">
                    {result.certificate_transparency.issuers.length > 0 
                      ? result.certificate_transparency.issuers.join(', ') 
                      : 'None observed or query timed out'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Mimicry & Homoglyph Findings Table */}
          {result.brand_findings.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-[#e5e2dc] shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-[#1c1a17] uppercase tracking-wider flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Brand Impersonation & Homoglyph Findings ({result.brand_findings.length})</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#e5e2dc] text-[#52504c]">
                      <th className="py-2 px-3 font-bold uppercase text-[10px]">Targeted Brand</th>
                      <th className="py-2 px-3 font-bold uppercase text-[10px]">Impersonation Mechanism</th>
                      <th className="py-2 px-3 font-bold uppercase text-[10px]">Confidence</th>
                      <th className="py-2 px-3 font-bold uppercase text-[10px]">Official Infrastructure</th>
                      <th className="py-2 px-3 font-bold uppercase text-[10px]">Forensic Assessment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.brand_findings.map((finding, idx) => (
                      <tr key={idx} className="border-b border-[#f5f2eb] hover:bg-[#faf8f5]">
                        <td className="py-2.5 px-3 font-bold text-[#1c1a17] uppercase">{finding.brand_name}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#f5f2eb] text-[#1c1a17] border border-[#e5e2dc]">
                            {finding.impersonation_type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-red-600">{finding.confidence}%</td>
                        <td className="py-2.5 px-3 font-mono text-[#52504c]">{finding.official_domain}</td>
                        <td className="py-2.5 px-3 text-[#52504c]">{finding.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Warnings & Evidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-[#e5e2dc] shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-[#1c1a17] uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Domain Warning Signals</span>
              </h3>
              {result.warning_signals.length > 0 ? (
                <ul className="space-y-2 text-xs text-[#52504c]">
                  {result.warning_signals.map((w, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-700 font-medium">No predatory domain age or mimicry signals detected.</p>
              )}
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#e5e2dc] shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-[#1c1a17] uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Actionable Recommendations</span>
              </h3>
              <ul className="space-y-2 text-xs text-[#52504c]">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainIntelligence;
