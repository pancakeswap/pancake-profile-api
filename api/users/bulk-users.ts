import { VercelRequest, VercelResponse } from "@vercel/node";
import { getModel } from "../../utils/mongo";

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  const {
    addresses = [],
  }: {
    addresses: string[];
  } = req.body;

  const userModel = await getModel("User");
  const result = await addresses.reduce(async (accum, address) => {
    const { username } = await userModel.findOne({ address: address.toLowerCase() }).exec();
    return {
      ...accum,
      [address.toLowerCase()]: {
        address: address.toLowerCase(),
        username,
      },
    };
  }, {});

  return res.status(200).json(result);
};
