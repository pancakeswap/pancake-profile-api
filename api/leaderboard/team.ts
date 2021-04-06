import { VercelRequest, VercelResponse } from "@vercel/node";
import { toChecksumAddress } from "ethereumjs-util";
import { getModel } from "../../utils/mongo";
import { User } from "../../utils/types";

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  let { teamId } = req.query;
  teamId = teamId as string;

  if (teamId) {
    const userModel = await getModel("User");

    const volume = await userModel.aggregate([
      { $match: { team: teamId } },
      { $limit: 500 },
      {
        $group: {
          _id: null,
          volume: { $sum: "$leaderboard.volume" },
        },
      },
    ]);

    const users = await userModel
      .find({ team: teamId, leaderboard: { $exists: true } })
      .sort({ "leaderboard.team": "asc" })
      .limit(20)
      .exec();

    const data = users.map((user: User) => ({
      rank: user.leaderboard?.team,
      address: toChecksumAddress(user.address),
      username: user.username,
      volume: user.leaderboard?.volume,
      teamId: parseInt(user?.team),
    }));

    return res.status(200).json({ total: users.length, volume: volume[0].volume, data });
  }

  return res.status(400).json({ error: { message: "Team unknown." } });
};
