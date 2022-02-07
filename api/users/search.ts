import { VercelRequest, VercelResponse } from "@vercel/node";
import { gql, request } from "graphql-request";
import { Parser } from "json2csv";
import { PROFILE_SUBGRAPH } from "../../utils";

type User = {
  id: string;
  internalId: string;
  team: { id: string };
  isActive: boolean;
  nftAddress: string;
  tokenId: string;
  totalPoints: string;
};

const getUsersFirstPage = async (
  pageSize: number,
  team: string,
  totalPointGreater: string,
  totalPointLess: string,
  nftAddress: string,
  lastUserId: string
) => {
  const teamQuery = (team && " team: $team ") || "";
  const totalPointsGTQuery = (totalPointGreater && " totalPoints_gt: $totalPointGreater ") || "";
  const totalPointsLTQuery = (totalPointLess && " totalPoints_lt: $totalPointLess ") || "";
  const nftAddressQuery = (nftAddress && " nftAddress: $nftAddress ") || "";
  const lastUserIdQuery = (lastUserId && " internalId_gt: $lastUserId ") || "";

  const { users } = await request(
    PROFILE_SUBGRAPH,
    gql`
        query getUsersQuery($pageSize: Int, $team: String, $totalPointGreater: String, $totalPointLess: String, $nftAddress: String, $lastUserId: String) {
          users(orderBy: internalId, orderDirection: asc, first: $pageSize, where: ${
            "{" +
            teamQuery +
            totalPointsGTQuery +
            totalPointsLTQuery +
            nftAddressQuery +
            lastUserIdQuery +
            "}"
          }) {
            id
            internalId
            team {
              id
            }
            isActive
            nftAddress
            tokenId
            totalPoints
          }
        }
      `,
    { pageSize, team, totalPointGreater, totalPointLess, nftAddress, lastUserId }
  );

  return users;
};

const getCsv = (users: User[]) => {
  const fields = [
    "id",
    "internalId",
    "team.id",
    "isActive",
    "nftAddress",
    "tokenId",
    "totalPoints",
  ];

  const parser = new Parser({
    fields,
  });

  return parser.parse(users);
};

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method === "GET") {
    try {
      const { authorization } = req.headers;
      if (authorization === `${process.env.PROFILE_API_SECRET_KEY}`) {
        try {
          const {
            csv,
            team,
            totalPointGreater,
            totalPointLess,
            nftAddress,
            onlyCount,
            page = "1",
          } = req.query;
          let { pageSize = "1000" } = req.query;

          const isCsv = csv === "true";
          const isOnlyCount = onlyCount === "true";
          if (parseInt(pageSize as string) > 1000 || isCsv) {
            pageSize = "1000";
          }

          let lastUserId = "";
          let users: User[] = [];

          let fetchedPage = 0;
          let fetchedUsersCount = 0;
          let allFetched = false;
          while (fetchedPage < parseInt(page as string) && !allFetched) {
            {
              const fetchedUsers = await getUsersFirstPage(
                parseInt(pageSize as string),
                team as string,
                totalPointGreater as string,
                totalPointLess as string,
                nftAddress as string,
                lastUserId
              );
              lastUserId = fetchedUsers[fetchedUsers.length - 1]?.internalId;

              if (isCsv || onlyCount) {
                if (onlyCount) {
                  fetchedUsersCount += fetchedUsers.length;
                } else {
                  users = users.concat(fetchedUsers);
                }
                if (fetchedUsers.length < pageSize || lastUserId === undefined) {
                  allFetched = true;
                }
              } else {
                users = fetchedUsers;
                fetchedPage = fetchedPage + 1;
              }
            }
          }

          if (isCsv) {
            res.setHeader(
              "Content-disposition",
              `attachment; filename=profile-${new Date().toISOString()}.csv`
            );
            res.setHeader("Content-Type", "text/csv");
            res.status(200).send(getCsv(users));
          } else if (isOnlyCount) {
            res.status(200).json({ total: fetchedUsersCount, success: true });
          } else {
            res.status(200).json({ data: users, success: true });
          }
        } catch (error) {
          console.log(error);
          throw new Error("Error refreshing Trading Competition Leaderboard");
        }
      } else {
        res.status(401).json({ success: false });
      }
    } catch (err) {
      res.status(500).json({ statusCode: 500 });
    }
  } else {
    res.setHeader("Allow", "GET");
    res.status(405).end("Method Not Allowed");
  }
};
