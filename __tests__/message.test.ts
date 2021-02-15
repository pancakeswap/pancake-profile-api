import { verifyMessage } from "../utils";

describe("UTILS - verifyMessage", () => {
  it("cannot parse address from empty signature", async () => {
    const address = await verifyMessage("CakeIsBae", "");

    expect(address).not.toBeDefined();
  });

  it("cannot parse address from invalid signature", async () => {
    const address = await verifyMessage(
      "CakeIsBae",
      "8144a6fa26be252b86456491fbcd43c1de7e022241845ffea1c3df066f7cfede"
    );

    expect(address).not.toBeDefined();
  });
});
