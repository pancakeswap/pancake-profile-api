import { VercelRequest, VercelResponse } from "@vercel/node";
import { toChecksumAddress } from "ethereumjs-util";
import { getModel } from "../../utils/mongo";
import { User } from "../../utils/types";

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  const userModel = await getModel("User");

  const volume = await userModel.aggregate([
    {
      $group: {
        _id: null,
        volume: { $sum: "$leaderboard.volume" },
      },
    },
  ]);

  const users = await userModel
    .find({ leaderboard: { $exists: true } })
    .sort({ "leaderboard.global": "asc" })
    .limit(20)
    .exec();

  const data = users.map((user: User) => ({
    rank: user.leaderboard?.global,
    address: toChecksumAddress(user.address),
    username: user.username,
    volume: user.leaderboard?.volume,
    teamId: user.leaderboard?.team,
  }));

  return res.status(200).json({ total: users.length, volume: volume[0].volume, data });
};
