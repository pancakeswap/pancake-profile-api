import { Schema } from "mongoose";

export const leaderboardSchema: Schema = new Schema({
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
