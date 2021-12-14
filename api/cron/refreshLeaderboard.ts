import { VercelRequest, VercelResponse } from "@vercel/node";
import { gql, request } from "graphql-request";
import { getModel } from "../../utils/mongo";
import { TRADING_COMPETITION_SUBGRAPH } from "../../utils";

const teamIds = ["1", "2", "3"] as const;

type TeamId = typeof teamIds[number];

type User = {
  id: string;
  team: { id: string };
  volumeUSD: string;
  globalRank?: number;
};

const teamResult: Record<TeamId, User[]> = {
  "1": [],
  "2": [],
  "3": [],
};

const combineTeamResult = () => {
  return [...teamResult["1"], ...teamResult["2"], ...teamResult["3"]].sort((a, b) => {
    return Number(a.volumeUSD) > Number(b.volumeUSD) ? -1 : 1;
  });
};

const refreshTradingCompLeaderboard = async (team: TeamId = "1", skip = 0) => {
  console.log("TradingCompLeaderboard refresh begin team:", team, "skip:", skip);

  const { users } = await request(
    TRADING_COMPETITION_SUBGRAPH,
    gql`
      query getUsersQuery($team: String, $skip: Int) {
        users(
          orderBy: volumeUSD
          orderDirection: desc
          first: 1000
          skip: $skip
          where: { team: $team }
        ) {
          id
          volumeUSD
          team {
            id
          }
        }
      }
    `,
    {
      team,
      skip,
    }
  );

  console.log("Fetched users count: {}", users.length);
  if (users.length > 0) {
    teamResult[team].push(users);
    if (skip + 1000 < 6000) {
      await refreshTradingCompLeaderboard(team, skip + 1000);
    }
  }

  console.log("TradingCompLeaderboard refresh ended");
};

const updateLeaderboard = async (users: User[]) => {
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
              leaderboard_fantoken: {
                global: value[i].globalRank,
                team: value[i].teamRank,
                volume: value[i].volumeUSD,
                next_rank: value[i].next_rank,
              },
              team: key,
              updated_at: new Date(),
            },
            { strict: false, upsert: true }
          )
          .exec();
      } catch (e) {
        console.log(e);
      }
    }
  }
};

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method === "POST") {
    try {
      const { authorization } = req.headers;

      console.log(process.env.CRON_API_SECRET_KEY);
      if (authorization === `${process.env.CRON_API_SECRET_KEY}`) {
        for (const id of teamIds) {
          await refreshTradingCompLeaderboard(id);
        }
        const allUsersWithOrder = combineTeamResult();
        updateLeaderboard(allUsersWithOrder);
        res.status(200).json({ success: true });
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
