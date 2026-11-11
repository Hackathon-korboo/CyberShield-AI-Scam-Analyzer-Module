import React, { useState } from 'react';
import {
  MessageSquare,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  ArrowRight,
  FileText
} from 'lucide-react';
import { scanMessage } from '../services/api';
import { ScanDetail } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ScoreGauge } from '../components/ScoreGauge';
import { VerificationCard } from '../components/VerificationCard';

export const MessageAnalyzer: React.FC = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    {
      title: 'Bank Urgency & Credential Theft',
      text: 'URGENT SECURITY ALERT: Your primary checking account has been flagged for suspicious unauthorized activity. Your access will be permanently suspended within 24 hours. Immediately confirm your password, banking login, and PIN code at: https://verify-secure-bank.cc/auth',
    },
    {
      title: 'Telegram Part-Time / Fake Job Scam',
      text: 'Congratulations! You have been selected for part-time remote work at Amazon. Earn Rs 5,000 daily by rating products on Telegram. Deposit mandatory registration fee of Rs 1,500 to activate your worker ID: https://bit.ly/fake-job-pay',
    },
    {
      title: 'Electricity Disconnection / Fake APK Scam',
      text: 'URGENT: Your electricity power supply will be disconnected tonight at 9:30 PM due to unpaid bill of Rs 3,420. Immediately call electricity officer at +91-9876543210 or install BijliUpdate.apk to update KYC.',
    },
    {
      title: 'Executive Wire Transfer Pretext (BEC)',
      text: 'Good morning, this is the Chief Executive Officer. I am currently in a closed-door acquisition meeting and cannot take calls. Please process an immediate wire transfer for $48,500 to our new supplier account before 2:00 PM today. Treat this request with utmost confidentiality.',
    },
    {
      title: 'Microsoft 365 Account Expiry',
      text: 'Action Required: Your Microsoft 365 organizational password expires today. Click the link below to verify your login credentials and retain uninterrupted mailbox access: https://login.microsoftonline.security-portal.xyz/verify',
    },
    {
      title: 'Benign Corporate Newsletter',
      text: 'Hello team, please find attached the monthly cyber security awareness newsletter. This edition covers safe remote working practices and password manager recommendations. Have a wonderful weekend!',
    },
  ];

  const handleAnalyze = async (textToScan?: string) => {
    const text = textToScan ?? content;
    if (!text.trim() || text.length < 5) {
      setError('Please provide a message with at least 5 characters for analysis.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await scanMessage(text);
      setResult(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || 'Failed to analyze message content. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/30 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
          <MessageSquare size={14} /> Social Engineering &amp; Phishing Detection
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141416]">
          AI &amp; Heuristic Message Analyzer
        </h1>
        <p className="text-sm text-[#52504c] mt-1 max-w-2xl font-medium leading-relaxed">
          Paste suspicious emails, SMS messages, or employee outreach to detect pressure tactics,
          credential harvesting indicators, executive impersonation, and fraudulent payment coercion.
        </p>
      </div>

      {/* Input Box Card */}
      <div className="bg-white border border-[#dedad2] rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div>
          <label className="text-xs font-bold text-[#141416] uppercase tracking-wider block mb-2 font-mono">
            Message Body / Email Content
          </label>
          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste suspicious email text, SMS message, or chat snippet here..."
            className="w-full p-4 bg-[#f7f5f0] border border-[#dedad2] rounded-xl text-[#141416] placeholder-[#787570] text-sm focus:outline-none focus:bg-white focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] font-sans transition-all leading-relaxed shadow-inner"
          />
        </div>

        {/* Attack Presets */}
        <div>
          <span className="text-xs font-bold text-[#141416] block mb-2 uppercase tracking-wider font-mono">
            Or select a representative phishing scenario to evaluate:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {presets.map((preset) => (
              <button
                key={preset.title}
                type="button"
                onClick={() => {
                  setContent(preset.text);
                  handleAnalyze(preset.text);
                }}
                className="text-left p-3.5 rounded-xl bg-[#f7f5f0] hover:bg-white border border-[#dedad2] hover:border-[#141416]/20 transition-all group cursor-pointer shadow-xs"
              >
                <div className="text-xs font-bold text-[#141416] group-hover:text-[#ff5500] flex items-center justify-between transition-colors">
                  <span>{preset.title}</span>
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#ff5500]" />
                </div>
                <div className="text-[11px] text-[#52504c] line-clamp-1 mt-1 font-mono font-medium">
                  {preset.text}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-[#52504c] font-medium font-mono">
            <Cpu size={14} className="text-[#ff5500]" />
            <span>Multi-Tier Inspection: Local Heuristics + Optional Gemini AI</span>
          </div>

          <button
            onClick={() => handleAnalyze()}
            disabled={loading || !content.trim()}
            className="px-6 py-3 bg-[#ff5500] hover:bg-[#e04b00] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Evaluating Phishing Intent...
              </>
            ) : (
              <>
                <Shield size={14} /> Analyze Threat Indicators
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 font-medium">
            <AlertTriangle size={16} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {result && !loading && (
        <div className="space-y-8">
          {/* Top Overview Banner */}
          <div className="bg-white border border-[#dedad2] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <RiskBadge level={result.risk_level} size="lg" />
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f7f5f0] text-[#141416] border border-[#dedad2] capitalize font-mono">
                    Engine: {result.analysis_engine?.replace(/_/g, ' ') || 'Deterministic Rule Engine'}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#141416] leading-snug">
                    {result.report.summary}
                  </h3>
                  <p className="text-xs text-[#52504c] mt-1 font-medium">
                    Evaluated against psychological pressure tactics, sensitive keyword requests, and identity pretexting.
                  </p>
                </div>
              </div>

              {/* Threat Score Gauge */}
              <div className="flex justify-center">
                <ScoreGauge score={result.risk_score} riskLevel={result.risk_level} />
              </div>
            </div>
          </div>

          {/* Detected Threat Indicators Breakdown */}
          {result.message_indicators && result.message_indicators.length > 0 && (
            <div className="bg-white border border-[#dedad2] rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
                <AlertTriangle size={16} className="text-amber-600" /> Specific Phishing Indicators Detected
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {result.message_indicators.map((ind, i) => (
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

          {/* Evidence and Recommendations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Evidence Card */}
            <div className="bg-white border border-[#dedad2] rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
                <FileText size={16} className="text-[#ff5500]" /> Forensic Evidence Summary
              </h3>
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
            </div>

            {/* Recommendations Card */}
            <div className="bg-white border border-[#dedad2] rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
                <CheckCircle2 size={16} className="text-emerald-600" /> Prescribed User Response
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

          {/* Cryptographic Verification Card */}
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
