import { VercelRequest, VercelResponse } from "@vercel/node";
import { toChecksumAddress } from "ethereumjs-util";
import { gql, request } from "graphql-request";
import { TRADING_COMPETITION_V1_SUBGRAPH } from "../../utils";

interface User {
  id: string;
  volumeUSD: string;
  team: {
    id: string;
  };
}

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  const { competition, users } = await request(
    TRADING_COMPETITION_V1_SUBGRAPH,
    gql`
      {
        competition(id: "1") {
          id
          userCount
          volumeUSD
        }
        users(first: 500, orderBy: volumeUSD, orderDirection: desc) {
          id
          volumeUSD
          team {
            id
          }
        }
      }
    `
  );

  const data = users.map((user: User, index: number) => ({
    rank: index + 1,
    address: toChecksumAddress(user.id),
    volume: parseFloat(user.volumeUSD),
    teamId: parseInt(user.team.id),
  }));

  return res.status(200).json({
    total: parseInt(competition.userCount),
    volume: parseFloat(competition.volumeUSD),
    data,
  });
};
