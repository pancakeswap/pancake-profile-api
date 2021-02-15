import { verifyMessage } from "../utils";

describe("UTILS - verifyMessage", () => {
  it("can parse address from valid signature", async () => {
    const address = await verifyMessage(
      "CakeIsBae",
      "0x033fc8f01625a76c1423f70e274ce91369250eb660642704c70e06535ada0d8d6af8f84dc611732e8a318fbb08ec0ade9027dacdc2e67971b5f56fe4b18ed7751b"
    );

    expect(address).toStrictEqual("0xed54a7c1d8634bb589f24bb7f05a5554b36f9618");
  });

  it("cannot parse address from empty signature", async () => {
    const address = await verifyMessage("CakeIsBae", "");

    expect(address).toStrictEqual(undefined);
  });

  it("cannot parse address from invalid signature", async () => {
    const address = await verifyMessage(
      "CakeIsBae",
      "8144a6fa26be252b86456491fbcd43c1de7e022241845ffea1c3df066f7cfede"
    );

    expect(address).toStrictEqual(undefined);
  });
});
