import { VercelRequest, VercelResponse } from "@vercel/node";
import { gql, request } from "graphql-request";
import { getAddress } from "ethers/lib/utils";
import { TRADING_COMPETITION_V2_SUBGRAPH_TEST } from "../../utils";

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
    TRADING_COMPETITION_V2_SUBGRAPH_TEST,
    gql`
      {
        competition(id: "2") {
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
    address: getAddress(user.id),
    volume: parseFloat(user.volumeUSD),
    teamId: parseInt(user.team.id),
  }));

  return res.status(200).json({
    total: parseInt(competition.userCount),
    volume: parseFloat(competition.volumeUSD),
    data,
  });
};
