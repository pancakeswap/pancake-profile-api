import { VercelRequest, VercelResponse } from "@vercel/node";
import { version } from "../package.json";

export default (req: VercelRequest, res: VercelResponse): void => {
  res.json({ version });
};
