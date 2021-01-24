import { NowRequest, NowResponse } from "@vercel/node";
import { getModel } from "../utils/mongo";

export default async (req: NowRequest, res: NowResponse): Promise<NowResponse> => {
  const { address } = req.query;

  const userModel = await getModel("User");
  const user = await userModel.findOne({ address }).lean().exec();

  return res.status(200).json(user);
};
