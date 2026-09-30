import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const defaults = {
  audience: ["user"],
};

const accessTokenSignOptions = {
  expiresIn: `${process.env.JWT_EXPIRES_IN}` ,
  secret: `${process.env.JWT_SECRET}`,
};

export const signJwtToken = (
  payload,
  options
) => {
  const isAccessToken = !options || options === accessTokenSignOptions;

  const { secret, ...opts } = options || accessTokenSignOptions;

  const token = jwt.sign(payload, secret, {
    ...defaults,
    ...opts,
  });

  const decoded = jwt.decode(token);
  const expiresAt = isAccessToken && decoded?.exp
    ? decoded.exp * 1000
    : undefined;

  return {
    token,
    expiresAt,
  };
};