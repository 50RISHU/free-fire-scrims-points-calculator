
import React from 'react';
import { FinalLeaderboardRow } from '../types';

interface LeaderboardProps {
  data: FinalLeaderboardRow[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ data }) => {
  if (data.length === 0) return null;

  const handleCopyTable = () => {
    const text = data.map(row => 
      `${row.rank}\tSlot ${row.slotNo}\t${row.win ? 'W' : '-'}\t${row.totalKills}\t${row.killPoints}\t${row.positionPoints}\t${row.totalPoints}`
    ).join('\n');
    const header = "RANK\tTEAM/SLOT\tWIN\tKILLS\tK-PTS\tP-PTS\tTOTAL\n";
    navigator.clipboard.writeText(header + text);
    alert('Leaderboard copied to clipboard!');
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-gaming text-white">Final Leaderboard</h2>
          <p className="text-sm text-slate-400">Calculated based on slot mapping and point system</p>
        </div>
        <button 
          onClick={handleCopyTable}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copy Data
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/30">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Slot / Team</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Win</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Elims</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Kill Pts</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Pos Pts</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {data.map((row, idx) => (
              <tr key={idx} className={`${idx === 0 ? 'bg-yellow-500/10' : ''} hover:bg-white/5 transition-colors`}>
                <td className="px-6 py-4">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full font-gaming text-sm ${
                    idx === 0 ? 'bg-yellow-500 text-black' : 
                    idx === 1 ? 'bg-slate-300 text-black' : 
                    idx === 2 ? 'bg-amber-600 text-white' : 
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {idx + 1}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <div className="font-bold text-white">Slot {row.slotNo}</div>
                   <div className="text-[10px] text-slate-400 italic">Matching players...</div>
                </td>
                <td className="px-6 py-4">
                  {row.win ? (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-[10px] font-bold rounded border border-yellow-500/30">BOOYAH!</span>
                  ) : (
                    <span className="text-slate-600">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center font-medium text-slate-300">{row.totalKills}</td>
                <td className="px-6 py-4 text-center font-medium text-slate-300">{row.killPoints}</td>
                <td className="px-6 py-4 text-center font-medium text-slate-300">{row.positionPoints}</td>
                <td className="px-6 py-4 text-center font-gaming text-lg text-emerald-400">{row.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
