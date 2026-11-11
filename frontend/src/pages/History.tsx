import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  RefreshCw,
  ArrowRight,
  FileText
} from 'lucide-react';
import { getScans } from '../services/api';
import { ScanListItem } from '../types';
import { RiskBadge } from '../components/RiskBadge';

export const History: React.FC = () => {
  const [scans, setScans] = useState<ScanListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  const riskFilters = ['All', 'Critical', 'High', 'Medium', 'Low', 'Unknown'];

  const fetchScans = async () => {
    setLoading(true);
    try {
      const data = await getScans({
        query: searchQuery.trim() || undefined,
        risk_level: selectedRisk !== 'All' ? selectedRisk : undefined,
        scan_type: selectedType !== 'All' ? selectedType : undefined,
        limit: 50,
      });
      setScans(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load scan history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [selectedRisk, selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchScans();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/30 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
            <HistoryIcon size={14} /> Investigation Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141416]">
            Threat Scan History
          </h1>
          <p className="text-sm text-[#52504c] mt-1 font-medium">
            Audit log of all analyzed URLs, domains, and phishing communications.
          </p>
        </div>

        <button
          onClick={fetchScans}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white border border-[#dedad2] hover:bg-[#f7f5f0] text-xs font-bold text-[#141416] flex items-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Registry
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#dedad2] rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787570] w-4 h-4" />
            <input
              type="text"
              placeholder="Search by target URL, domain, or preview..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#f7f5f0] border border-[#dedad2] rounded-xl text-[#141416] placeholder-[#787570] text-xs focus:outline-none focus:bg-white focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] font-mono shadow-inner"
            />
          </form>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3.5 py-2.5 bg-[#f7f5f0] border border-[#dedad2] rounded-xl text-[#141416] text-xs focus:outline-none focus:bg-white focus:border-[#ff5500] font-semibold cursor-pointer shadow-xs"
          >
            <option value="All">All Scan Types</option>
            <option value="url">URL Scans</option>
            <option value="message">Message Scans</option>
          </select>
        </div>

        {/* Risk Level Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#dedad2]">
          <span className="text-[11px] font-bold text-[#52504c] uppercase tracking-wider mr-1 font-mono">
            Severity:
          </span>
          {riskFilters.map((risk) => (
            <button
              key={risk}
              type="button"
              onClick={() => setSelectedRisk(risk)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRisk === risk
                  ? 'bg-[#141416] text-white shadow-sm'
                  : 'bg-[#f7f5f0] text-[#52504c] hover:text-[#141416] hover:bg-white border border-[#dedad2]'
              }`}
            >
              {risk}
            </button>
          ))}
          <span className="ml-auto text-xs text-[#52504c] font-medium">
            Found <strong className="text-[#141416] font-bold">{total}</strong> investigations
          </span>
        </div>
      </div>

      {/* Scans Table */}
      <div className="bg-white border border-[#dedad2] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-[#52504c] text-xs space-y-3">
            <div className="w-6 h-6 border-2 border-[#ff5500] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-medium">Loading registry records...</p>
          </div>
        ) : scans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#dedad2] bg-[#f7f5f0] text-[#52504c] uppercase font-bold">
                  <th className="py-3.5 pl-4">Target / Pretext Preview</th>
                  <th className="py-3.5">Type</th>
                  <th className="py-3.5">Risk Level</th>
                  <th className="py-3.5">Score</th>
                  <th className="py-3.5">Cryptographic Proof</th>
                  <th className="py-3.5">Investigated At</th>
                  <th className="py-3.5 text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dedad2]/70 font-mono">
                {scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-[#faf8f4] transition-colors">
                    <td className="py-3.5 pl-4 font-semibold text-[#141416] max-w-xs truncate">
                      {scan.target}
                    </td>
                    <td className="py-3.5 text-[#52504c] font-sans font-medium capitalize">
                      {scan.scan_type}
                    </td>
                    <td className="py-3.5 font-sans">
                      <RiskBadge level={scan.risk_level} size="sm" />
                    </td>
                    <td className="py-3.5 font-bold text-[#141416]">
                      {scan.risk_score}/100
                    </td>
                    <td className="py-3.5 text-[#52504c] text-[11px] font-mono">
                      {scan.report_hash ? `${scan.report_hash.slice(0, 14)}...` : 'N/A'}
                    </td>
                    <td className="py-3.5 text-[#52504c] font-sans">
                      {new Date(scan.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right pr-4 font-sans">
                      <Link
                        to={`/report/${scan.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#f7f5f0] hover:bg-white text-[#ff5500] hover:text-[#e04b00] border border-[#dedad2] text-xs font-bold inline-flex items-center gap-1 transition-all shadow-xs"
                      >
                        Dossier <ArrowRight size={11} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-[#52504c] text-xs space-y-2">
            <FileText size={24} className="mx-auto text-[#787570]" />
            <p className="font-bold text-[#141416]">No matching threat records found</p>
            <p>Try adjusting your search criteria or run a new scan from the dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
};
