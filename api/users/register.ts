import { NowRequest, NowResponse } from "@vercel/node";
import { verifyMessage } from "../utils";

export default async (req: NowRequest, res: NowResponse): Promise<NowResponse> => {
  const { address, message, signature } = req.body;

  const signedAddress = verifyMessage(message, signature);
  if (address !== signedAddress) {
    return res.status(400).json({ error: { code: 1110, message: "Invalid signature." } });
  }

  return res.status(200).json({ address, message });
};
