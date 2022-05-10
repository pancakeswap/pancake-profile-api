import { VercelRequest, VercelResponse } from "@vercel/node";
import { getAddress, isAddress } from "ethers/lib/utils";
import { getModel } from "../../utils/mongo";
import { User } from "../../utils/types";

const getLeaderboards = (user: User) => {
  return {
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
      moboxVolumeRank: user.leaderboard_mobox?.moboxVolumeRank ?? "???",
      moboxVolume: user.leaderboard_mobox?.moboxVolume ?? "???",
    },
    leaderboard_dar: {
      global: user.leaderboard_dar?.global ?? "???",
      team: user.leaderboard_dar?.team ?? "???",
      volume: user.leaderboard_dar?.volume ?? 0,
      next_rank: user.leaderboard_dar?.next_rank ?? "???",
      darVolumeRank: user.leaderboard_dar?.darVolumeRank ?? "???",
      darVolume: user.leaderboard_dar?.darVolume ?? "???",
    },
    leaderboard_test: {
      global: user.leaderboard_test?.global ?? "???",
      team: user.leaderboard_test?.team ?? "???",
      volume: user.leaderboard_test?.volume ?? 0,
      next_rank: user.leaderboard_test?.next_rank ?? "???",
      moboxVolumeRank: user.leaderboard_test?.moboxVolumeRank ?? "???",
      moboxVolume: user.leaderboard_test?.moboxVolume ?? "???",
    },
  };
};

const getLeaderboardResponse = (user: User, tradingComp: string) => {
  switch (tradingComp) {
    case "1":
      return {
        leaderboard: getLeaderboards(user).leaderboard,
      };
    case "2":
      return {
        leaderboard_fantoken: getLeaderboards(user).leaderboard_fantoken,
      };
    case "3":
      return {
        leaderboard_mobox: getLeaderboards(user).leaderboard_mobox,
      };
    case "4":
      return {
        leaderboard_dar: getLeaderboards(user).leaderboard_dar,
      };
    case "test":
      return {
        leaderboard_test: getLeaderboards(user).leaderboard_test,
      };
    default:
      return getLeaderboards(user);
  }
};

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  let { address, tradingComp } = req.query;
  address = address as string;
  tradingComp = tradingComp as string;

  // Sanity check for address; to avoid any SQL-like injections, ...
  if (address && isAddress(address)) {
    const userModel = await getModel("User");
    const user = await userModel.findOne({ address: address.toLowerCase() }).exec();
    if (!user) {
      return res.status(404).json({ error: { message: "Entity not found." } });
    }

    return res.status(200).json({
      ...{
        address: getAddress(user.address),
        username: user.username,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      ...getLeaderboardResponse(user, tradingComp),
    });
  }

  return res.status(400).json({ error: { message: "Invalid address." } });
};
