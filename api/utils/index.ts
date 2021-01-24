import { hashPersonalMessage, fromRpcSig, ecrecover, publicToAddress, bufferToHex } from "ethereumjs-util";
import blacklist from "../utils/blacklist.json";

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

/**
 * Check for the validity of a username based on rules (see documentation).
 *
 * @see https://github.com/pancakeswap/pancake-profile/blob/master/user-stories.md#step-4-username-creation
 *
 * @param {string} username
 * @returns {boolean}
 */
export const isValid = (username: string): boolean => {
  // Check username length (between 3 and 15 characters)
  if (username.length < 3 || username.length > 15) {
    return false;
  }

  // Check for non-alphanumeric characters.
  if (!username.match(/^[a-zA-Z0-9]+$/i)) {
    return false;
  }

  // TODO:  Cannot have the same username as another user (Case insensitive).
  // Require Web3 with a contract call.

  // Check for username not in blacklist.
  if (username.toLowerCase().match(blacklist.join("|"))) {
    return false;
  }

  return true;
};
