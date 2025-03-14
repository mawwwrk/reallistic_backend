// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable promise/always-return */
import {
  hash,
  compare,
  preSaveHashPWHook,
  authenticateUser,
} from "../models/Users";

describe("password hashing and comparing", () => {
  describe("hashing function", () => {
    const password = "password";
    it("returns a string of length 60", () => {
      expect(hash(password)).toHaveLength(60);
    });
    it("output is not equal to the input", () => {
      expect(hash(password)).not.toBe(password);
    });
  });

  describe("comparing function", () => {
    const password = "password";
    const hashedPassword = hash(password);
    it("returns true when the password matches the hashed password", () => {
      expect(compare(password, hashedPassword)).toBe(true);
    });
    it("returns false when the password does not match the hashed password", () => {
      expect(compare("wrong password", hashedPassword)).toBe(false);
    });
  });
});

describe("presavehook", () => {
  const pw = "password";
  const thisContext = {
    username: "username",
    password: pw,
    isModified: jest.fn(),
  };
  const mockNext = jest.fn();

  it("immediately returns next when password is not modified", () => {
    thisContext.isModified.mockReturnValueOnce(false);
    preSaveHashPWHook.call(thisContext, mockNext);
    expect(thisContext.isModified).toHaveBeenCalled();
    expect(thisContext.password).toBe(pw);
  });

  it("hashes the password", () => {
    thisContext.isModified.mockReturnValueOnce(true);
    preSaveHashPWHook.call(thisContext, mockNext);
    expect(thisContext.password).not.toBe(pw);
  });
});

const compMock = jest.fn((i) => i === "right password");

describe("authUser instance method", () => {
  const user = {
    username: "username",
    password: "password",
    accountType: "admin",
    comparePassword: compMock,
  };

  const findMock = jest.fn((i) =>
    i.username === "username" ? Promise.resolve(user) : Promise.resolve()
  );

  const userModel = {
    findOne: findMock,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each`
    username          | password            | expected | returnVal
    ${user.username}  | ${"wrong password"} | ${1}     | ${new Error("failed authentication")}
    ${"any old name"} | ${user.password}    | ${0}     | ${new Error("failed authentication")}
    ${user.username}  | ${"right password"} | ${1}     | ${user}
  `(
    "returns $expected when username and password match",
    async ({ username, password, expected, returnVal }) => {
      const result = await authenticateUser.call(userModel, {
        username,
        password,
      });
      expect(result).toEqual(returnVal);
      expect(findMock.mock.calls).toHaveLength(1);
      expect(compMock.mock.calls).toHaveLength(expected);
    }
  );
});
