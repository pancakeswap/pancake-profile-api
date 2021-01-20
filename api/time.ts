import { NowRequest, NowResponse } from "@vercel/node";

export default (req: NowRequest, res: NowResponse): void => {
  const time = new Date().getTime();

  res.json({ time });
};
