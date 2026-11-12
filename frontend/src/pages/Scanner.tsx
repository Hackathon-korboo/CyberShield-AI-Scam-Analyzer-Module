import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Server,
  Network,
  PhoneCall,
  QrCode,
  Mail,
  Globe,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { scanUrl, scanMessage, scanQRMaster, scanEmailMaster } from '../services/api';
import { ScanDetail } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ScoreGauge } from '../components/ScoreGauge';
import { VerificationCard } from '../components/VerificationCard';

type Channel = 'url' | 'message' | 'qr' | 'email';

export const Scanner: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [channel, setChannel] = useState<Channel>('url');
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sample quick test buttons per channel
  const samplesByChannel: Record<Channel, { label: string; payload: string }[]> = {
    url: [
      { label: 'Synthetic Malware C2', payload: 'https://test-malware.cyber/payload.exe' },
      { label: 'Synthetic Phish Login', payload: 'https://test-phish.cyber/banking/auth' },
      { label: 'Suspicious IP Literal', payload: 'http://185.220.101.5:8080/admin' },
      { label: 'Clean Baseline', payload: 'https://example.com' },
    ],
    message: [
      {
        label: 'Urgent Bank KYC Threat',
        payload: 'URGENT: Your SBI bank account will be blocked within 24 hours due to missing KYC. Click immediately to update PAN: https://sbi-kyc-update.xyz and avoid suspension.'
      },
      {
        label: 'Lottery / Prize Lure',
        payload: 'Congratulations! You have won Rs 50,000 in KBC Lucky Draw. Contact Mr Sharma at +91 9876543210 or scan UPI QR to claim your prize money immediately.'
      },
      {
        label: 'Legitimate Calendar Invite',
        payload: 'Hi team, let us meet tomorrow at 10:00 AM on Google Meet to review project architecture. Thanks, Rahul.'
      }
    ],
    qr: [
      {
        label: 'Scan-to-Receive Fraud Lure',
        payload: 'upi://pay?pa=refund-support@okhdfcbank&pn=Paytm+Helpdesk&am=4500&cu=INR&tn=Scan+QR+to+receive+cashback'
      },
      {
        label: 'Brand Impersonation VPA',
        payload: 'upi://pay?pa=sbi-kyc-helpline@ybl&pn=SBI+Verification+Desk&am=1&cu=INR&tn=KYC+activation'
      },
      {
        label: 'Benign Merchant Coffee',
        payload: 'upi://pay?pa=blue-tokai@icici&pn=Blue+Tokai+Coffee&am=240&cu=INR&tn=Invoice+10492'
      }
    ],
    email: [
      {
        label: 'Display Name Spoof & DMARC Fail',
        payload: `From: "PayPal Account Security" <spoofed-support@paypal-alert.xyz>
Reply-To: phisher-inbox@attacker-domain.cc
Subject: Urgent: Unauthorized login detected from Lagos, Nigeria
To: victim@company.com

Dear Customer, we noticed an unusual login attempt. Please confirm your identity immediately.`
      },
      {
        label: 'Legitimate Domain Alignment',
        payload: `From: Google Cloud Support <cloud-noreply@google.com>
Reply-To: cloud-noreply@google.com
Subject: Your Google Cloud invoice is available
To: user@example.com

Your billing statement for this cycle is ready to view in the Cloud Console.`
      }
    ]
  };

  useEffect(() => {
    const tabParam = searchParams.get('tab') as Channel | null;
    if (tabParam && ['url', 'message', 'qr', 'email'].includes(tabParam)) {
      setChannel(tabParam);
    }

    const urlParam = searchParams.get('url');
    const msgParam = searchParams.get('message');
    const qrParam = searchParams.get('qr');
    const emailParam = searchParams.get('email');

    if (urlParam) {
      setChannel('url');
      setInputVal(urlParam);
      executeScan('url', urlParam);
    } else if (msgParam) {
      setChannel('message');
      setInputVal(msgParam);
      executeScan('message', msgParam);
    } else if (qrParam) {
      setChannel('qr');
      setInputVal(qrParam);
      executeScan('qr', qrParam);
    } else if (emailParam) {
      setChannel('email');
      setInputVal(emailParam);
      executeScan('email', emailParam);
    }
  }, [searchParams]);

  const executeScan = async (activeChannel: Channel, targetText: string) => {
    if (!targetText.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let data: ScanDetail;
      if (activeChannel === 'url') {
        data = await scanUrl(targetText.trim());
      } else if (activeChannel === 'message') {
        data = await scanMessage(targetText.trim());
      } else if (activeChannel === 'qr') {
        data = await scanQRMaster(targetText.trim());
      } else {
        data = await scanEmailMaster(targetText.trim());
      }
      setResult(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          'Failed to execute threat intelligence investigation. Please verify input syntax.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeScan(channel, inputVal);
  };

  const switchChannel = (c: Channel) => {
    setChannel(c);
    setInputVal('');
    setError(null);
    setSearchParams({ tab: c });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/30 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
            <Shield size={14} /> Multi-Vector Investigation Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141416]">
            Target Investigation &amp; Triage Console
          </h1>
          <p className="text-sm text-[#52504c] mt-1 max-w-2xl font-medium leading-relaxed">
            Audit URLs, analyze deceptive messages, decode QR &amp; UPI payment lures, or authenticate email provenance with deterministic evidence and cryptographic hash proofs.
          </p>
        </div>

        <Link
          to="/history"
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white border border-[#dedad2] text-xs font-bold text-[#141416] hover:border-[#141416] transition-colors font-mono flex items-center gap-1.5 shadow-xs"
        >
          View Investigation Registry <ArrowRight size={13} />
        </Link>
      </div>

      {/* Channel Switcher Tabs */}
      <div className="bg-white border border-[#dedad2] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap gap-2 p-1.5 bg-[#f7f5f0] rounded-xl border border-[#dedad2]">
          <button
            type="button"
            onClick={() => switchChannel('url')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 ${
              channel === 'url'
                ? 'bg-[#141416] text-white shadow-sm'
                : 'text-[#52504c] hover:text-[#141416] hover:bg-white'
            }`}
          >
            <Globe size={14} className={channel === 'url' ? 'text-[#ff5500]' : ''} />
            <span>URL / Domain</span>
          </button>
          <button
            type="button"
            onClick={() => switchChannel('message')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 ${
              channel === 'message'
                ? 'bg-[#141416] text-white shadow-sm'
                : 'text-[#52504c] hover:text-[#141416] hover:bg-white'
            }`}
          >
            <Sparkles size={14} className={channel === 'message' ? 'text-[#ff5500]' : ''} />
            <span>Message / SMS</span>
          </button>
          <button
            type="button"
            onClick={() => switchChannel('qr')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 ${
              channel === 'qr'
                ? 'bg-[#141416] text-white shadow-sm'
                : 'text-[#52504c] hover:text-[#141416] hover:bg-white'
            }`}
          >
            <QrCode size={14} className={channel === 'qr' ? 'text-[#ff5500]' : ''} />
            <span>QR &amp; UPI Code</span>
          </button>
          <button
            type="button"
            onClick={() => switchChannel('email')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 ${
              channel === 'email'
                ? 'bg-[#141416] text-white shadow-sm'
                : 'text-[#52504c] hover:text-[#141416] hover:bg-white'
            }`}
          >
            <Mail size={14} className={channel === 'email' ? 'text-[#ff5500]' : ''} />
            <span>Email Authenticator</span>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {channel === 'url' ? (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#787570] w-5 h-5" />
              <input
                type="text"
                placeholder="Enter URL, hostname, or IP (e.g., https://login-verify-account.top/auth)"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={loading}
                className="w-full pl-12 pr-36 py-4 bg-[#f7f5f0] border border-[#dedad2] rounded-xl text-[#141416] placeholder-[#787570] text-sm focus:outline-none focus:bg-white focus:border-[#ff5500] focus:ring-2 focus:ring-[#ff5500]/20 font-mono transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={loading || !inputVal.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-[#ff5500] hover:bg-[#e04b00] disabled:bg-[#dedad2] disabled:text-[#787570] text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-all font-mono cursor-pointer"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Shield size={14} />
                )}
                <span>{loading ? 'Auditing...' : 'Scan URL'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                rows={channel === 'email' ? 5 : 4}
                placeholder={
                  channel === 'message'
                    ? 'Paste SMS, WhatsApp message, or email body. Personal data (names, phone numbers, OTPs) will be automatically scrubbed locally before AI reasoning.'
                    : channel === 'qr'
                    ? 'Paste decoded QR string or UPI URI (e.g. upi://pay?pa=merchant@upi&pn=Store&am=500). Verifies against scan-to-receive fraud without initiating any payment.'
                    : 'Paste raw RFC 5322 email headers or full email text with From, Reply-To, and Subject. Checks SPF, DKIM, DMARC alignment and sender impersonation.'
                }
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={loading}
                className="w-full p-4 bg-[#f7f5f0] border border-[#dedad2] rounded-xl text-[#141416] placeholder-[#787570] text-xs focus:outline-none focus:bg-white focus:border-[#ff5500] focus:ring-2 focus:ring-[#ff5500]/20 font-mono transition-all shadow-inner resize-none"
              />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-[#52504c] font-mono">
                  {channel === 'message' && '🛡️ PII Shield Active: Reversible local tokenization protects your privacy.'}
                  {channel === 'qr' && '🔒 Payment Isolation: Zero outbound payment requests dispatched.'}
                  {channel === 'email' && '📬 RFC 5322 & DNS TXT query verification enabled.'}
                </span>
                <button
                  type="submit"
                  disabled={loading || !inputVal.trim()}
                  className="px-6 py-2.5 bg-[#ff5500] hover:bg-[#e04b00] disabled:bg-[#dedad2] disabled:text-[#787570] text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-all font-mono self-end cursor-pointer"
                >
                  {loading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Shield size={14} />
                  )}
                  <span>{loading ? 'Investigating Target...' : 'Execute Investigation'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-[#52504c] font-mono">
            <span className="font-bold text-[#141416]">Quick Test Samples:</span>
            {samplesByChannel[channel].map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputVal(s.payload);
                  executeScan(channel, s.payload);
                }}
                className="px-2.5 py-1 rounded-md bg-[#f7f5f0] hover:bg-white text-[#141416] border border-[#dedad2] text-[11px] font-medium transition-colors cursor-pointer shadow-xs"
              >
                {s.label}
              </button>
            ))}
          </div>
        </form>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 font-medium font-mono">
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
            <h4 className="text-base font-bold text-[#141416] font-mono">Conducting Multi-Vector Forensics</h4>
            <p className="text-xs text-[#52504c] mt-1 font-medium font-sans">
              Interrogating threat feeds &bull; Evaluating behavioral heuristics &bull; Generating cryptographic SHA-256 proof
            </p>
          </div>
        </div>
      )}

      {/* Scan Results Display */}
      {result && !loading && (
        <div className="space-y-8">
          {/* Action Bar Linking to Deep Innovations */}
          <div className="p-4 bg-white border border-[#dedad2] rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#141416]">Investigation Completed:</span>
              <span className="text-xs text-[#52504c]">ID {result.scan_id.slice(0, 8)}...</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/report/${result.scan_id}`}
                className="px-3.5 py-1.5 rounded-lg bg-[#ff5500] text-white text-xs font-bold hover:bg-[#e04b00] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                Canonical Report Dossier <ExternalLink size={12} />
              </Link>
              <Link
                to={`/graph?scan_id=${result.scan_id}`}
                className="px-3.5 py-1.5 rounded-lg bg-[#f7f5f0] text-[#141416] border border-[#dedad2] text-xs font-bold hover:bg-white transition-colors flex items-center gap-1.5"
              >
                <Network size={13} className="text-amber-600" /> Explore Threat Graph
              </Link>
              {(result.risk_level === 'High' || result.risk_level === 'Critical') && (
                <Link
                  to={`/golden-hour?scan_id=${result.scan_id}&scenario=${result.scan_type === 'qr' ? 'financial_fraud' : 'phishing_credentials'}`}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <PhoneCall size={13} /> Golden Hour Emergency Plan (1930)
                </Link>
              )}
            </div>
          </div>

          {/* Target Overview Card */}
          <div className="bg-white border border-[#dedad2] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <RiskBadge level={result.risk_level} size="lg" />
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f7f5f0] text-[#141416] border border-[#dedad2] uppercase font-mono">
                    {result.scan_type} Target
                  </span>
                  <span className="text-xs text-[#52504c] font-medium font-mono">
                    Audit Engine: <span className="font-bold text-[#141416]">{result.analysis_engine || 'Master Multi-Vector Triage'}</span>
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#52504c] uppercase tracking-wider block mb-1 font-mono">
                    Target Analyzed
                  </label>
                  <div className="p-3.5 bg-[#f7f5f0] border border-[#dedad2] rounded-xl font-mono text-xs text-[#141416] font-semibold break-all select-all">
                    {result.normalized_target || result.target}
                  </div>
                </div>

                <p className="text-sm text-[#141416] leading-relaxed font-sans font-medium">
                  {result.report.summary}
                </p>
              </div>

              {/* Threat Score Gauge */}
              <div className="flex justify-center">
                <ScoreGauge score={result.risk_score} riskLevel={result.risk_level} />
              </div>
            </div>
          </div>

          {/* Intelligence Feeds Breakdown (for URL Scans) */}
          {result.providers_checked && result.providers_checked.length > 0 && (
            <div className="bg-white border border-[#dedad2] rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
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
                          ) : (
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
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
          )}

          {/* Evidence and Recommendations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Evidence Card */}
            <div className="bg-white border border-[#dedad2] rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
                <AlertTriangle size={16} className="text-amber-600" /> Evidence &amp; Detection Indicators
              </h3>
              {result.report.evidence.length > 0 ? (
                <ul className="space-y-2.5 font-sans">
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
              <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
                <CheckCircle2 size={16} className="text-emerald-600" /> Recommended Cybersecurity Actions
              </h3>
              <ul className="space-y-2.5 font-sans">
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
