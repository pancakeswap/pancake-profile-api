import { VercelRequest, VercelResponse } from "@vercel/node";
import { gql, request } from "graphql-request";
import { getAddress } from "ethers/lib/utils";
import { getTradingCompId, getTradingCompSubgraph } from "../../utils/naming";

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

  let { competitionId } = req.query;
  competitionId = getTradingCompId(competitionId);

  const { competition, users } = await request(
    getTradingCompSubgraph(competitionId),
    gql`
      {
        competition(id: ${competitionId === "test" ? "3" : competitionId}) {
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
    total: parseInt(competition?.userCount || "0"),
    volume: parseFloat(competition?.volumeUSD || "0"),
    data,
  });
};
