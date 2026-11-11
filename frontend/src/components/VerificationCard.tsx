import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, RefreshCw, AlertTriangle, Fingerprint } from 'lucide-react';
import { verifyReport } from '../services/api';
import { VerifyReportResponse } from '../types';

interface VerificationCardProps {
  reportId: string;
  reportHash: string;
  initialStatus: string;
  blockchainTx?: string | null;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({
  reportId,
  reportHash,
  initialStatus,
  blockchainTx
}) => {
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerifyReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (tamperedText?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await verifyReport(reportId, tamperedText);
      setVerificationResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to verify report integrity.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'blockchain_verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 shadow-sm">
            <CheckCircle2 size={13} className="text-purple-600" /> Blockchain Anchored
          </span>
        );
      case 'verification_failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-300 shadow-sm animate-pulse">
            <XCircle size={13} className="text-red-600" /> Integrity Compromised
          </span>
        );
      case 'locally_hashed':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#f7f5f0] text-[#141416] border border-[#dedad2] shadow-sm">
            <Fingerprint size={13} className="text-[#ff5500]" /> Locally Hashed (SHA-256)
          </span>
        );
    }
  };

  const currentStatus = verificationResult
    ? verificationResult.verification_status
    : initialStatus;

  return (
    <div className="bg-white border border-[#dedad2] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#dedad2]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#ff5500]/10 border border-[#ff5500]/20 text-[#ff5500]">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#141416] flex items-center gap-2">
              Report Integrity Verification
            </h3>
            <p className="text-xs text-[#52504c]">
              Deterministic RFC 8785 canonical hash proof
            </p>
          </div>
        </div>
        <div>{getStatusBadge(currentStatus)}</div>
      </div>

      {/* Hash display */}
      <div className="my-5">
        <label className="text-[11px] font-bold text-[#52504c] uppercase tracking-wider block mb-1.5">
          SHA-256 Canonical Fingerprint
        </label>
        <div className="p-3.5 bg-[#f7f5f0] border border-[#dedad2] rounded-xl font-mono text-xs text-[#141416] break-all select-all flex items-center justify-between gap-2 font-medium">
          <span>{reportHash}</span>
        </div>
      </div>

      {/* Blockchain Tx if available */}
      {blockchainTx && (
        <div className="mb-5 p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs">
          <span className="font-bold text-purple-900">Blockchain Transaction: </span>
          <span className="font-mono text-purple-800 select-all break-all">{blockchainTx}</span>
        </div>
      )}

      {/* Verification Result Feedback */}
      {verificationResult && (
        <div
          className={`p-4 rounded-xl border mb-5 text-xs transition-all ${
            verificationResult.is_valid
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {verificationResult.is_valid ? (
              <CheckCircle2 size={16} className="text-emerald-700 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-red-700 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="font-bold text-sm">
                {verificationResult.is_valid
                  ? 'Verification Successful — Authentic Report'
                  : 'Tampering Alert — Integrity Check Failed!'}
              </p>
              <p className="text-[#52504c] mt-1 font-medium">{verificationResult.audit_notes}</p>
              <div className="mt-2 text-[11px] font-mono text-[#52504c] select-all break-all">
                Recalculated: {verificationResult.recalculated_hash}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 mb-4 font-medium">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={() => handleVerify()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#ff5500] hover:bg-[#e04b00] text-white transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Recomputing Hash...' : 'Verify Cryptographic Integrity'}
        </button>

        <button
          onClick={() => handleVerify('MALICIOUS_SIMULATION_TAMPERED_INJECTED_STRING')}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-300 border border-[#dedad2] text-[#52504c] transition-all disabled:opacity-50 shadow-sm"
          title="Simulates a modified report payload to test tamper-detection engine"
        >
          <AlertTriangle size={13} className="text-amber-600" />
          Test Tamper Detection
        </button>
      </div>
    </div>
  );
};
