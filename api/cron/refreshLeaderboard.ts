import { VercelRequest, VercelResponse } from "@vercel/node";
import { gql, request } from "graphql-request";
import { getModel } from "../../utils/mongo";
import { getLeaderboardKey, getTradingCompId, getTradingCompSubgraph } from "../../utils/naming";

type User = {
  id: string;
  team: { id: string };
  volumeUSD: string;
  globalRank?: number;
};

const getUsersFirstPage = async (tradingCompSubgraph: string) => {
  const { users } = await request(
    tradingCompSubgraph,
    gql`
      {
        users(first: 1000, orderBy: volumeUSD, orderDirection: desc) {
          id
          volumeUSD
          team {
            id
          }
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
          orderBy: volumeUSD
          orderDirection: desc
          first: 1000
          where: { volumeUSD_gt: 0, volumeUSD_lt: $maxVolumeUSD }
        ) {
          id
          volumeUSD
          team {
            id
          }
        }
      }
    `,
    { maxVolumeUSD }
  );

  return users;
};

const updateLeaderboard = async (competitionId: string, users: User[]) => {
  const teamUser = new Map();
  for (let i = 0; i < users.length; i++) {
    users[i].globalRank = i + 1;
    const userList = teamUser.get(users[i].team.id);
    if (userList == undefined) {
      teamUser.set(users[i].team.id, [users[i]]);
    } else {
      userList.push(users[i]);
    }
  }

  for (const [, value] of teamUser.entries()) {
    let lastTierVolume = 0;
    for (let i = 0; i < value.length; i++) {
      value[i].teamRank = i + 1;

      if (lastTierVolume === 0) {
        value[i].next_rank = 0;
      } else {
        value[i].next_rank = lastTierVolume - value[i].volumeUSD;
      }

      if (i === 0) {
        lastTierVolume = value[i].volumeUSD;
      }
      if (i === 9) {
        lastTierVolume = value[i].volumeUSD;
      }
      if (i === 99) {
        lastTierVolume = value[i].volumeUSD;
      }
      if (i === 499) {
        lastTierVolume = value[i].volumeUSD;
      }
    }
  }

  const userModel = await getModel("User");
  for (const [key, value] of teamUser.entries()) {
    for (let i = 0; i < value.length; i++) {
      const query = { address: value[i].id.toLowerCase() };
      try {
        await userModel
          .updateOne(
            query,
            {
              [getLeaderboardKey(competitionId)]: {
                global: value[i].globalRank,
                team: value[i].teamRank,
                volume: value[i].volumeUSD,
                next_rank: value[i].next_rank,
              },
              team: key,
              updated_at: new Date(),
            },
            { strict: false, upsert: false }
          )
          .exec();
      } catch (e) {
        throw e;
      }
    }
  }
};

const refreshTradingCompLeaderboard = async (competitionId: string) => {
  console.log("TradingCompLeaderboard refresh start");
  const tradingCompSubgraph = getTradingCompSubgraph(competitionId);
  let users = await getUsersFirstPage(tradingCompSubgraph);
  console.log("Fetched users count:", users.length);

  if (users.length > 0) {
    let allFetched = false;
    while (!allFetched) {
      const list = await getUserNextPages(tradingCompSubgraph, users[users.length - 1].volumeUSD);
      console.log(
        "Fetched users count:",
        list.length,
        "lastPageMaxVolumeUSD",
        users[users.length - 1].volumeUSD
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
  console.log("TradingCompLeaderboard refresh end");
};

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method === "POST") {
    try {
      const { authorization } = req.headers;

      if (authorization === `${process.env.CRON_API_SECRET_KEY}`) {
        try {
          let { competitionId } = req.query;
          competitionId = getTradingCompId(competitionId);

          await refreshTradingCompLeaderboard(competitionId);
          res.status(200).json({ success: true });
        } catch (error) {
          throw new Error("Error refreshing Trading Competition Leaderboard");
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
