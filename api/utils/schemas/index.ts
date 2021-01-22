import { Schema } from "mongoose";

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
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
    },
  },
  {
    collection: "users",
  }
);
