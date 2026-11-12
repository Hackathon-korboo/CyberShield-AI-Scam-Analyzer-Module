import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Scanner } from './pages/Scanner';
import { MessageAnalyzer } from './pages/MessageAnalyzer';
import { History } from './pages/History';
import { ReportDetail } from './pages/ReportDetail';
import { Settings } from './pages/Settings';
import ThreatGraph from './pages/ThreatGraph';
import GoldenHour from './pages/GoldenHour';
import QRAnalyzer from './pages/QRAnalyzer';
import EmailAuthenticator from './pages/EmailAuthenticator';
import DomainIntelligence from './pages/DomainIntelligence';
import CommunityRepository from './pages/CommunityRepository';
import { CyberShieldExperience } from './components/robot/CyberShieldExperience';
import { Shield } from 'lucide-react';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isExperience = location.pathname === '/' || location.pathname === '/experience';

  if (isExperience) {
    return (
      <Routes>
        <Route path="/" element={<CyberShieldExperience />} />
        <Route path="/experience" element={<CyberShieldExperience />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-[#efece6] text-[#141416] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/overview" element={<Dashboard />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/investigate" element={<Scanner />} />
          <Route path="/message-analyzer" element={<MessageAnalyzer />} />
          <Route path="/history" element={<History />} />
          <Route path="/reports" element={<History />} />
          <Route path="/report/:id" element={<ReportDetail />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/graph" element={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><ThreatGraph /></div>} />
          <Route path="/intelligence" element={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><ThreatGraph /></div>} />
          <Route path="/golden-hour" element={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><GoldenHour /></div>} />
          <Route path="/protection" element={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><GoldenHour /></div>} />
          <Route path="/qr" element={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><QRAnalyzer /></div>} />
          <Route path="/email" element={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><EmailAuthenticator /></div>} />
          <Route path="/domain" element={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><DomainIntelligence /></div>} />
          <Route path="/community" element={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><CommunityRepository /></div>} />
        </Routes>
      </main>

      <footer className="border-t border-[#dedad2] bg-[#fbf9f5] py-6 mt-12 text-xs text-[#52504c] font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#ff5500]" />
            <span className="font-semibold text-[#141416]">CyberShield AI Platform</span>
            <span>&bull;</span>
            <span>Intelligence Before Impact &bull; 2026</span>
          </div>
          <p className="text-center sm:text-right text-[11px] text-[#52504c] max-w-md">
            Disclaimer: Threat intelligence scores are probabilistic. Always correlate findings with internal SIEM and perimeter defenses before taking operational actions.
          </p>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
