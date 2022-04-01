import { VercelRequest, VercelResponse } from "@vercel/node";
import { getAddress, isAddress } from "ethers/lib/utils";
import { getModel } from "../../utils/mongo";

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  let { address } = req.query;
  address = address as string;

  // Sanity check for address; to avoid any SQL-like injections, ...
  if (address && isAddress(address)) {
    const userModel = await getModel("User");
    const user = await userModel.findOne({ address: address.toLowerCase() }).exec();
    if (!user) {
      return res.status(404).json({ error: { message: "Entity not found." } });
    }

    return res.status(200).json({
      address: getAddress(user.address),
      username: user.username,
      leaderboard: {
        global: user.leaderboard?.global ?? "???",
        team: user.leaderboard?.team ?? "???",
        volume: user.leaderboard?.volume ?? 0,
        next_rank: user.leaderboard?.next_rank ?? "???",
      },
      leaderboard_fantoken: {
        global: user.leaderboard_fantoken?.global ?? "???",
        team: user.leaderboard_fantoken?.team ?? "???",
        volume: user.leaderboard_fantoken?.volume ?? 0,
        next_rank: user.leaderboard_fantoken?.next_rank ?? "???",
      },
      leaderboard_mobox: {
        global: user.leaderboard_mobox?.global ?? "???",
        team: user.leaderboard_mobox?.team ?? "???",
        volume: user.leaderboard_mobox?.volume ?? 0,
        next_rank: user.leaderboard_mobox?.next_rank ?? "???",
      },
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  }

  return res.status(400).json({ error: { message: "Invalid address." } });
};
