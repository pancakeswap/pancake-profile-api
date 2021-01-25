import { isValid } from "../utils";
import { getConnection } from "../utils/mongo";
import { Connection } from "mongoose";

describe("UTILS - isValid", () => {
  let connection: Connection | null = null;

  beforeAll(async () => {
    connection = await getConnection();
  });

  it("valid username", async () => {
    const { valid, message } = await isValid("Jeff");

    expect(valid).toStrictEqual(true);
    expect(message).toStrictEqual(undefined);
  });

  it("cannot use a username of less than 3 characters", async () => {
    const { valid, message } = await isValid("a");

    expect(valid).toStrictEqual(false);
    expect(message).toStrictEqual("Minimum length: 3 characters");
  });

  it("cannot use a username of more than 15 characters", async () => {
    const { valid, message } = await isValid("aaaaaaaaaaaaaaaaaaaa");

    expect(valid).toStrictEqual(false);
    expect(message).toStrictEqual("Maximum length: 15 characters");
  });

  it("can only use alphanumeric characters", async () => {
    const { valid, message } = await isValid("CakeUwU");

    expect(valid).toStrictEqual(true);
    expect(message).toStrictEqual(undefined);
  });

  it("can only use alphanumeric characters", async () => {
    const { valid, message } = await isValid("C@keUwU");

    expect(valid).toStrictEqual(false);
    expect(message).toStrictEqual("No spaces or special characters");
  });

  it("cannot use a space in their username", async () => {
    const { valid, message } = await isValid("aaaaa aaaaa");

    expect(valid).toStrictEqual(false);
    expect(message).toStrictEqual("No spaces or special characters");
  });

  it("cannot use a space (URI encoded) in their username", async () => {
    const { valid, message } = await isValid("aaaaa%20aaaaa");

    expect(valid).toStrictEqual(false);
    expect(message).toStrictEqual("No spaces or special characters");
  });

  it("cannot create a username which violates blacklist", async () => {
    const { valid, message } = await isValid("ChefCake");

    expect(valid).toStrictEqual(false);
    expect(message).toStrictEqual("Username not allowed");
  });

  afterAll(async () => {
    await connection?.close();
  });
});
