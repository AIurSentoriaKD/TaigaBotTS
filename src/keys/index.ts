import { Keys } from "../types";

const keys: Keys = {
  clientToken: process.env.CLIENT_TOKEN ?? "nil",
};

if (Object.values(keys).includes("nil")) {
  throw new Error("Not ENV var defined.");
}

export default keys;
