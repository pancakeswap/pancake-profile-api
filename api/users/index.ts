import { VercelRequest, VercelResponse } from "@vercel/node";
import { toChecksumAddress } from "ethereumjs-util";
import { getModel } from "../../utils/mongo";

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  let { address } = req.query;
  address = address as string;

  // Sanity check for address; to avoid any SQL-like injections, ...
  if (address && address.match(/^0x[0-9a-fA-F]{40}$/)) {
    const userModel = await getModel("User");
    const user = await userModel.findOne({ address: address.toLowerCase() }).exec();
    if (!user) {
      return res.status(404).json({ error: { message: "Entity not found." } });
    }

    return res.status(200).json({
      address: toChecksumAddress(user.address),
      username: user.username,
      leaderboard: {
        global: user.leaderboard?.global ?? "???",
        team: user.leaderboard?.team ?? "???",
        volume: user.leaderboard?.volume ?? 0,
      },
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  }

  return res.status(400).json({ error: { message: "Invalid address." } });
};
