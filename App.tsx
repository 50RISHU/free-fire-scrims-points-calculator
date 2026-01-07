
import React, { useState, useMemo, useCallback } from 'react';
import { AppState, FinalLeaderboardRow, SlotData, MatchResult } from './types';
import { DEFAULT_POINT_SYSTEM } from './constants';
import ImageUploader from './components/ImageUploader';
import PointSystemConfig from './components/PointSystemConfig';
import Leaderboard from './components/Leaderboard';
import { GeminiService } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    lobbyImages: [],
    endImages: [],
    slots: [],
    results: [],
    pointSystem: DEFAULT_POINT_SYSTEM,
    isProcessing: false,
    error: null,
  });

  const gemini = useMemo(() => new GeminiService(), []);

  const handleProcessImages = async () => {
    if (state.lobbyImages.length === 0 || state.endImages.length === 0) {
      alert("Please upload both lobby and result screenshots.");
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      // Step 1: Extract Lobby Data
      const slots = await gemini.extractLobbyData(state.lobbyImages);
      // Step 2: Extract Result Data
      const results = await gemini.extractEndData(state.endImages);

      setState(prev => ({
        ...prev,
        slots,
        results,
        isProcessing: false
      }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: err.message || "An unexpected error occurred processing images."
      }));
    }
  };

  // Business Logic: Calculate Points
  const leaderboardData: FinalLeaderboardRow[] = useMemo(() => {
    if (!state.slots.length || !state.results.length) return [];

    const slotPointsMap: Record<number, { kills: number, rank: number }> = {};

    // For each slot, calculate total kills by matching player names
    state.slots.forEach(slot => {
      let totalKills = 0;
      let bestRank = 13; // Default lower than max 12

      // Simplified matching logic: fuzzy matching or contains
      slot.players.forEach(pName => {
        const cleanPName = pName.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        state.results.forEach(res => {
          const cleanResName = res.playerName.toLowerCase().replace(/[^a-z0-9]/g, '');
          
          // Basic fuzzy matching: check if names are similar
          if (cleanResName.includes(cleanPName) || cleanPName.includes(cleanResName) || cleanResName === cleanPName) {
            totalKills += res.kills;
            if (res.rank < bestRank) bestRank = res.rank;
          }
        });
      });

      // If no players matched, we might have to fallback or check rank-to-slot if player names are too corrupted
      // But based on prompt, we match by name.
      slotPointsMap[slot.slotNo] = { kills: totalKills, rank: bestRank };
    });

    const rows: FinalLeaderboardRow[] = Object.entries(slotPointsMap).map(([slotNoStr, stats]) => {
      const slotNo = parseInt(slotNoStr);
      const kPts = stats.kills * state.pointSystem.pointsPerKill;
      const pPts = state.pointSystem.positionPoints[stats.rank] || 0;
      
      return {
        rank: 0, // Calculated later
        slotNo,
        teamName: `Slot ${slotNo}`,
        win: stats.rank === 1,
        killPoints: kPts,
        positionPoints: pPts,
        totalKills: stats.kills,
        totalPoints: kPts + pPts
      };
    });

    // Sort by Total Points desc, then Kills desc
    return rows.sort((a, b) => b.totalPoints - a.totalPoints || b.totalKills - a.totalKills).map((row, idx) => ({
      ...row,
      rank: idx + 1
    }));
  }, [state.slots, state.results, state.pointSystem]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 py-6 px-4 mb-8 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-gaming text-white tracking-wider">SCRIM POINTS</h1>
              <p className="text-xs text-orange-400 font-bold uppercase tracking-widest">AI Result Extractor</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleProcessImages}
              disabled={state.isProcessing}
              className={`px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all flex items-center gap-2 ${
                state.isProcessing 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
              }`}
            >
              {state.isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Generate Results
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        {state.error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {state.error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs Section */}
          <div className="lg:col-span-4 space-y-6">
            <ImageUploader 
              label="Lobby Screenshots" 
              images={state.lobbyImages}
              onUpload={(imgs) => setState(p => ({ ...p, lobbyImages: imgs }))}
              onClear={() => setState(p => ({ ...p, lobbyImages: [], slots: [] }))}
              maxFiles={3}
            />
            
            <ImageUploader 
              label="Result Screenshots" 
              images={state.endImages}
              onUpload={(imgs) => setState(p => ({ ...p, endImages: imgs }))}
              onClear={() => setState(p => ({ ...p, endImages: [], results: [] }))}
              maxFiles={2}
            />

            <PointSystemConfig 
              config={state.pointSystem} 
              onChange={(conf) => setState(p => ({ ...p, pointSystem: conf }))}
            />
          </div>

          {/* Results Section */}
          <div className="lg:col-span-8">
            {state.isProcessing ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-4 bg-slate-800 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Analyzing Screenshots</h3>
                <p className="text-slate-400 text-center max-w-xs">
                  Gemini AI is currently extracting player names, ranks, and eliminations from your uploaded images.
                </p>
                <div className="mt-8 flex gap-2">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            ) : leaderboardData.length > 0 ? (
              <Leaderboard data={leaderboardData} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-600">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-400 mb-2">No Match Data Yet</h3>
                <p className="text-slate-500 text-center max-w-sm px-6">
                  Upload your Free Fire screenshots and click "Generate Results" to calculate the points automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-t border-slate-800 py-3 text-center">
         <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Powered by Gemini 3 Flash • Built for Tournament Organizers</p>
      </footer>
    </div>
  );
};

export default App;
