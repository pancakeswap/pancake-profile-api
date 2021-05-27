import { VercelRequest, VercelResponse } from "@vercel/node";
import { toChecksumAddress } from "ethereumjs-util";
import { gql, request } from "graphql-request";
import { TRADING_COMPETITION_V1_SUBGRAPH } from "../../utils";

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  const results = await request(
    TRADING_COMPETITION_V1_SUBGRAPH,
    gql`
      {
        users(first: 500, block: { number: 6553043 }, orderBy: volumeUSD, orderDirection: desc) {
          id
          volumeUSD
          team {
            id
          }
        }
      }
    `
  );

  const volume = results.users.reduce((acc: any, user: any) => {
    return acc + parseFloat(user.volumeUSD);
  }, 0);

  const data = results.users.map((user: any, index: number) => ({
    rank: index + 1,
    address: toChecksumAddress(user.id),
    volume: parseFloat(user.volumeUSD),
    teamId: parseInt(user.team.id),
  }));

  return res.status(200).json({ total: results.users.length, volume: volume, data });
};
