
import React from 'react';
import { PointSystem } from '../types';

interface PointSystemConfigProps {
  config: PointSystem;
  onChange: (newConfig: PointSystem) => void;
}

const PointSystemConfig: React.FC<PointSystemConfigProps> = ({ config, onChange }) => {
  const updatePositionPoint = (rank: number, val: number) => {
    onChange({
      ...config,
      positionPoints: {
        ...config.positionPoints,
        [rank]: val
      }
    });
  };

  const updateKillPoint = (val: number) => {
    onChange({
      ...config,
      pointsPerKill: val
    });
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
      <h3 className="text-lg font-semibold text-emerald-400 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Point System Settings
      </h3>
      
      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-300 mb-2">Points Per Elimination</label>
        <input 
          type="number" 
          value={config.pointsPerKill}
          onChange={(e) => updateKillPoint(Number(e.target.value))}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {Object.entries(config.positionPoints).map(([rank, points]) => (
          <div key={rank} className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1">Rank {rank}</label>
            <input 
              type="number" 
              value={points}
              onChange={(e) => updatePositionPoint(Number(rank), Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PointSystemConfig;
