import { VercelRequest, VercelResponse } from "@vercel/node";
import { isValid } from "../../utils";

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  const { username } = req.query;

  const { valid, message } = await isValid(username as string);
  if (!valid && message) {
    return res.status(400).json({ error: { message } });
  }

  return res.status(200).json({ username, valid });
};
