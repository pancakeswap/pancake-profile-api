import { VercelRequest, VercelResponse } from "@vercel/node";
import { gql, request } from "graphql-request";
import { getModel } from "../../utils/mongo";
import { getLeaderboardKey, getTradingCompId, getTradingCompSubgraph } from "../../utils/naming";

type User = {
  id: string;
  team: { id: string };
  darVolumeUSD: string;
  darVolumeRank?: number;
};

const getUsersFirstPage = async (tradingCompSubgraph: string) => {
  const { users } = await request(
    tradingCompSubgraph,
    gql`
      {
        users(
          first: 1000
          orderBy: darVolumeUSD
          orderDirection: desc
          where: { darVolumeUSD_gt: 0 }
        ) {
          id
          darVolumeUSD
        }
      }
    `
  );

  return users;
};

const getUserNextPages = async (tradingCompSubgraph: string, maxVolumeUSD: string) => {
  const { users } = await request(
    tradingCompSubgraph,
    gql`
      query getUsersQuery($maxVolumeUSD: String) {
        users(
          orderBy: darVolumeUSD
          orderDirection: desc
          first: 1000
          where: { darVolumeUSD_gt: 0, darVolumeUSD_lt: $maxVolumeUSD }
        ) {
          id
          darVolumeUSD
        }
      }
    `,
    { maxVolumeUSD }
  );

  return users;
};

const updateLeaderboard = async (competitionId: string, users: User[]) => {
  const userModel = await getModel("User");
  for (let i = 1; i <= users.length; i++) {
    const query = { address: users[i - 1].id.toLowerCase() };
    try {
      await userModel
        .updateOne(
          query,
          {
            [`${getLeaderboardKey(competitionId)}.darVolumeRank`]: i,
            [`${getLeaderboardKey(competitionId)}.darVolume`]: Number(users[i - 1].darVolumeUSD),
            updated_at: new Date(),
          },
          { strict: false, upsert: false }
        )
        .exec();
    } catch (e) {
      throw e;
    }
  }
};

const refreshSpecificTokenLeaderboard = async (competitionId: string) => {
  if (["test", "1", "2"].includes(competitionId)) {
    return;
  }
  console.log("Specific token TradingCompLeaderboard refresh start");
  const tradingCompSubgraph = getTradingCompSubgraph(competitionId);
  let users = await getUsersFirstPage(tradingCompSubgraph);
  console.log("Fetched users count:", users.length);

  if (users.length > 0) {
    let allFetched = false;
    while (!allFetched) {
      const list = await getUserNextPages(
        tradingCompSubgraph,
        users[users.length - 1].darVolumeUSD
      );
      console.log(
        "Fetched users count:",
        list.length,
        "lastPageMaxVolumeUSD",
        users[users.length - 1].darVolumeUSD
      );
      if (list.length > 0) {
        users = users.concat(list);
      } else {
        allFetched = true;
      }
    }

    await updateLeaderboard(competitionId, users);
  }

  console.log("Fetched users count: {}", users.length);
  console.log("Specific Token TradingCompLeaderboard refresh end");
};

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method === "POST") {
    try {
      const { authorization } = req.headers;

      if (authorization === `${process.env.CRON_API_SECRET_KEY}`) {
        try {
          let { competitionId } = req.query;
          competitionId = getTradingCompId(competitionId);

          await refreshSpecificTokenLeaderboard(competitionId);
          res.status(200).json({ success: true });
        } catch (error) {
          throw new Error("Error refreshing Specific Token Trading Competition Leaderboard");
        }
      } else {
        res.status(401).json({ success: false });
      }
    } catch (err) {
      res.status(500).json({ statusCode: 500 });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};
