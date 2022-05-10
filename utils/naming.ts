const TRADING_COMP_URL_PREFIX =
  "https://api.thegraph.com/subgraphs/name/pancakeswap/trading-competition-";

export const getTradingCompSubgraph = (id: string): string => {
  switch (id) {
    case "1":
      return TRADING_COMP_URL_PREFIX + "v1";
    case "2":
      return TRADING_COMP_URL_PREFIX + "v2";
    case "3":
      return TRADING_COMP_URL_PREFIX + "v3";
    case "4":
      return TRADING_COMP_URL_PREFIX + "v4";
    case "test":
      return process.env.TEST_TRADING_COMP_URL || TRADING_COMP_URL_PREFIX + "v2";
    default:
      return TRADING_COMP_URL_PREFIX + "v2";
  }
};

export const getTradingCompId = (competitionID: string | string[]): string => {
  competitionID = competitionID as string;
  if (["test", "1", "2", "3", "4"].includes(competitionID)) {
    return competitionID;
  }
  return "2";
};

export const getRewardGroup = (competitionID: string | string[]): string => {
  competitionID = competitionID as string;
  if (["1", "2", "3", "4"].includes(competitionID)) {
    return competitionID;
  }
  return "4";
};

export const getRewardGroupTitle = (competitionID: string): string | undefined => {
  competitionID = competitionID as string;
  switch (competitionID) {
    case "1":
      return "1 - Purple";
    case "2":
      return "2 - Bronze";
    case "3":
      return "3 - Silver";
    case "4":
      return "4 - Gold";
  }
};

export const getLeaderboardKey = (competitionID: string): string => {
  switch (competitionID) {
    case "1":
      return "leaderboard";
    case "2":
      return "leaderboard_fantoken";
    case "3":
      return "leaderboard_mobox";
    case "4":
      return "leaderboard_dar";
    case "test":
      return "leaderboard_test";
    default:
      return "leaderboard_fantoken";
  }
};

export const getSpecificTokenKeys = (
  competitionID: string
): { volumeUSD: string; volumeRank: string; volume: string } => {
  switch (competitionID) {
    case "3":
      return { volumeUSD: "moboxVolumeUSD", volumeRank: "moboxVolumeRank", volume: "moboxVolume" };
    case "4":
      return { volumeUSD: "darVolumeUSD", volumeRank: "moboxVolumeRank", volume: "darVolume" };
    default:
      return { volumeUSD: "moboxVolumeUSD", volumeRank: "moboxVolumeRank", volume: "darVolume" };
  }
};
