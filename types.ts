
export interface PlayerData {
  playerName: string;
  slotNo: number;
}

export interface SlotData {
  slotNo: number;
  players: string[];
}

export interface MatchResult {
  rank: number;
  playerName: string;
  kills: number;
}

export interface PointSystem {
  pointsPerKill: number;
  positionPoints: Record<number, number>;
}

export interface FinalLeaderboardRow {
  rank: number;
  slotNo: number;
  teamName: string;
  win: boolean;
  killPoints: number;
  positionPoints: number;
  totalPoints: number;
  totalKills: number;
}

export interface AppState {
  lobbyImages: string[];
  endImages: string[];
  slots: SlotData[];
  results: MatchResult[];
  pointSystem: PointSystem;
  isProcessing: boolean;
  error: string | null;
}
