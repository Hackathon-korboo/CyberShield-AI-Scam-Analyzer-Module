import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Database,
  Key,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Terminal,
  Cpu,
  Layers
} from 'lucide-react';
import { getSystemStatus } from '../services/api';
import { SystemStatusResponse } from '../types';

export const Settings: React.FC = () => {
  const [system, setSystem] = useState<SystemStatusResponse | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getSystemStatus();
        setSystem(data);
      } catch (err) {
        console.error('Failed to load system status:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const guideCards = [
    {
      name: 'URLhaus (abuse.ch)',
      env: 'URLHAUS_AUTH_KEY',
      tier: '100% Free Community Feed',
      url: 'https://urlhaus.abuse.ch/api/',
      guide: 'Sign up for a free abuse.ch account, copy your API key from My Account, and set URLHAUS_AUTH_KEY in your .env file.',
      fallback: 'Community rate-limited query mode engaged automatically when key is omitted.',
    },
    {
      name: 'PhishTank (Cisco Talos)',
      env: 'PHISHTANK_APP_KEY',
      tier: 'Free Registration',
      url: 'https://phishtank.org/developer_info.php',
      guide: 'Register an account on phishtank.org, go to Developer Info, register an Application, and set PHISHTANK_APP_KEY in .env.',
      fallback: 'Flagged as unconfigured; system continues with heuristic checks and other configured feeds.',
    },
    {
      name: 'Groq Cloud AI (Tier 1 Primary)',
      env: 'GROQ_API_KEY',
      tier: 'Ultra-Fast Free Tier (console.groq.com)',
      url: 'https://console.groq.com/keys',
      guide: 'Sign up for a Groq Cloud account, create an API key, and configure GROQ_API_KEY in .env for ultra-low latency AI inference.',
      fallback: 'Automatic instant failover to Tier 2 (Google Gemini) upon error or rate limit.',
    },
    {
      name: 'Google Gemini AI (Tier 2 Backup)',
      env: 'GEMINI_API_KEY',
      tier: 'Free Tier Available (AI Studio)',
      url: 'https://aistudio.google.com/',
      guide: 'Visit Google AI Studio, generate an API key for Gemini 1.5, and populate GEMINI_API_KEY in .env.',
      fallback: 'Automatic failover to Tier 3 (OpenAI) if unavailable.',
    },
    {
      name: 'OpenAI (Tier 3 Backup)',
      env: 'OPENAI_API_KEY',
      tier: 'API Key (platform.openai.com)',
      url: 'https://platform.openai.com/api-keys',
      guide: 'Generate an API key on OpenAI platform and populate OPENAI_API_KEY in .env for gpt-4o-mini inference.',
      fallback: 'Automatic failover to Tier 4 Offline Deterministic Heuristic Engine.',
    },
    {
      name: 'PostgreSQL Relational DB',
      env: 'DATABASE_URL',
      tier: 'Free Self-Hosted / Neon / Supabase',
      url: 'https://www.postgresql.org/',
      guide: 'Provision PostgreSQL and specify your connection string: postgresql://user:pass@localhost:5432/cybershield.',
      fallback: 'Automatic zero-setup fallback to local SQLite (cybershield.db). Never crashes the application.',
    },
    {
      name: 'Web3 / Blockchain RPC',
      env: 'BLOCKCHAIN_RPC_URL',
      tier: 'Free Testnet (Sepolia)',
      url: 'https://alchemy.com/',
      guide: 'Set an Ethereum RPC endpoint (Sepolia) and private key in .env to anchor canonical SHA-256 report hashes directly on-chain.',
      fallback: 'Cryptographic Local SHA-256 Proof Engine active by default. Zero gas cost required.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/30 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
          <SettingsIcon size={14} /> Telemetry &amp; System Configuration
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141416]">
          Security Providers &amp; Platform Health
        </h1>
        <p className="text-sm text-[#52504c] mt-1 max-w-2xl font-medium leading-relaxed">
          Live monitoring of all connected threat intelligence engines, relational databases, AI providers, and cryptographic verification modules.
        </p>
      </div>

      {/* Platform Status Overview Card */}
      <div className="bg-white border border-[#dedad2] rounded-2xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-sm font-bold text-[#141416] uppercase tracking-wider mb-6 flex items-center gap-2 font-mono">
          <Layers size={16} className="text-[#ff5500]" /> Platform Runtime Diagnostics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-[#f7f5f0] border border-[#dedad2] rounded-xl space-y-1">
            <span className="text-[#52504c] font-bold block uppercase text-[10px] font-mono">Overall Health</span>
            <div className="flex items-center gap-2 pt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[#141416] font-bold uppercase tracking-wider">
                {system?.status || 'Online'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#f7f5f0] border border-[#dedad2] rounded-xl space-y-1">
            <span className="text-[#52504c] font-bold block uppercase text-[10px] font-mono">Database Engine</span>
            <div className="flex items-center gap-2 pt-1">
              <Database size={15} className="text-[#ff5500]" />
              <span className="text-[#141416] font-bold font-mono">
                {system?.database_type || 'Active'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#f7f5f0] border border-[#dedad2] rounded-xl space-y-1">
            <span className="text-[#52504c] font-bold block uppercase text-[10px] font-mono">Software Build</span>
            <div className="flex items-center gap-2 pt-1">
              <Terminal size={15} className="text-[#141416]" />
              <span className="text-[#141416] font-bold font-mono">
                v{system?.app_version || '1.0.0'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#f7f5f0] border border-[#dedad2] rounded-xl space-y-1">
            <span className="text-[#52504c] font-bold block uppercase text-[10px] font-mono">Operating Mode</span>
            <div className="flex items-center gap-2 pt-1">
              <Cpu size={15} className="text-amber-600" />
              <span className="text-[#141416] font-bold capitalize">
                {system?.environment || 'Development'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Status Matrix */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[#141416] flex items-center gap-2 font-mono">
          <Key size={18} className="text-[#ff5500]" /> External API &amp; Credential Configuration Matrix
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {guideCards.map((g) => {
            const providerStatus = system?.providers.find((p) => p.env_variable === g.env);
            const isConfigured = providerStatus?.configured ?? false;

            return (
              <div
                key={g.name}
                className="bg-white border border-[#dedad2] rounded-2xl p-6 hover:border-[#141416]/20 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#dedad2]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#f7f5f0] border border-[#dedad2] text-[#ff5500]">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#141416]">{g.name}</h4>
                      <span className="text-xs text-[#52504c] font-mono font-semibold">{g.env}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isConfigured
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-[#f7f5f0] text-[#52504c] border border-[#dedad2]'
                      }`}
                    >
                      {isConfigured ? (
                        <>
                          <CheckCircle2 size={13} className="text-emerald-600" /> Configured
                        </>
                      ) : (
                        <>
                          <AlertCircle size={13} className="text-amber-600" /> Active Fallback Mode
                        </>
                      )}
                    </span>
                    <a
                      href={g.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-[#f7f5f0] hover:bg-white text-[#141416] border border-[#dedad2] text-xs font-bold inline-flex items-center gap-1 transition-colors shadow-xs"
                    >
                      Portal <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[#52504c] font-bold uppercase tracking-wider text-[10px] font-mono">
                      Access &amp; Pricing
                    </span>
                    <p className="text-[#141416] font-medium leading-relaxed">{g.tier}</p>
                    <p className="text-[#52504c] mt-2 font-medium">{g.guide}</p>
                  </div>

                  <div className="p-3.5 bg-[#f7f5f0] rounded-xl border border-[#dedad2] space-y-1">
                    <span className="text-[#141416] font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 font-mono">
                      <HelpCircle size={12} className="text-[#ff5500]" /> Fallback Resilience Behavior
                    </span>
                    <p className="text-[#52504c] leading-relaxed text-[11px] pt-1 font-medium">
                      {g.fallback}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
