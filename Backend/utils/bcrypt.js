import bcrypt from "bcrypt";

export const hashValue = async (value, saltRounds) =>
  await bcrypt.hash(value, saltRounds);

export const compareValue = async (value, hashedValue) =>
  await bcrypt.compare(value, hashedValue);