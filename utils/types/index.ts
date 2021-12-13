import { Document } from "mongoose";

export interface User extends Document {
  address: string;
  username: string;
  slug: string;
  team: string;
  leaderboard?: Leaderboard;
  leaderboard_fantoken?: Leaderboard;
  created_at: Date;
  updated_at: Date;
}

export interface Leaderboard {
  global: number;
  team: number;
  volume: number;
  next_rank: number;
}
