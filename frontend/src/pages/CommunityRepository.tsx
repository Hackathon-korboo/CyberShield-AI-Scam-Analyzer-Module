import React, { useState, useEffect } from 'react';
import { 
  Users, 
  PlusCircle, 
  Filter, 
  CheckCircle2, 
  Lock, 
  RefreshCw
} from 'lucide-react';
import { getCommunityFeed, submitCommunityIndicator } from '../services/api';
import { CommunityFeedResponse } from '../types';

const CommunityRepository: React.FC = () => {
  const [feed, setFeed] = useState<CommunityFeedResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  
  // Modal / Form state
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [indType, setIndType] = useState<string>('url');
  const [indValue, setIndValue] = useState<string>('');
  const [category, setCategory] = useState<string>('phishing');
  const [severity, setSeverity] = useState<string>('High');
  const [notes, setNotes] = useState<string>('');
  const [consent, setConsent] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const res = await getCommunityFeed({
        category: categoryFilter || undefined,
        indicator_type: typeFilter || undefined
      });
      setFeed(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [categoryFilter, typeFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent || !indValue.trim()) return;

    try {
      setSubmitting(true);
      setSubmitError(null);
      await submitCommunityIndicator({
        indicator_type: indType,
        indicator_value: indValue.trim(),
        category,
        severity,
        reporter_notes: notes.trim() || undefined,
        user_consent: consent
      });
      setSubmitSuccess('Indicator sanitized and published to community feed successfully!');
      setIndValue('');
      setNotes('');
      setConsent(false);
      fetchFeed();
      setTimeout(() => {
        setShowSubmitModal(false);
        setSubmitSuccess(null);
      }, 1500);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.detail || err?.message || 'Failed to submit indicator.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1c1a17] text-white p-6 rounded-xl border border-[#2b2823] shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Core Innovation 9 • Veriq Inspired
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#faf8f5] tracking-tight">
              Privacy-Preserving Community Threat Repository
            </h1>
            <p className="text-sm text-[#a8a29e] mt-1 max-w-3xl">
              Crowdsourced threat indicator telemetry with strict zero-PII gates. Enables peer threat sharing while ensuring personal messages, passwords, and banking details are categorically scrubbed before publication.
            </p>
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors self-start md:self-auto shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Sanitized Indicator</span>
          </button>
        </div>
      </div>

      {/* Zero PII Policy Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-emerald-900">
        <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Zero-PII Crowdsourcing Guarantee</span>
          <p className="mt-0.5 leading-relaxed text-[#52504c]">
            All submitted URLs and indicators are automatically defanged (e.g. <code>hxxp://</code> and <code>[.]</code>) and reporter notes pass through CyberShield's automated PII Redactor to eliminate personal phone numbers, emails, and account secrets.
          </p>
        </div>
      </div>

      {/* Feed Filters & Controls */}
      <div className="bg-white p-4 rounded-xl border border-[#e5e2dc] shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-[#52504c]" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold text-[#1c1a17] bg-[#f5f2eb] border border-[#e5e2dc] rounded-md px-2.5 py-1.5 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="phishing">Phishing</option>
            <option value="upi_scam">UPI Fraud</option>
            <option value="malware">Malware</option>
            <option value="financial_fraud">Financial Fraud</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-semibold text-[#1c1a17] bg-[#f5f2eb] border border-[#e5e2dc] rounded-md px-2.5 py-1.5 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="url">URLs</option>
            <option value="domain">Domains</option>
            <option value="upi_vpa">UPI VPAs</option>
            <option value="phone">Phones</option>
          </select>
        </div>

        <button
          onClick={fetchFeed}
          disabled={loading}
          className="text-xs text-[#52504c] hover:text-[#1c1a17] font-semibold flex items-center space-x-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Community Feed Table */}
      <div className="bg-white rounded-xl border border-[#e5e2dc] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#e5e2dc] bg-[#f5f2eb] text-[#52504c]">
                <th className="py-3 px-4 font-bold uppercase text-[10px]">Defanged Indicator</th>
                <th className="py-3 px-4 font-bold uppercase text-[10px]">Type</th>
                <th className="py-3 px-4 font-bold uppercase text-[10px]">Category</th>
                <th className="py-3 px-4 font-bold uppercase text-[10px]">Severity</th>
                <th className="py-3 px-4 font-bold uppercase text-[10px]">Sanitized Observations</th>
                <th className="py-3 px-4 font-bold uppercase text-[10px]">Reported Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#a8a29e]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
                    <span>Loading community feed...</span>
                  </td>
                </tr>
              ) : !feed || feed.indicators.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#52504c]">
                    <Users className="w-8 h-8 text-[#a8a29e] mx-auto mb-2" />
                    <p className="font-semibold text-sm text-[#1c1a17]">No community indicators reported yet</p>
                    <p className="text-xs text-[#78716c] mt-1">Be the first to share an anonymized scam indicator with peer defenders.</p>
                  </td>
                </tr>
              ) : (
                feed.indicators.map((item) => (
                  <tr key={item.id} className="border-b border-[#f5f2eb] hover:bg-[#faf8f5]">
                    <td className="py-3 px-4 font-mono font-bold text-[#1c1a17] break-all">
                      {item.indicator_value}
                    </td>
                    <td className="py-3 px-4 capitalize font-semibold text-[#52504c]">
                      {item.indicator_type}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f5f2eb] text-[#1c1a17] border border-[#e5e2dc] uppercase">
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                        item.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#52504c] max-w-xs truncate">
                      {item.reporter_notes || 'No extra notes provided.'}
                    </td>
                    <td className="py-3 px-4 text-[#78716c] text-[11px] whitespace-nowrap">
                      {item.submitted_at ? item.submitted_at.split('T')[0] : 'Today'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#e5e2dc] shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e2dc] pb-3">
              <h3 className="text-base font-bold text-[#1c1a17]">Submit Anonymized Threat Indicator</h3>
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="text-[#52504c] hover:text-[#1c1a17] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600 mb-1" />
                <p>{submitSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {submitError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-800">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1c1a17] mb-1">Indicator Type</label>
                    <select
                      value={indType}
                      onChange={(e) => setIndType(e.target.value)}
                      className="w-full p-2 bg-[#f5f2eb] border border-[#e5e2dc] rounded-lg text-[#1c1a17]"
                    >
                      <option value="url">Malicious URL</option>
                      <option value="domain">Deceptive Domain</option>
                      <option value="upi_vpa">Scam UPI VPA</option>
                      <option value="phone">Scam Phone Number</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1c1a17] mb-1">Threat Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2 bg-[#f5f2eb] border border-[#e5e2dc] rounded-lg text-[#1c1a17]"
                    >
                      <option value="phishing">Phishing & Credential Theft</option>
                      <option value="upi_scam">UPI / QR Payment Scam</option>
                      <option value="malware">Malware & Rogue APK</option>
                      <option value="lottery_scam">Fake Lottery / Prize</option>
                      <option value="financial_fraud">Bank Account Fraud</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1c1a17] mb-1">Severity Rating</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="w-full p-2 bg-[#f5f2eb] border border-[#e5e2dc] rounded-lg text-[#1c1a17]"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1c1a17] mb-1">Indicator Value</label>
                  <input
                    type="text"
                    required
                    value={indValue}
                    onChange={(e) => setIndValue(e.target.value)}
                    placeholder="e.g. http://malicious-login.com or fraudster@upi"
                    className="w-full p-2.5 bg-[#f5f2eb] border border-[#e5e2dc] rounded-lg text-[#1c1a17] font-mono"
                  />
                  <p className="text-[10px] text-[#78716c] mt-1">URLs will be automatically defanged before publication.</p>
                </div>

                <div>
                  <label className="block font-bold text-[#1c1a17] mb-1">Reporter Notes (Optional Context)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Briefly describe the scam pretext. Do not include passwords or personal secrets."
                    className="w-full p-2 bg-[#f5f2eb] border border-[#e5e2dc] rounded-lg text-[#1c1a17]"
                  />
                </div>

                <div className="p-3 bg-[#f5f2eb] rounded-lg border border-[#e5e2dc] flex items-start space-x-2.5">
                  <input
                    type="checkbox"
                    id="consent-check"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#1c1a17] focus:ring-[#1c1a17] cursor-pointer"
                  />
                  <label htmlFor="consent-check" className="text-[11px] text-[#52504c] cursor-pointer leading-relaxed">
                    <strong>Mandatory Consent</strong>: I explicitly consent to share this sanitized technical indicator with peer cybersecurity defenders. I understand CyberShield AI automatically strips personal identifiable information.
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 bg-[#f5f2eb] text-[#52504c] font-semibold rounded-lg hover:bg-[#eae6de]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!consent || !indValue.trim() || submitting}
                    className="px-4 py-2 bg-[#1c1a17] text-white font-bold rounded-lg hover:bg-[#2b2823] disabled:opacity-50"
                  >
                    {submitting ? 'Sanitizing & Publishing...' : 'Publish Indicator'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityRepository;
