import { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyMessage } from "ethers/lib/utils";
import { isValid } from "../../utils";
import { getModel } from "../../utils/mongo";

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  const { address, username, signature } = req.body;

  const { valid, message } = await isValid(username);
  if (!valid && message) {
    return res.status(400).json({ error: { message } });
  }

  const signedAddress = verifyMessage(username, signature);
  if (address.toLowerCase() !== signedAddress?.toLowerCase()) {
    return res.status(400).json({ error: { message: "Invalid signature." } });
  }

  const userModel = await getModel("User");
  if (!(await userModel.exists({ address: address.toLowerCase() }))) {
    const user = await new userModel({
      address: address.toLowerCase(),
      username,
      slug: username.toLowerCase(),
      created_at: Date.now(),
      updated_at: null,
    }).save();

    return res.status(201).json(user);
  } else {
    return res.status(400).json({ error: { message: "Address already registered." } });
  }

  return res.status(500).json({ error: { message: "Internal Server Error." } });
};
