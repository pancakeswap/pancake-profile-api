import { NowRequest, NowResponse } from "@vercel/node";
import { toChecksumAddress } from "ethereumjs-util";
import { getModel } from "../../utils/mongo";
import { User } from "../../utils/types";

export default async (req: NowRequest, res: NowResponse): Promise<NowResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  const userModel = await getModel("User");
  const users = await userModel
    .find({ leaderboard: { $exists: true } })
    .sort({ "leaderboard.global": "asc" })
    .exec();

  const data = users.map((user: User) => ({
    rank: user.leaderboard?.global,
    address: toChecksumAddress(user.address),
    username: user.username,
    volume: user.leaderboard?.volume,
  }));

  return res.status(200).json({ total: users.length, data });
};