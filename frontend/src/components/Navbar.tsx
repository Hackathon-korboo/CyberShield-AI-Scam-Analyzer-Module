import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Search, 
  Settings, 
  Sparkles,
  Network,
  ChevronDown,
  PhoneCall,
  Globe,
  Users,
  LayoutDashboard,
  Menu,
  X,
  FileCheck,
  ShieldAlert
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [intelDropdownOpen, setIntelDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const intelDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (intelDropdownRef.current && !intelDropdownRef.current.contains(event.target as Node)) {
        setIntelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIntelDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const intelligenceItems = [
    { name: 'Threat Relationship Graph', path: '/graph', icon: Network, badge: 'P0', desc: 'Campaign correlation & multi-hop graph' },
    { name: 'Domain & Brand Intel', path: '/domain', icon: Globe, badge: 'P1', desc: 'RDAP age, CT logs & homoglyph detection' },
    { name: 'Community Threat Feed', path: '/community', icon: Users, badge: 'P2', desc: 'Zero-PII crowdsourced threat repository' },
  ];

  const isIntelActive = ['/graph', '/domain', '/community'].some(p => location.pathname.startsWith(p));

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#efece6]/95 border-b border-[#dedad2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 font-mono">
          {/* Logo & Platform Identity */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl border border-[#dedad2] bg-white flex items-center justify-center text-[#ff5500] shadow-sm group-hover:border-[#ff5500] transition-colors">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-[#141416] uppercase">
                  CyberShield AI
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/30">
                  NEXUS
                </span>
              </div>
              <p className="text-[10px] text-[#52504c] font-medium hidden sm:block uppercase">
                Digital Trust &amp; Incident Intelligence
              </p>
            </div>
          </Link>

          {/* Desktop 5-Pillar Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Thinking Security Showcase */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/40'
                    : 'text-[#ff5500] hover:bg-[#ff5500]/10 border border-transparent'
                }`
              }
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Experience</span>
            </NavLink>

            {/* Pillar 1: OVERVIEW */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-white text-[#141416] border border-[#dedad2] shadow-sm'
                    : 'text-[#52504c] hover:text-[#141416] hover:bg-white/60 border border-transparent'
                }`
              }
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </NavLink>

            {/* Pillar 2: INVESTIGATE */}
            <NavLink
              to="/scanner"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-white text-[#141416] border border-[#dedad2] shadow-sm'
                    : 'text-[#52504c] hover:text-[#141416] hover:bg-white/60 border border-transparent'
                }`
              }
            >
              <Search className="w-3.5 h-3.5 text-[#ff5500]" />
              <span>Investigate</span>
            </NavLink>

            {/* Pillar 3: INTELLIGENCE (Dropdown) */}
            <div className="relative" ref={intelDropdownRef}>
              <button
                onClick={() => setIntelDropdownOpen(!intelDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                  isIntelActive || intelDropdownOpen
                    ? 'bg-[#1c1a17] text-white border-[#1c1a17]'
                    : 'text-[#52504c] hover:text-[#141416] hover:bg-white/60 border-transparent'
                }`}
              >
                <Network className="w-3.5 h-3.5 text-amber-500" />
                <span>Intelligence</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${intelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {intelDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#dedad2] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-[#dedad2] mb-1">
                    <span className="text-[10px] font-bold text-[#78716c] uppercase tracking-wider block">
                      Threat Intelligence Layer
                    </span>
                    <span className="text-xs font-bold text-[#141416]">
                      Correlated Graph &amp; Domain Intel
                    </span>
                  </div>

                  <div className="space-y-1">
                    {intelligenceItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className={({ isActive }) =>
                            `flex items-start gap-2.5 p-2 rounded-lg text-xs transition-colors ${
                              isActive ? 'bg-[#f5f2eb] text-[#141416] font-bold' : 'hover:bg-[#faf8f5] text-[#52504c]'
                            }`
                          }
                        >
                          <div className="p-1.5 rounded-md bg-[#f5f2eb] text-[#141416] shrink-0 mt-0.5">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#141416] truncate text-[11px]">{item.name}</span>
                              <span className="text-[9px] font-extrabold px-1 rounded bg-[#dedad2] text-[#141416]">
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#78716c] truncate mt-0.5">{item.desc}</p>
                          </div>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Pillar 4: PROTECTION */}
            <NavLink
              to="/golden-hour"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm'
                    : 'text-[#52504c] hover:text-red-700 hover:bg-red-50/60 border border-transparent'
                }`
              }
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-600" />
              <span>Protection</span>
              <span className="px-1 py-0.2 rounded bg-red-600 text-white text-[9px] font-extrabold">1930</span>
            </NavLink>

            {/* Pillar 5: REPORTS */}
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-white text-[#141416] border border-[#dedad2] shadow-sm'
                    : 'text-[#52504c] hover:text-[#141416] hover:bg-white/60 border border-transparent'
                }`
              }
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Reports</span>
            </NavLink>
          </nav>

          {/* Right Status / Settings Pill */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/settings"
              className="p-2 rounded-lg text-[#52504c] hover:text-[#141416] hover:bg-white/60 transition-colors border border-transparent hover:border-[#dedad2]"
              title="System Health & API Configuration"
            >
              <Settings className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#dedad2] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-extrabold text-[#141416] uppercase tracking-wider">Active</span>
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <NavLink
              to="/golden-hour"
              className="p-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1"
            >
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span className="text-[10px]">1930</span>
            </NavLink>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white border border-[#dedad2] text-[#141416]"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#dedad2] py-4 space-y-2 font-mono bg-[#efece6] animate-in fade-in slide-in-from-top-2 duration-150">
            <NavLink
              to="/"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-[#ff5500] hover:bg-white"
            >
              <Sparkles size={16} /> Experience Showcase
            </NavLink>
            <NavLink
              to="/dashboard"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-[#141416] hover:bg-white"
            >
              <LayoutDashboard size={16} /> 1. Overview Dashboard
            </NavLink>
            <NavLink
              to="/scanner"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-[#141416] hover:bg-white"
            >
              <Search size={16} className="text-[#ff5500]" /> 2. Investigate Workspace (URL, SMS, QR, Email)
            </NavLink>
            <div className="pl-6 space-y-1 border-l-2 border-[#dedad2] ml-4">
              <span className="text-[10px] font-bold text-[#78716c] uppercase block">Pillar 3: Threat Intelligence</span>
              <NavLink to="/graph" className="flex items-center gap-2 py-1 text-xs text-[#141416] hover:text-[#ff5500]">
                <Network size={14} /> Threat Relationship Graph
              </NavLink>
              <NavLink to="/domain" className="flex items-center gap-2 py-1 text-xs text-[#141416] hover:text-[#ff5500]">
                <Globe size={14} /> Domain &amp; Brand Intel
              </NavLink>
              <NavLink to="/community" className="flex items-center gap-2 py-1 text-xs text-[#141416] hover:text-[#ff5500]">
                <Users size={14} /> Community Threat Feed
              </NavLink>
            </div>
            <NavLink
              to="/golden-hour"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-red-700 bg-red-50/80 border border-red-200"
            >
              <PhoneCall size={16} className="text-red-600" /> 4. Protection: Golden Hour Center (1930)
            </NavLink>
            <NavLink
              to="/history"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-[#141416] hover:bg-white"
            >
              <FileCheck size={16} /> 5. Reports &amp; Blockchain Proofs
            </NavLink>
            <NavLink
              to="/settings"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-[#52504c] hover:bg-white"
            >
              <Settings size={16} /> System &amp; API Settings
            </NavLink>
          </div>
        )}
      </div>
    </header>
  );
};
