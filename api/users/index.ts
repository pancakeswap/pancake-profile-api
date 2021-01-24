import { NowRequest, NowResponse } from "@vercel/node";
import { getUserModel } from "../utils/mongo";

export default async (req: NowRequest, res: NowResponse): Promise<NowResponse> => {
  const { address } = req.query;

  const userModel = await getUserModel();
  const user = userModel.findOne({ address }).lean().exec();

  return res.status(200).json(user);
};
