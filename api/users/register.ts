import { NowRequest, NowResponse } from "@vercel/node";
import { verifyMessage } from "../../utils";
import { getModel } from "../../utils/mongo";

export default async (req: NowRequest, res: NowResponse): Promise<NowResponse> => {
  const { address, message, signature } = req.body;

  const signedAddress = verifyMessage(message, signature);
  if (address !== signedAddress) {
    return res.status(400).json({ error: { message: "Invalid signature." } });
  }

  const userModel = await getModel("User");
  const user = await new userModel({
    address,
    username: message,
    created_at: Date.now(),
    updated_at: null,
  }).save();

  return res.status(201).json(user);
};
