import { NowRequest, NowResponse } from "@vercel/node";
import { isValidAddress, toChecksumAddress } from "ethereumjs-util";
import { getModel } from "../../utils/mongo";

export default async (req: NowRequest, res: NowResponse): Promise<NowResponse | void> => {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  let { address } = req.query;
  address = address as string;
  if (isValidAddress(address)) {
    const userModel = await getModel("User");
    const user = await userModel.findOne({ address: address.toLowerCase() }).lean();
    if (!user) {
      return res.status(404).json({ error: { message: "Entity not found." } });
    }

    return res.status(200).json({
      address: toChecksumAddress(user.address),
      username: user.username,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  }

  return res.status(400).json({ error: { message: "Invalid address." } });
};
