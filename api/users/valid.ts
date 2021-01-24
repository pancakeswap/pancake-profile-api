import { NowRequest, NowResponse } from "@vercel/node";
import { isValid } from "../utils";

export default async (req: NowRequest, res: NowResponse): Promise<NowResponse> => {
  const { username } = req.query;

  const valid = isValid(username as string);

  return res.status(200).json({ username, valid });
};
