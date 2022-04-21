import { VercelRequest, VercelResponse } from "@vercel/node";
import { gql, request } from "graphql-request";
import { getModel } from "../../utils/mongo";
import { getTradingCompSubgraph } from "../../utils";

type User = {
  id: string;
  team: { id: string };
  moboxVolumeUSD: string;
  moboxVolumeRank?: number;
};

const getUsersFirstPage = async (tradingCompSubgraph: string) => {
  const { users } = await request(
    tradingCompSubgraph,
    gql`
      {
        users(first: 1000, orderBy: moboxVolumeUSD, orderDirection: desc) {
          id
          moboxVolumeUSD
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
          orderBy: moboxVolumeUSD
          orderDirection: desc
          first: 1000
          where: { moboxVolumeUSD_gt: 0, moboxVolumeUSD_lt: $maxVolumeUSD }
        ) {
          id
          moboxVolumeUSD
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
            ["leaderboard_mobox.moboxVolumeRank"]: i,
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

const refreshMoboxLeaderboard = async () => {
  console.log("Mobox TradingCompLeaderboard refresh start");
  const tradingCompSubgraph = getTradingCompSubgraph("3");
  let users = await getUsersFirstPage(tradingCompSubgraph);
  console.log("Fetched users count:", users.length);

  if (users.length > 0) {
    let allFetched = false;
    while (!allFetched) {
      const list = await getUserNextPages(
        tradingCompSubgraph,
        users[users.length - 1].moboxVolumeUSD
      );
      console.log(
        "Fetched users count:",
        list.length,
        "lastPageMaxVolumeUSD",
        users[users.length - 1].moboxVolumeUSD
      );
      if (list.length > 0) {
        users = users.concat(list);
      } else {
        allFetched = true;
      }
    }

    await updateLeaderboard("3", users);
  }

  console.log("Fetched users count: {}", users.length);
  console.log("Mobox TradingCompLeaderboard refresh end");
};

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method === "POST") {
    try {
      const { authorization } = req.headers;

      if (authorization === `${process.env.CRON_API_SECRET_KEY}`) {
        try {
          await refreshMoboxLeaderboard();
          res.status(200).json({ success: true });
        } catch (error) {
          throw new Error("Error refreshing Mobox Trading Competition Leaderboard");
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
