import { Address, Hex, createPublicClient, http } from "viem";
import { bsc } from "viem/chains";

const bscPublicClient = createPublicClient({
  chain: bsc,
  transport: http("https://nodes.pancakeswap.info"),
});

export async function verifyMessage(
  message: string,
  signature: Hex,
  address: Address
): Promise<boolean> {
  return bscPublicClient.verifyMessage({
    address,
    message,
    signature,
  });
}
