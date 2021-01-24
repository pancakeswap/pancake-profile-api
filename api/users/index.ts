import { NowRequest, NowResponse } from "@vercel/node";
import { getModel } from "../../utils/mongo";

export default async (req: NowRequest, res: NowResponse): Promise<NowResponse> => {
  const { address } = req.query;

  const userModel = await getModel("User");
  const user = await userModel.findOne({ address }).lean();
  if (!user) {
    return res.status(404).json({ error: { message: "Entity not found." } });
  }

  return res.status(200).json(user);
};
