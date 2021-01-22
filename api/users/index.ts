import { NowRequest, NowResponse } from "@vercel/node";
import { getConnection } from "../utils/mongo";

export default async (req: NowRequest, res: NowResponse): Promise<NowResponse> => {
  const { address } = req.query;

  const connection = await getConnection();
  const user = await connection.model("User").findOne({ address }).lean().exec();

  return res.status(200).json(user);
};
