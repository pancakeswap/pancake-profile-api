import { VercelRequest, VercelResponse } from "@vercel/node";
import { gql, request } from "graphql-request";
import { getAddress } from "ethers/lib/utils";
import {
  getRewardGroup,
  getRewardGroupTitle,
  getTradingCompId,
  getTradingCompSubgraph,
} from "../../utils/naming";

interface User {
  id: string;
  volumeUSD: string;
}

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  let { competitionId, teamId, rewardGroup } = req.query;
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

    if (rewardGroup) {
      rewardGroup = getRewardGroup(rewardGroup);
      let users;
      switch (rewardGroup) {
        case "1":
          users = team.users.slice(100);
          break;
        case "2":
          users = team.users.slice(10, 100);
          break;
        case "3":
          users = team.users.slice(1, 10);
          break;
        case "4":
          users = team.users.slice(0, 1);
          break;
      }
      users = users.map((user: User) => user.id);

      return res.status(200).json({ rewardGroup: getRewardGroupTitle(rewardGroup), users });
    } else {
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
  }

  return res.status(400).json({ error: { message: "Team unknown." } });
};
