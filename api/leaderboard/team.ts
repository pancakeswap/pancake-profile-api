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

  let { teamId } = req.query;
  teamId = teamId as string;

  if (teamId) {
    const result = await request(
      TRADING_COMPETITION_V1_SUBGRAPH,
      gql`
        {
            users (first: 500, where: { team: "${teamId}" }, orderBy: volumeUSD, orderDirection: desc, block: { number: 6553043 }) {
                id
                volumeUSD
                team {
                    id
                    userCount
                }
            }
        }
    `
    );

    const volume = result.users.reduce((acc: number, user: User) => {
      return acc + parseFloat(user.volumeUSD);
    }, 0);

    const data = result.users.map((user: User, index: number) => ({
      rank: index + 1,
      address: toChecksumAddress(user.id),
      volume: parseFloat(user.volumeUSD),
      teamId: parseInt(user.team.id),
    }));

    return res
      .status(200)
      .json({ total: parseInt(result.users[0].team.userCount), volume: volume, data });
  }

  return res.status(400).json({ error: { message: "Team unknown." } });
};
