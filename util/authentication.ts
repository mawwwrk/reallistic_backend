import type { SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { accessSecret, refreshSecret } from "./envhelper";
import crypto from "crypto";

const expiry = {
  access: "15m",
  refresh: "1h",
};

const jwtoptions: SignOptions = {
  encoding: "utf8",
  algorithm: "HS384",
  mutatePayload: true,
  subject: "user",
  noTimestamp: true,
};

const generateAccessToken = (userdata: { [k: string]: string }) =>
  jwt.sign(userdata, accessSecret, { ...jwtoptions, expiresIn: expiry.access });

const sha256hash = (input) =>
  crypto.createHash("sha256").update(input).digest("base64");

function generateRefreshToken(userdata) {
  const fgp = crypto.randomBytes(64).toString("base64");
  const cookieValue = sha256hash(fgp);
  const refreshToken = jwt.sign({ ...userdata, fgp }, refreshSecret, {
    ...jwtoptions,
    expiresIn: expiry.refresh,
  });
  return [refreshToken, cookieValue];
}

type fgpToken = { fgp: string } & jwt.JwtPayload;
const verifyRefreshToken = (token, fgp) => {
  const decoded = jwt.verify(token, refreshSecret);
  if (!decoded) return false;
  const tfgp = (decoded as fgpToken).fgp;
  return sha256hash(tfgp) === fgp ? decoded : false;
};

const authMiddleWare = (req, res, next) => {
  const cookie = req.cookies;
  const headers = req.headers;

  if (!cookie) return next();
  const decoded = verifyRefreshToken(cookie, req.cookies.fgp);
  if (!decoded) return next();
  req.user = decoded;
  next();
};

export { generateAccessToken, generateRefreshToken, verifyRefreshToken };
