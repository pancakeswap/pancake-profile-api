import { NowRequest, NowResponse } from "@vercel/node";
import { isValid } from "../../utils";

export default async (req: NowRequest, res: NowResponse): Promise<NowResponse | void> => {
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const { username } = req.query;

  const { valid, message } = await isValid(username as string);
  if (!valid && message) {
    return res.status(400).json({ error: { message } });
  }

  return res.status(200).json({ username, valid });
};
