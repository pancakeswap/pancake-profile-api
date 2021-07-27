import blacklist from "./blacklist.json";
import { getModel } from "./mongo";

export const TRADING_COMPETITION_V1_SUBGRAPH =
  "https://api.thegraph.com/subgraphs/name/pancakeswap/trading-competition-v1";

/**
 * Check for the validity of a username based on rules (see documentation).
 *
 * @see https://github.com/pancakeswap/pancake-profile/blob/master/user-stories.md#step-4-username-creation
 *
 * @param {string} username
 * @returns {Promise<{ valid: boolean; message?: string }>}
 */
export const isValid = async (username: string): Promise<{ valid: boolean; message?: string }> => {
  // Check if the username is set to avoid unhandled rejection.
  if (!username) {
    return {
      valid: false,
      message: "Minimum length: 3 characters",
    };
  }

  // Cannot use a username of less than 3 characters
  if (username.length < 3) {
    return {
      valid: false,
      message: "Minimum length: 3 characters",
    };
  }

  // Cannot use a username of more than 15 characters
  if (username.length > 15) {
    return {
      valid: false,
      message: "Maximum length: 15 characters",
    };
  }

  // Can only use alphanumeric characters
  // Cannot use a space in their username
  if (!username.match(/^[a-zA-Z0-9]+$/i)) {
    return {
      valid: false,
      message: "No spaces or special characters",
    };
  }

  // Cannot create a username which violates blacklist
  if (username.toLowerCase().match(blacklist.join("|"))) {
    return {
      valid: false,
      message: "Username not allowed",
    };
  }

  // Cannot have the same username as another user (Case insensitive)
  const userModel = await getModel("User");
  if (await userModel.exists({ slug: username.toLowerCase() })) {
    return {
      valid: false,
      message: "Username taken",
    };
  }

  return {
    valid: true,
  };
};
