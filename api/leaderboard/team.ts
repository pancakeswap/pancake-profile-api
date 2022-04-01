import { VercelRequest, VercelResponse } from "@vercel/node";
import { gql, request } from "graphql-request";
import { getAddress } from "ethers/lib/utils";
import { getTradingCompId, getTradingCompSubgraph } from "../../utils";

interface User {
  id: string;
  volumeUSD: string;
}

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  let { competitionId, teamId } = req.query;
  teamId = teamId as string;
  competitionId = getTradingCompId(competitionId);

  if (teamId) {
    const { team } = await request(
      getTradingCompSubgraph(competitionId),
      gql`
        query getUsersByTeamOrderedByVolumeDesc($teamId: ID!) {
          team(id: $teamId) {
            id
            userCount
            users(first: 500, orderBy: volumeUSD, orderDirection: desc) {
              id
              volumeUSD
            }
          }
        }
      `,
      {
        teamId,
      }
    );

    const volume = team.users.reduce((acc: number, user: User) => {
      return acc + parseFloat(user.volumeUSD);
    }, 0);

    const data = team.users.map((user: User, index: number) => ({
      rank: index + 1,
      address: getAddress(user.id),
      volume: parseFloat(user.volumeUSD),
      teamId: parseInt(team.id),
    }));

    return res.status(200).json({ total: parseInt(team.userCount), volume: volume, data });
  }

  return res.status(400).json({ error: { message: "Team unknown." } });
};
