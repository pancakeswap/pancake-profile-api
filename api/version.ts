import { NowRequest, NowResponse } from "@vercel/node";
import { version } from "../package.json";

export default (req: NowRequest, res: NowResponse): void => {
  res.json({ version });
};
