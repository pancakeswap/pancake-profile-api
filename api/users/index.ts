import { NowRequest, NowResponse } from "@vercel/node";
import { getModel } from "../../utils/mongo";

export default async (req: NowRequest, res: NowResponse): Promise<NowResponse | void> => {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { address } = req.query;
  const sanitizedAddress: string = address as string;

  const userModel = await getModel("User");
  const user = await userModel.findOne({ address: sanitizedAddress.toLowerCase() }).lean();
  if (!user) {
    return res.status(404).json({ error: { message: "Entity not found." } });
  }

  return res.status(200).json({
    address: user.address,
    username: user.username,
    created_at: user.created_at,
    updated_at: user.updated_at,
  });
};
