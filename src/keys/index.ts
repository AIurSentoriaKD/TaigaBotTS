import { Keys } from "../types";

const keys: Keys = {
  clientToken: process.env.CLIENT_TOKEN ?? "nil",
  testGuild: process.env.TEST_GUILD ?? "nil",
  pixivRefresh: process.env.PIXIV_TOKEN ?? "nil",
  imgurClient: process.env.IMGUR_CLIENT ?? "nil",
  imgurEmail: process.env.IMGUR_EMAIL ?? "nil",
  imgurPass: process.env.IMGUR_PASS ?? "nil",
  imgurToken: process.env.IMGUR_TOKEN ?? "nil",
  imgurSecret: process.env.IMGUR_SECRET ?? "nil",
  imgurRefresh: process.env.IMGUR_REFRESH ?? "nil",
  mysqlServer: process.env.MYSQL_SERVER ?? "nil",
  mysqlUser: process.env.MYSQL_USER ?? "nil",
  mysqlPass: process.env.MYSQL_PASSWORD ?? "nil",
  mysqlDatabase: process.env.MYSQL_DATABASE ?? "nil",
};

if (Object.values(keys).includes("nil")) {
  throw new Error("Not ENV var defined.");
}

export default keys;
