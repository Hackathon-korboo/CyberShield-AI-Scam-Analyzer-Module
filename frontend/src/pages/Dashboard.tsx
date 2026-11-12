import React, { useEffect, useState, useRef } from 'react';
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
  Zap,
  Network,
  PhoneCall,
  QrCode,
  Mail,
  Globe,
  FileCheck,
  Lock,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  Camera,
  Image as ImageIcon,
  Smartphone
} from 'lucide-react';
import { decodeQRFromImage } from '../utils/qrDecoder';
import { CrossDeviceHandoffModal } from '../components/CrossDeviceHandoffModal';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import {
  getStats,
  getSystemStatus,
  getScans,
  scanUrl,
  scanMessage,
  scanQRMaster,
  scanEmailMaster
} from '../services/api';
import { StatsOverviewResponse, SystemStatusResponse, ScanListItem } from '../types';
import { RiskBadge } from '../components/RiskBadge';

const RISK_COLORS: Record<string, string> = {
  Critical: '#dc2626',
  High: '#ea580c',
  Medium: '#d97706',
  Low: '#16a34a',
  Unknown: '#52504c',
};

type LauncherTab = 'url' | 'message' | 'qr' | 'email';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsOverviewResponse | null>(null);
  const [system, setSystem] = useState<SystemStatusResponse | null>(null);
  const [recentScans, setRecentScans] = useState<ScanListItem[]>([]);
  const [, setLoading] = useState(true);

  // Unified Investigation Launcher state
  const [activeTab, setActiveTab] = useState<LauncherTab>('url');
  const [inputVal, setInputVal] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [decodingPhoto, setDecodingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample quick test payloads for easy testing by judges/users
  const samplesByTab: Record<LauncherTab, { label: string; payload: string }[]> = {
    url: [
      { label: 'Synthetic Phish Login', payload: 'https://test-phish.cyber/banking/auth' },
      { label: 'Synthetic Malware C2', payload: 'https://test-malware.cyber/payload.exe' },
      { label: 'Legitimate Domain', payload: 'https://example.com' },
    ],
    message: [
      {
        label: 'Urgent Bank KYC Lure',
        payload: 'URGENT: Your SBI bank account will be blocked within 24 hours due to missing KYC. Click here immediately to update your PAN: https://sbi-kyc-update.xyz and avoid suspension.'
      },
      {
        label: 'Lottery / Prize Lure',
        payload: 'Congratulations! You have won Rs 50,000 in KBC Lucky Draw. Contact Mr Sharma at +91 9876543210 or scan UPI QR to claim your prize money immediately.'
      },
      {
        label: 'Benign Meeting Invitation',
        payload: 'Hi team, let us meet on Google Meet tomorrow at 10:00 AM to review the project architecture. Thanks, Rahul.'
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
    const fetchData = async () => {
      try {
        const [statsData, sysData, scansData] = await Promise.all([
          getStats(),
          getSystemStatus(),
          getScans({ limit: 6 }).catch(() => ({ total: 0, items: [] }))
        ]);
        setStats(statsData);
        setSystem(sysData);
        if (scansData && scansData.items) {
          setRecentScans(scansData.items);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const launchScanWithPayload = async (targetPayload: string, preferredTab?: LauncherTab) => {
    let tab = preferredTab || activeTab;
    if (!preferredTab) {
      if (targetPayload.startsWith('upi://') || targetPayload.includes('pa=')) {
        tab = 'qr';
        setActiveTab('qr');
      } else if (targetPayload.startsWith('http://') || targetPayload.startsWith('https://') || !targetPayload.includes(' ')) {
        tab = 'url';
        setActiveTab('url');
      }
    }
    setInputVal(targetPayload);
    setScanning(true);
    setScanError(null);

    try {
      let res;
      if (tab === 'url') {
        res = await scanUrl(targetPayload);
      } else if (tab === 'message') {
        res = await scanMessage(targetPayload);
      } else if (tab === 'qr') {
        res = await scanQRMaster(targetPayload);
      } else {
        res = await scanEmailMaster(targetPayload);
      }

      if (res && res.scan_id) {
        navigate(`/report/${res.scan_id}`);
      }
    } catch (err: any) {
      setScanError(
        err?.response?.data?.detail ||
        'Investigation failed. Please check target syntax or try again.'
      );
      setScanning(false);
    }
  };

  const handlePhotoFileSelected = async (file: File) => {
    setDecodingPhoto(true);
    setScanError(null);
    try {
      const decoded = await decodeQRFromImage(file);
      await launchScanWithPayload(decoded);
    } catch (err: any) {
      setScanError(
        err?.message ||
        'No readable QR code found in this photo. Please ensure the QR code is clearly visible.'
      );
    } finally {
      setDecodingPhoto(false);
    }
  };

  const handleUnifiedLaunch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputVal.trim();
    if (!query) return;

    setScanning(true);
    setScanError(null);

    try {
      let res;
      if (activeTab === 'url') {
        res = await scanUrl(query);
      } else if (activeTab === 'message') {
        res = await scanMessage(query);
      } else if (activeTab === 'qr') {
        res = await scanQRMaster(query);
      } else if (activeTab === 'email') {
        res = await scanEmailMaster(query);
      }

      if (res && res.scan_id) {
        navigate(`/report/${res.scan_id}`);
      }
    } catch (err: any) {
      setScanError(
        err?.response?.data?.detail ||
        'Investigation failed. Please check target syntax or try again.'
      );
      setScanning(false);
    }
  };

  const chartData = stats?.risk_distribution
    ? Object.entries(stats.risk_distribution).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* SECTION 1: Product Introduction Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#141416] border border-[#27272a] p-8 sm:p-10 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-[#ff5500]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff5500]/20 border border-[#ff5500]/40 text-[#ff8a3d] text-xs font-bold mb-4 uppercase tracking-wider font-mono">
            <Zap size={13} className="text-[#ff5500]" /> One Platform &bull; One Investigation Workflow &bull; Complete Digital Threat Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Your Digital Security, One Command Center
          </h1>
          <p className="mt-4 text-[#dedad2] text-sm sm:text-base leading-relaxed font-normal">
            CyberShield AI unifies multi-vector threat detection across URLs, phishing messages, QR &amp; UPI scams, and email spoofing into deterministic, explainable evidence dossiers backed by cryptographic SHA-256 proofs and contextual emergency victim response.
          </p>

          {/* Core Value Pillars Pills */}
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono font-semibold">
            <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-white flex items-center gap-1.5">
              <Search size={12} className="text-[#ff5500]" /> Multi-Vector Detection
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-white flex items-center gap-1.5">
              <Network size={12} className="text-amber-400" /> Threat Graph Correlation
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-white flex items-center gap-1.5">
              <PhoneCall size={12} className="text-red-400" /> Golden Hour 1930 Triage
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-white flex items-center gap-1.5">
              <Lock size={12} className="text-emerald-400" /> Web3 Blockchain Proofs
            </span>
          </div>
        </div>

        {/* SECTION 2: Prominent Unified Investigation Launcher */}
        <div className="mt-8 pt-8 border-t border-[#27272a] relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#dedad2] font-mono flex items-center gap-2">
              <Search size={14} className="text-[#ff5500]" /> Unified Investigation Launcher
            </span>
            <Link
              to="/scanner"
              className="text-xs font-bold text-[#ff8a3d] hover:text-white flex items-center gap-1 font-mono transition-colors"
            >
              Advanced Workspace <ArrowUpRight size={12} />
            </Link>
          </div>

          {/* Tab Switcher: 4 Channels */}
          <div className="flex flex-wrap gap-1 p-1 bg-[#1c1a17] rounded-xl border border-[#3f3e3a] mb-4">
            <button
              type="button"
              onClick={() => { setActiveTab('url'); setInputVal(''); setScanError(null); }}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'url'
                  ? 'bg-[#ff5500] text-white shadow-md'
                  : 'text-[#a8a29e] hover:text-white hover:bg-white/5'
              }`}
            >
              <Globe size={13} /> URL / Domain
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('message'); setInputVal(''); setScanError(null); }}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'message'
                  ? 'bg-[#ff5500] text-white shadow-md'
                  : 'text-[#a8a29e] hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles size={13} /> Message / SMS
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('qr'); setInputVal(''); setScanError(null); }}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'qr'
                  ? 'bg-[#ff5500] text-white shadow-md'
                  : 'text-[#a8a29e] hover:text-white hover:bg-white/5'
              }`}
            >
              <QrCode size={13} /> QR &amp; UPI
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('email'); setInputVal(''); setScanError(null); }}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'email'
                  ? 'bg-[#ff5500] text-white shadow-md'
                  : 'text-[#a8a29e] hover:text-white hover:bg-white/5'
              }`}
            >
              <Mail size={13} /> Email Headers
            </button>
          </div>

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

          {/* Cross-Device Phone Handoff Modal */}
          <CrossDeviceHandoffModal
            isOpen={handoffOpen}
            onClose={() => setHandoffOpen(false)}
            onPayloadReceived={(payload) => launchScanWithPayload(payload)}
          />

          {/* Cross-Device & Photo Upload Strip */}
          <div className="mb-4 p-3 bg-[#1c1a17] border border-[#3f3e3a] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs text-[#dedad2]">
            <div className="flex items-center gap-2">
              <Camera size={15} className="text-[#ff5500]" />
              <span className="font-bold text-white">Scan Image or Phone:</span>
              <span className="text-[11px] text-[#a8a29e] hidden md:inline">
                Upload from laptop gallery or scan with mobile camera
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={decodingPhoto}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ImageIcon size={13} className="text-[#ff5500]" />
                <span>{decodingPhoto ? 'Reading...' : 'Browse Photo'}</span>
              </button>

              <button
                type="button"
                onClick={() => setHandoffOpen(true)}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-[#ff5500] hover:bg-[#e04b00] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Smartphone size={13} />
                <span>Scan with Phone</span>
              </button>
            </div>
          </div>

          {/* Launcher Input Form */}
          <form onSubmit={handleUnifiedLaunch} className="space-y-3">
            {activeTab === 'url' ? (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#787570] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter URL or domain (e.g. https://secure-bank-login.xyz)"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  disabled={scanning}
                  className="w-full pl-12 pr-36 py-3.5 bg-white border border-[#dedad2] rounded-xl text-[#141416] placeholder-[#787570] text-sm focus:outline-none focus:border-[#ff5500] focus:ring-2 focus:ring-[#ff5500]/20 font-mono transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={scanning || !inputVal.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-[#ff5500] hover:bg-[#e04b00] disabled:bg-[#dedad2] disabled:text-[#787570] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm font-mono cursor-pointer"
                >
                  {scanning ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Shield size={14} />
                  )}
                  <span>{scanning ? 'Auditing...' : 'Investigate'}</span>
                </button>
              </div>
            ) : (
              <div className="relative">
                <textarea
                  rows={activeTab === 'email' ? 4 : 3}
                  placeholder={
                    activeTab === 'message'
                      ? 'Paste SMS, WhatsApp lure, or email body to analyze psychological coercion, URLs, and phone numbers...'
                      : activeTab === 'qr'
                      ? 'Paste decoded QR payload string or UPI payment URI (e.g. upi://pay?pa=refund@hdfc&am=5000)...'
                      : 'Paste raw email RFC 5322 headers or full email text with From, Reply-To, and Subject lines...'
                  }
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  disabled={scanning}
                  className="w-full p-3.5 bg-white border border-[#dedad2] rounded-xl text-[#141416] placeholder-[#787570] text-xs focus:outline-none focus:border-[#ff5500] focus:ring-2 focus:ring-[#ff5500]/20 font-mono transition-all shadow-inner resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={scanning || !inputVal.trim()}
                    className="px-6 py-2.5 bg-[#ff5500] hover:bg-[#e04b00] disabled:bg-[#dedad2] disabled:text-[#787570] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-sm font-mono cursor-pointer"
                  >
                    {scanning ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Shield size={14} />
                    )}
                    <span>{scanning ? 'Running Multi-Vector Audit...' : 'Investigate Target'}</span>
                  </button>
                </div>
              </div>
            )}

            {scanError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs font-medium font-mono">
                {scanError}
              </div>
            )}

            {/* Quick 1-Click Samples for Judges and Users */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[11px] font-bold text-[#a8a29e] uppercase font-mono">
                1-Click Test Samples:
              </span>
              {samplesByTab[activeTab].map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputVal(sample.payload);
                  }}
                  className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[11px] font-mono transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>

      {/* SECTION 3: Structured Feature Discovery Grid ("All Capabilities at a Glance") */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#141416] tracking-tight">
              All Security Capabilities at a Glance
            </h2>
            <p className="text-xs sm:text-sm text-[#52504c] font-medium mt-0.5">
              Every innovation in CyberShield AI is unified and directly actionable. Select any capability to launch.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#f7f5f0] border border-[#dedad2] text-[#52504c] self-start sm:self-auto">
            4 Pillars &bull; 10 Integrated Engines
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Pillar 1: Threat Detection */}
          <div className="bg-white border border-[#dedad2] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-[#141416]/30 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#ff5500]/10 text-[#ff5500] border border-[#ff5500]/20">
                  <Search size={18} />
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#f7f5f0] text-[#141416] border border-[#dedad2] font-mono">
                  Pillar 1
                </span>
              </div>
              <h3 className="text-base font-bold text-[#141416]">
                Threat Detection
              </h3>
              <p className="text-xs text-[#52504c] leading-relaxed">
                Multi-vector investigation across URL DNS/TLS forensics, AI scam message analysis, QR/UPI scan-to-receive fraud, and email SPF/DKIM authentication.
              </p>
              <ul className="text-[11px] text-[#52504c] space-y-1 font-mono pt-1">
                <li className="flex items-center gap-1.5">&bull; SSRF-guarded URL scanner</li>
                <li className="flex items-center gap-1.5">&bull; Multi-LLM scam analysis</li>
                <li className="flex items-center gap-1.5">&bull; NPCI UPI parameter audit</li>
                <li className="flex items-center gap-1.5">&bull; DMARC sender alignment</li>
              </ul>
            </div>
            <Link
              to="/scanner"
              className="mt-5 w-full py-2.5 px-3 rounded-xl bg-[#f7f5f0] hover:bg-[#ff5500] text-[#141416] hover:text-white border border-[#dedad2] text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5"
            >
              Launch Scanner <ArrowRight size={13} />
            </Link>
          </div>

          {/* Pillar 2: Threat Intelligence */}
          <div className="bg-white border border-[#dedad2] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-[#141416]/30 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <Network size={18} />
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#f7f5f0] text-[#141416] border border-[#dedad2] font-mono">
                  Pillar 2
                </span>
              </div>
              <h3 className="text-base font-bold text-[#141416]">
                Threat Intelligence
              </h3>
              <p className="text-xs text-[#52504c] leading-relaxed">
                Correlate campaign infrastructure with multi-hop BFS relationship graphs, RDAP domain age auditing, CT logs, homoglyph detection, and zero-PII feeds.
              </p>
              <ul className="text-[11px] text-[#52504c] space-y-1 font-mono pt-1">
                <li className="flex items-center gap-1.5">&bull; Evidence relationship graph</li>
                <li className="flex items-center gap-1.5">&bull; RDAP age &lt; 30 days flag</li>
                <li className="flex items-center gap-1.5">&bull; Typosquatting / homoglyphs</li>
                <li className="flex items-center gap-1.5">&bull; Crowdsourced threat repo</li>
              </ul>
            </div>
            <Link
              to="/graph"
              className="mt-5 w-full py-2.5 px-3 rounded-xl bg-[#f7f5f0] hover:bg-[#141416] text-[#141416] hover:text-white border border-[#dedad2] text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5"
            >
              Explore Graph <ArrowRight size={13} />
            </Link>
          </div>

          {/* Pillar 3: User Protection */}
          <div className="bg-white border border-[#dedad2] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-[#141416]/30 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
                  <PhoneCall size={18} />
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-100 text-red-800 font-mono">
                  Pillar 3 &bull; 1930
                </span>
              </div>
              <h3 className="text-base font-bold text-[#141416]">
                Golden Hour Protection
              </h3>
              <p className="text-xs text-[#52504c] leading-relaxed">
                Victim-centric incident response within the critical 1-to-3 hour window. Automated bank account freezing protocols, evidence preservation, and 1930 triage.
              </p>
              <ul className="text-[11px] text-[#52504c] space-y-1 font-mono pt-1">
                <li className="flex items-center gap-1.5">&bull; National Helpline 1930 link</li>
                <li className="flex items-center gap-1.5">&bull; 5 dynamic scam scenarios</li>
                <li className="flex items-center gap-1.5">&bull; Financial freeze checklists</li>
                <li className="flex items-center gap-1.5">&bull; Official cybercrime.gov.in</li>
              </ul>
            </div>
            <Link
              to="/golden-hour"
              className="mt-5 w-full py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5"
            >
              Incident Response <ArrowRight size={13} />
            </Link>
          </div>

          {/* Pillar 4: Digital Trust & Blockchain */}
          <div className="bg-white border border-[#dedad2] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-[#141416]/30 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <FileCheck size={18} />
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#f7f5f0] text-[#141416] border border-[#dedad2] font-mono">
                  Pillar 4
                </span>
              </div>
              <h3 className="text-base font-bold text-[#141416]">
                Digital Trust &amp; Integrity
              </h3>
              <p className="text-xs text-[#52504c] leading-relaxed">
                Every forensic finding generates an immutable canonical SHA-256 fingerprint anchored on the Arbitrum Sepolia ledger with interactive tamper simulation.
              </p>
              <ul className="text-[11px] text-[#52504c] space-y-1 font-mono pt-1">
                <li className="flex items-center gap-1.5">&bull; Deterministic canonical hash</li>
                <li className="flex items-center gap-1.5">&bull; Web3 smart contract anchor</li>
                <li className="flex items-center gap-1.5">&bull; Live tamper detection proof</li>
                <li className="flex items-center gap-1.5">&bull; Forensic registry audit</li>
              </ul>
            </div>
            <Link
              to="/history"
              className="mt-5 w-full py-2.5 px-3 rounded-xl bg-[#f7f5f0] hover:bg-emerald-600 text-[#141416] hover:text-white border border-[#dedad2] text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5"
            >
              Audit Reports <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 4: Primary Telemetry Metrics */}
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
            <span className="text-xs font-medium text-[#52504c]">investigations</span>
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

      {/* SECTION 5: Threat Profile Chart & Intelligence Engines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Distribution Chart */}
        <div className="bg-white border border-[#dedad2] rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider mb-4 flex items-center justify-between font-mono">
            <span>Threat Severity Profile</span>
            <span className="text-xs text-[#52504c] font-medium">Global</span>
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
                No telemetry recorded yet. Perform an investigation above to populate.
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#dedad2] text-xs font-semibold text-[#52504c]">
            {['Critical', 'High', 'Medium', 'Low'].map((level) => (
              <div key={level} className="flex items-center gap-1.5 font-mono">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: RISK_COLORS[level] }}
                />
                <span>{level}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Connected Intelligence Engines Status */}
        <div className="lg:col-span-2 bg-white border border-[#dedad2] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider flex items-center gap-2 font-mono">
                <Server size={16} className="text-[#ff5500]" /> Connected Threat Intelligence Engines
              </h3>
              <Link
                to="/settings"
                className="text-xs font-bold text-[#ff5500] hover:text-[#e04b00] flex items-center gap-1 font-mono"
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
                    <div className="text-xs font-bold text-[#141416] font-mono">
                      {p.provider_name}
                    </div>
                    <div className="text-[11px] text-[#52504c] mt-0.5 line-clamp-1 font-medium">
                      {p.details}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 font-mono ${
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

          <div className="mt-4 pt-3 border-t border-[#dedad2] flex items-center justify-between text-xs text-[#52504c] font-mono">
            <span>Arbitrum Sepolia Anchor: {system?.providers.find(p => p.category === 'blockchain' || p.provider_name.toLowerCase().includes('blockchain'))?.configured ? 'Online' : 'Local Proof Mode'}</span>
            <span className="text-[#141416] font-semibold">{system?.providers.filter(x => x.status === 'active').length} / {system?.providers.length} Feeds Online</span>
          </div>
        </div>
      </div>

      {/* SECTION 6: Recent Investigation Stream */}
      <div className="bg-white border border-[#dedad2] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider font-mono">
              Recent Forensic Investigations
            </h3>
            <p className="text-xs text-[#52504c] font-medium">
              Real-time audit log of multi-channel targets evaluated across the platform.
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs font-bold text-[#ff5500] hover:underline flex items-center gap-1 font-mono"
          >
            View Complete Registry <ArrowRight size={13} />
          </Link>
        </div>

        {recentScans.length > 0 ? (
          <div className="divide-y divide-[#dedad2]/70 font-mono">
            {recentScans.map((item) => (
              <div
                key={item.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#faf8f4] px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <RiskBadge level={item.risk_level as any} size="sm" />
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#f7f5f0] text-[#141416] border border-[#dedad2]">
                    {item.scan_type}
                  </span>
                  <span className="text-xs font-medium text-[#141416] truncate max-w-md">
                    {item.target}
                  </span>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 text-xs">
                  <span className="text-[11px] text-[#52504c]">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <Link
                    to={`/report/${item.id}`}
                    className="text-[#ff5500] hover:text-[#e04b00] font-bold text-xs flex items-center gap-1"
                  >
                    Dossier <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#52504c] font-medium">
            No investigations recorded yet. Use the launcher above to begin an investigation.
          </div>
        )}
      </div>
    </div>
  );
};
