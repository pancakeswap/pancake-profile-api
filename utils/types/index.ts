import { Document } from "mongoose";

export interface User extends Document {
  address: string;
  username: string;
  slug: string;
  team: string;
  leaderboard?: Leaderboard;
  leaderboard_fantoken?: Leaderboard;
  leaderboard_mobox?: LeaderboardMobox;
  leaderboard_dar?: LeaderboardDar;
  leaderboard_test?: LeaderboardMobox;
  created_at: Date;
  updated_at: Date;
}

export interface Leaderboard {
  global: number;
  team: number;
  volume: number;
  next_rank: number;
}

export interface LeaderboardMobox extends Leaderboard {
  moboxVolumeRank?: number;
  moboxVolume?: number;
}

export interface LeaderboardDar extends Leaderboard {
  darVolumeRank?: number;
  darVolume?: number;
}
