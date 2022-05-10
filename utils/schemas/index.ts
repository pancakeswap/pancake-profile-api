import { Schema } from "mongoose";

const defaultLeaderboardSchema = {
  global: {
    type: Number,
    default: 0,
  },
  team: {
    type: Number,
    default: 0,
  },
  volume: {
    type: Number,
    default: 0,
  },
  next_rank: {
    type: Number,
    default: 0,
  },
};

export const leaderboardSchema: Schema = new Schema(defaultLeaderboardSchema);
export const moboxLeaderboardSchema: Schema = new Schema({
  ...defaultLeaderboardSchema,
  moboxVolume: {
    type: Number,
    default: 0,
  },
  moboxVolumeRank: {
    type: Number,
  },
});
export const darLeaderboardSchema: Schema = new Schema({
  ...defaultLeaderboardSchema,
  darVolume: {
    type: Number,
    default: 0,
  },
  darVolumeRank: {
    type: Number,
  },
});

export const userSchema: Schema = new Schema(
  {
    address: {
      type: String,
      index: {
        unique: true,
      },
      required: true,
    },
    username: {
      type: String,
      index: {
        unique: true,
      },
      required: true,
    },
    slug: {
      type: String,
      index: {
        unique: true,
      },
      required: true,
    },
    team: {
      type: String,
      required: false,
    },
    leaderboard: {
      type: leaderboardSchema,
      required: false,
    },
    leaderboard_fantoken: {
      type: leaderboardSchema,
      required: false,
    },
    leaderboard_mobox: {
      type: moboxLeaderboardSchema,
      required: false,
    },
    leaderboard_dar: {
      type: darLeaderboardSchema,
      required: false,
    },
    leaderboard_test: {
      type: leaderboardSchema,
      required: false,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: null,
    },
  },
  {
    collection: "users",
  }
);
