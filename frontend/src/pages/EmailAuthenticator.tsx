import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Fingerprint
} from 'lucide-react';
import { authenticateEmail } from '../services/api';
import { EmailAuthenticationResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';

const EmailAuthenticator: React.FC = () => {
  const [content, setContent] = useState<string>(
    'From: "PayPal Security Team" <security-updates@gmail.com>\nReply-To: claims-collector@yahoo.com\nSubject: Urgent: Verify Account Restriction\nReceived-SPF: softfail\n\nDear Customer, your account has been temporarily restricted. Please confirm your details.'
  );
  const [result, setResult] = useState<EmailAuthenticationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthenticate = async () => {
    if (!content.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await authenticateEmail(content.trim());
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to authenticate email.');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: string) => {
    setContent(preset);
    setResult(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PASS':
        return <span className="px-2.5 py-0.5 rounded font-bold text-xs bg-emerald-100 text-emerald-800">PASS</span>;
      case 'FAIL':
        return <span className="px-2.5 py-0.5 rounded font-bold text-xs bg-red-100 text-red-800">FAIL</span>;
      case 'SOFTFAIL':
      case 'QUARANTINE':
      case 'REJECT':
        return <span className="px-2.5 py-0.5 rounded font-bold text-xs bg-amber-100 text-amber-800">{status}</span>;
      case 'NOT_AVAILABLE':
        return <span className="px-2.5 py-0.5 rounded font-bold text-xs bg-gray-100 text-gray-700">NOT AVAILABLE</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded font-bold text-xs bg-gray-100 text-gray-700">{status}</span>;
    }
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
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Core Innovation 4 • Vigil Inspired
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[#faf8f5] tracking-tight">
          Email Authentication & Sender Trust (SPF/DKIM/DMARC)
        </h1>
        <p className="text-sm text-[#a8a29e] mt-1 max-w-3xl">
          Verifies email message provenance by inspecting raw RFC 5322 headers and querying authoritative domain DNS records. Exposes display-name spoofing, deceptive Reply-To hops, and unauthenticated sender infrastructure.
        </p>
      </div>

      {/* Input Box & Presets */}
      <div className="bg-white p-6 rounded-xl border border-[#e5e2dc] shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#1c1a17] uppercase tracking-wider mb-2">
            Paste Raw Email Headers or Message Text
          </label>
          <textarea
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste raw email headers (From:, Reply-To:, Received-SPF:, etc.) or full email content..."
            className="w-full text-xs p-3 bg-[#f5f2eb] border border-[#e5e2dc] rounded-lg text-[#1c1a17] font-mono focus:outline-none focus:ring-1 focus:ring-[#1c1a17]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => applyPreset('From: "PayPal Security Alert" <support@gmail.com>\nReply-To: refund-tracker@yahoo.com\nSubject: Account Suspension Notice\nReceived-SPF: softfail\n\nYour account has been restricted.')}
              className="px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 text-red-800 font-medium hover:bg-red-100 transition-colors"
            >
              🚨 Spoofed Display Name
            </button>
            <button
              onClick={() => applyPreset('From: "GitHub Notifications" <noreply@github.com>\nReply-To: noreply@github.com\nSubject: Security alert for repository\nReceived-SPF: pass\nDKIM-Signature: v=1; d=github.com; s=smtp;\n\nA security advisory was published.')}
              className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-medium hover:bg-emerald-100 transition-colors"
            >
              ✅ Authenticated Sender
            </button>
            <button
              onClick={() => applyPreset('Dear customer, you have won Rs 50,000 lottery. Call +91 9876543210 immediately.')}
              className="px-3 py-1.5 rounded-lg border border-[#e5e2dc] bg-[#f5f2eb] text-[#1c1a17] font-medium hover:bg-[#eae6de] transition-colors"
            >
              📄 Plain Message (No Headers)
            </button>
          </div>

          <button
            onClick={handleAuthenticate}
            disabled={loading || !content.trim()}
            className="px-6 py-2.5 bg-[#1c1a17] hover:bg-[#2b2823] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            {loading ? 'Authenticating...' : 'Verify Sender Trust'}
          </button>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white p-6 rounded-xl border border-[#e5e2dc] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[#52504c] uppercase tracking-wider block">Assessed Sender Risk</span>
              <div className="mt-2 flex items-center space-x-3">
                <RiskBadge level={result.risk_level} size="lg" />
                <span className="text-sm font-bold text-[#1c1a17]">
                  Risk Score: {result.risk_score} / 100
                </span>
              </div>
              <p className="text-xs text-[#52504c] mt-2 font-medium max-w-2xl leading-relaxed">
                {result.plain_english_explanation}
              </p>
            </div>

            <div className="bg-[#f5f2eb] p-4 rounded-xl border border-[#e5e2dc] text-xs space-y-1.5 self-start md:self-auto shrink-0">
              <span className="text-[#52504c] font-bold block uppercase tracking-wider text-[10px]">Header Presence</span>
              <span className={`inline-block font-bold text-xs ${result.has_headers ? 'text-emerald-700' : 'text-amber-700'}`}>
                {result.has_headers ? '✓ RFC 5322 Headers Parsed' : '⚠️ Headers Missing (Text Only)'}
              </span>
              <span className="text-[#52504c] font-bold block uppercase tracking-wider text-[10px] mt-2">Domain Alignment</span>
              <span className={`inline-block font-bold text-xs ${result.alignment_verified ? 'text-emerald-700' : 'text-red-700'}`}>
                {result.alignment_verified ? '✓ From & Reply-To Aligned' : '✗ Alignment Mismatch Detected'}
              </span>
            </div>
          </div>

          {/* 3 Pillars Matrix: SPF, DKIM, DMARC */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-[#e5e2dc] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#1c1a17]">SPF (Sender Policy Framework)</span>
                {getStatusBadge(result.spf_status)}
              </div>
              <p className="text-xs text-[#52504c] leading-relaxed">
                Verifies if the sending mail server IP is authorized to transmit messages for the sender's domain.
              </p>
              {result.spf_record && (
                <div className="bg-[#f5f2eb] p-2 rounded text-[10px] font-mono text-[#1c1a17] truncate" title={result.spf_record}>
                  {result.spf_record}
                </div>
              )}
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#e5e2dc] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#1c1a17]">DKIM (DomainKeys Identified Mail)</span>
                {getStatusBadge(result.dkim_status)}
              </div>
              <p className="text-xs text-[#52504c] leading-relaxed">
                Validates the cryptographic public-key signature proving the email body has not been modified in transit.
              </p>
              <span className="text-[11px] font-medium text-[#78716c] block">
                Signature Header: {result.headers.has_dkim_signature ? 'Present' : 'Not detected'}
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#e5e2dc] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#1c1a17]">DMARC Policy Enforcement</span>
                {getStatusBadge(result.dmarc_status)}
              </div>
              <p className="text-xs text-[#52504c] leading-relaxed">
                Defines what receiving mail servers should do when SPF or DKIM fails (none, quarantine, reject).
              </p>
              <span className="text-[11px] font-medium text-[#78716c] block capitalize">
                Domain Policy: {result.dmarc_policy || 'No DMARC record'}
              </span>
            </div>
          </div>

          {/* Parsed Headers Breakdown */}
          {result.has_headers && (
            <div className="bg-white p-5 rounded-xl border border-[#e5e2dc] shadow-sm">
              <h3 className="text-xs font-bold text-[#1c1a17] uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <Fingerprint className="w-4 h-4 text-blue-600" />
                <span>Extracted Header Forensic Breakdown</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-[#f5f2eb] p-3 rounded-lg border border-[#e5e2dc]">
                  <span className="text-[#52504c] font-bold block text-[10px] uppercase">Declared Sender (From)</span>
                  <span className="text-[#1c1a17] block mt-1 break-all">{result.headers.from_header || 'N/A'}</span>
                  <span className="text-[#78716c] text-[10px] block mt-0.5">Domain: {result.headers.from_domain || 'N/A'}</span>
                </div>
                <div className="bg-[#f5f2eb] p-3 rounded-lg border border-[#e5e2dc]">
                  <span className="text-[#52504c] font-bold block text-[10px] uppercase">Reply Route (Reply-To)</span>
                  <span className="text-[#1c1a17] block mt-1 break-all">{result.headers.reply_to || 'Same as sender'}</span>
                  <span className="text-[#78716c] text-[10px] block mt-0.5">Domain: {result.headers.reply_to_domain || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Warnings & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-[#e5e2dc] shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-[#1c1a17] uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Warning Signals ({result.warning_signals.length})</span>
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
                <p className="text-xs text-emerald-700 font-medium">No deceptive routing or spoofing signals identified.</p>
              )}
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#e5e2dc] shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-[#1c1a17] uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Protective Measures</span>
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

export default EmailAuthenticator;
