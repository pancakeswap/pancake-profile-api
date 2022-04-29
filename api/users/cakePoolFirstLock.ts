import { VercelRequest, VercelResponse } from "@vercel/node";
import { gql, request } from "graphql-request";
import { Parser } from "json2csv";

type User = {
  id: string;
  totalLocked: string;
  duration: string;
};

const getCsv = (users: User[]) => {
  const fields = ["id", "totalLocked", "duration"];

  const parser = new Parser({
    fields,
  });

  return parser.parse(users);
};

const getUsersFirstPage = async (subgraph: string) => {
  const { users } = await request(
    subgraph,
    gql`
      {
        users(
          orderBy: totalLocked
          orderDirection: desc
          first: 1000
          where: { duration_gte: 31449600 }
        ) {
          id
          totalLocked
          duration
        }
      }
    `
  );

  return users;
};

const getUserNextPages = async (subgraph: string, maxTotalLocked: string) => {
  const { users } = await request(
    subgraph,
    gql`
      query getUsersQuery($maxTotalLocked: String) {
        users(
          orderBy: totalLocked
          orderDirection: desc
          first: 1000
          where: { duration_gte: 31449600, totalLocked_lte: $maxTotalLocked }
        ) {
          id
          totalLocked
          duration
        }
      }
    `,
    { maxTotalLocked }
  );

  return users;
};

const cakePoolFirstLock = async (page: number, isCsv: boolean) => {
  const subgraph = "https://api.thegraph.com/subgraphs/name/chef-huan/cake-pool-first-lockers";
  let users = await getUsersFirstPage(subgraph);

  if (users.length > 0) {
    let allFetched = false;
    let fetchedPages = 1;
    while (!allFetched && fetchedPages < page) {
      const list = await getUserNextPages(subgraph, users[users.length - 1].totalLocked);
      if (isCsv) {
        if (list.length > 0) {
          users = users.concat(list);
        } else {
          allFetched = true;
        }
      } else {
        users = list;
        fetchedPages++;
      }
    }
  }

  return users;
};

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method === "GET") {
    try {
      const { authorization } = req.headers;

      if (authorization === `${process.env.PROFILE_API_SECRET_KEY}`) {
        try {
          const { csv, page = "1" } = req.query;
          const pageNumber = parseInt(page as string) < 1 ? 1 : parseInt(page as string);

          const isCsv = csv === "true";

          const users = await cakePoolFirstLock(pageNumber, isCsv);

          if (isCsv) {
            res.setHeader("Content-disposition", `attachment; filename=cake-pool-first-lock.csv`);
            res.setHeader("Content-Type", "text/csv");
            res.status(200).send(getCsv(users));
          } else {
            res.status(200).json({ success: true, users });
          }
        } catch (error) {
          console.log(error);
          throw new Error("Error during fetching");
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
