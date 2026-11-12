import React, { useState, useRef } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Smartphone,
  Check
} from 'lucide-react';
import { analyzeQR } from '../services/api';
import { QRAnalysisResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ScoreGauge } from '../components/ScoreGauge';
import { decodeQRFromImage } from '../utils/qrDecoder';
import { CrossDeviceHandoffModal } from '../components/CrossDeviceHandoffModal';

const QRAnalyzer: React.FC = () => {
  const [payloadInput, setPayloadInput] = useState<string>(
    'upi://pay?pa=scammer@upi&pn=Receive+Cashback+Rs5000&am=5000&cu=INR&tn=Scan+to+receive+cashback+reward'
  );
  const [result, setResult] = useState<QRAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Photo browse & Mobile QR handoff state
  const [handoffOpen, setHandoffOpen] = useState<boolean>(false);
  const [decodingPhoto, setDecodingPhoto] = useState<boolean>(false);
  const [decodedNotice, setDecodedNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const executeAnalysis = async (targetPayload: string) => {
    if (!targetPayload.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await analyzeQR(targetPayload.trim());
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to analyze QR payload.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    executeAnalysis(payloadInput);
  };

  const applyPreset = (presetText: string) => {
    setPayloadInput(presetText);
    setResult(null);
  };

  const handlePhotoFileSelected = async (file: File) => {
    setDecodingPhoto(true);
    setError(null);
    setDecodedNotice(null);

    try {
      const decoded = await decodeQRFromImage(file);
      setPayloadInput(decoded);
      setDecodedNotice(decoded);
      executeAnalysis(decoded);
    } catch (err: any) {
      setError(
        err?.message ||
        'No QR code detected in this photo. Please ensure the QR code is clearly visible and in focus.'
      );
    } finally {
      setDecodingPhoto(false);
    }
  };

  const handleMobilePayloadReceived = (payload: string) => {
    setPayloadInput(payload);
    setDecodedNotice(`Received from Phone: ${payload}`);
    executeAnalysis(payload);
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Picker for Laptop Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handlePhotoFileSelected(e.target.files[0]);
          }
        }}
      />

      {/* Cross-Device Pairing Modal */}
      <CrossDeviceHandoffModal
        isOpen={handoffOpen}
        onClose={() => setHandoffOpen(false)}
        onPayloadReceived={handleMobilePayloadReceived}
      />
      {/* Header */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-800 text-xs rounded-lg font-semibold">
          {error}
        </div>
      )}
      <div className="bg-[#1c1a17] text-white p-6 rounded-xl border border-[#2b2823] shadow-md">
        <div className="flex items-center space-x-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Core Innovation 3 • Vexora Inspired
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[#faf8f5] tracking-tight">
          QR Code & UPI Scam Forensics
        </h1>
        <p className="text-sm text-[#a8a29e] mt-1 max-w-3xl">
          Deep structural analysis of decoded QR payloads and NPCI UPI payment URIs. Detects deceptive "Scan-to-Receive" money fraud, fake refund claims, brand impersonation in VPAs, and rogue wireless configurations with zero payment initiation.
        </p>
      </div>

      {/* Input & Presets */}
      <div className="bg-white p-6 rounded-xl border border-[#e5e2dc] shadow-sm space-y-4">
        {/* Cross-Device & Photo Upload Strip (Laptop Gallery vs Phone Camera) */}
        <div className="p-3.5 bg-[#f7f5f0] border border-[#dedad2] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2 text-xs font-bold text-[#141416]">
            <Camera size={16} className="text-[#ff5500]" />
            <span>Image / QR Scanning Options:</span>
            <span className="text-[11px] font-normal text-[#52504c] hidden md:inline">
              Upload screenshot from laptop or scan with phone
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={decodingPhoto}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg bg-white hover:bg-[#faf8f4] text-[#141416] border border-[#dedad2] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ImageIcon size={13} className="text-[#ff5500]" />
              <span>{decodingPhoto ? 'Reading Image...' : 'Browse a Photo / Gallery'}</span>
            </button>

            <button
              type="button"
              onClick={() => setHandoffOpen(true)}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg bg-[#141416] hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Smartphone size={13} className="text-[#ff5500]" />
              <span>Scan with Phone</span>
            </button>
          </div>
        </div>

        {/* Decoded Notice / Success Pill */}
        {decodedNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-2 font-mono">
            <div className="flex items-center gap-2 truncate">
              <Check size={14} className="text-emerald-700 shrink-0" />
              <span className="font-bold">Decoded from Photo:</span>
              <span className="truncate">{decodedNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setDecodedNotice(null)}
              className="text-[10px] text-emerald-700 hover:underline uppercase font-bold shrink-0 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[#1c1a17] uppercase tracking-wider mb-2">
            Decoded QR Payload or UPI Payment URI
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={payloadInput}
              onChange={(e) => setPayloadInput(e.target.value)}
              placeholder="e.g. upi://pay?pa=name@bank&pn=Merchant&am=500"
              className="flex-1 text-xs p-3 bg-[#f5f2eb] border border-[#e5e2dc] rounded-lg text-[#1c1a17] font-mono focus:outline-none focus:ring-1 focus:ring-[#1c1a17]"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !payloadInput.trim()}
              className="px-6 py-3 bg-[#1c1a17] hover:bg-[#2b2823] text-white text-xs font-bold rounded-lg shadow-sm transition-colors shrink-0"
            >
              {loading ? 'Auditing...' : 'Audit Payload'}
            </button>
          </div>
        </div>

        {/* Presets */}
        <div>
          <span className="text-[11px] font-bold text-[#52504c] uppercase tracking-wider block mb-2">
            Test Preset Scenarios:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => applyPreset('upi://pay?pa=scammer@upi&pn=Receive+Cashback+Rs5000&am=5000&cu=INR&tn=Scan+to+receive+cashback+reward')}
              className="px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 text-red-800 font-medium hover:bg-red-100 transition-colors"
            >
              🚨 Scan-to-Receive Fraud
            </button>
            <button
              onClick={() => applyPreset('upi://pay?pa=paytm.refund.desk@okhdfcbank&pn=Paytm+Support&am=1200&cu=INR')}
              className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 font-medium hover:bg-amber-100 transition-colors"
            >
              ⚠️ Paytm Support Impersonation
            </button>
            <button
              onClick={() => applyPreset('upi://pay?pa=grocerystore@icici&pn=Daily+Mart&am=150&cu=INR&tn=Groceries')}
              className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-medium hover:bg-emerald-100 transition-colors"
            >
              ✅ Legitimate Merchant QR
            </button>
            <button
              onClick={() => applyPreset('https://phishing-account-update.xyz/verify')}
              className="px-3 py-1.5 rounded-lg border border-[#e5e2dc] bg-[#f5f2eb] text-[#1c1a17] font-medium hover:bg-[#eae6de] transition-colors"
            >
              🔗 Web URL QR
            </button>
          </div>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Top Result Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-[#e5e2dc] shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#52504c] uppercase tracking-wider block">Assessed Risk</span>
                <div className="mt-2">
                  <RiskBadge level={result.risk_level} size="lg" />
                </div>
                <p className="text-xs text-[#52504c] mt-2 capitalize font-medium">Payload Type: {result.payload_type}</p>
              </div>
              <ScoreGauge score={result.risk_score} riskLevel={result.risk_level} />
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#e5e2dc] shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1c1a17]">Forensic Verdict</h3>
                <p className="text-xs text-[#52504c] mt-2 leading-relaxed font-medium">{result.decoded_summary}</p>
              </div>

              {result.safe_to_proceed ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center space-x-2 mt-4">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Valid standard payment format. Verify the registered business name in your banking app before paying.</span>
                </div>
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-xs flex items-center space-x-2 mt-4 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>HIGH RISK DETECTED: Do NOT approve or enter your UPI PIN. This transaction is deceptive.</span>
                </div>
              )}
            </div>
          </div>

          {/* Critical UPI Rule Alert */}
          {result.payload_type === 'upi' && (
            <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl text-amber-900 text-xs flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Critical NPCI UPI Security Rule</h4>
                <p className="mt-1 leading-relaxed">
                  You <strong>NEVER</strong> need to enter your UPI PIN or scan a QR code to <strong>RECEIVE</strong> money. Scanning a QR code or entering your PIN <strong>ALWAYS DEDUCTS</strong> funds from your account. Any claim that scanning a QR code is required to claim a "refund" or "reward" is 100% fraud.
                </p>
              </div>
            </div>
          )}

          {/* NPCI UPI Parameter Breakdown */}
          {result.upi_details && (
            <div className="bg-white p-6 rounded-xl border border-[#e5e2dc] shadow-sm">
              <h3 className="text-sm font-bold text-[#1c1a17] mb-4 flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>NPCI UPI Decoded Parameter Matrix</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-[#f5f2eb] p-3 rounded-lg border border-[#e5e2dc]">
                  <span className="text-[#52504c] block uppercase tracking-wider text-[10px] font-bold">Payee VPA (pa)</span>
                  <span className="font-mono text-sm font-bold text-[#1c1a17] block mt-1 break-all">
                    {result.upi_details.payee_vpa || 'Not Specified'}
                  </span>
                </div>

                <div className="bg-[#f5f2eb] p-3 rounded-lg border border-[#e5e2dc]">
                  <span className="text-[#52504c] block uppercase tracking-wider text-[10px] font-bold">Payee Name (pn)</span>
                  <span className="text-sm font-bold text-[#1c1a17] block mt-1">
                    {result.upi_details.payee_name || 'Not Specified'}
                  </span>
                </div>

                <div className="bg-[#f5f2eb] p-3 rounded-lg border border-[#e5e2dc]">
                  <span className="text-[#52504c] block uppercase tracking-wider text-[10px] font-bold">Requested Amount (am)</span>
                  <span className="text-sm font-bold text-[#1c1a17] block mt-1">
                    {result.upi_details.amount ? `${result.upi_details.currency || 'INR'} ${result.upi_details.amount}` : 'User-Entered'}
                  </span>
                </div>

                {result.upi_details.transaction_note && (
                  <div className="bg-[#f5f2eb] p-3 rounded-lg border border-[#e5e2dc] md:col-span-2">
                    <span className="text-[#52504c] block uppercase tracking-wider text-[10px] font-bold">Transaction Note (tn)</span>
                    <span className="text-xs text-[#1c1a17] block mt-1 font-medium">
                      "{result.upi_details.transaction_note}"
                    </span>
                  </div>
                )}

                {result.upi_details.merchant_code && (
                  <div className="bg-[#f5f2eb] p-3 rounded-lg border border-[#e5e2dc]">
                    <span className="text-[#52504c] block uppercase tracking-wider text-[10px] font-bold">Merchant Category Code (mc)</span>
                    <span className="text-xs font-mono text-[#1c1a17] block mt-1">
                      {result.upi_details.merchant_code}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Warning Signals & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-[#e5e2dc] shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-[#1c1a17] flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Detected Warning Signals ({result.warning_signals.length})</span>
              </h3>
              {result.warning_signals.length > 0 ? (
                <ul className="space-y-2 text-xs text-[#52504c]">
                  {result.warning_signals.map((sig, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-red-500 font-bold shrink-0">•</span>
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-700 font-medium">No malicious or predatory markers identified.</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#e5e2dc] shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-[#1c1a17] flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Actionable Recommendations</span>
              </h3>
              <ul className="space-y-2 text-xs text-[#52504c]">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
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

export default QRAnalyzer;
