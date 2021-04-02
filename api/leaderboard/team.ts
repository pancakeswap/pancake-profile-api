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
    const users = await userModel
      .find({ team: teamId, leaderboard: { $exists: true } })
      .sort({ "leaderboard.team": "asc" })
      .exec();

    const data = users.map((user: User) => ({
      rank: user.leaderboard?.team,
      address: toChecksumAddress(user.address),
      username: user.username,
      volume: user.leaderboard?.volume,
    }));

    return res.status(200).json({ total: users.length, data });
  }

  return res.status(400).json({ error: { message: "Team unknown." } });
};
