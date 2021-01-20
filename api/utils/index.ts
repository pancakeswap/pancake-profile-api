import { hashPersonalMessage, fromRpcSig, ecrecover, publicToAddress, bufferToHex } from "ethereumjs-util";

/**
 * Recover the msg.sender for a given signature based on a message.
 *
 * @see https://github.com/ethereumjs/ethereumjs-util/blob/master/docs/modules/_signature_.md
 *
 * @param {string} message
 * @param {string} signature
 * @returns {string}
 */
export const verifyMessage = (message: string, signature: string): string => {
  // Returns the keccak-256 hash of `message`, prefixed with the header used by the `eth_sign` RPC call.
  const msgHash = hashPersonalMessage(Buffer.from(message, "utf-8"));

  // Convert signature format of the `eth_sign` RPC method to signature parameters.
  const { v, r, s } = fromRpcSig(signature);

  // ECDSA public key recovery from signature.
  const publicKey = ecrecover(msgHash, v, r, s, 56);

  // Returns the ethereum address of a given public key.
  // Converts a `Buffer` into a `0x`-prefixed hex `String`.
  const address = bufferToHex(publicToAddress(publicKey, true));

  return address;
};
