import React from 'react';

interface ScoreGaugeProps {
  score: number;
  riskLevel?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  const getColor = () => {
    if (score >= 80) return 'text-red-600 stroke-red-600';
    if (score >= 60) return 'text-orange-600 stroke-orange-600';
    if (score >= 35) return 'text-amber-700 stroke-amber-700';
    if (score > 0) return 'text-emerald-700 stroke-emerald-700';
    return 'text-[#52504c] stroke-[#52504c]';
  };

  const getProgressColor = () => {
    if (score >= 80) return 'bg-red-600';
    if (score >= 60) return 'bg-orange-600';
    if (score >= 35) return 'bg-amber-600';
    if (score > 0) return 'bg-emerald-600';
    return 'bg-[#52504c]';
  };

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-[#dedad2] shadow-sm min-w-[160px]">
      <div className="flex items-baseline gap-1">
        <span className={`text-4xl font-extrabold tracking-tight font-mono ${getColor()}`}>
          {score}
        </span>
        <span className="text-xs font-bold text-[#52504c]">/100</span>
      </div>
      <span className="text-xs font-bold text-[#52504c] mt-1 uppercase tracking-wider">
        Threat Score
      </span>
      <div className="w-full bg-[#dedad2] rounded-full h-2 mt-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-700 ease-out ${getProgressColor()}`}
          style={{ width: `${Math.max(5, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  );
};
