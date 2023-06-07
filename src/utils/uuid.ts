import { v4 } from "uuid";

export type Uuid = string & {
  readonly __brand: unique symbol;
};

export const generateUuid = (): Uuid => {
  return v4() as Uuid;
};
