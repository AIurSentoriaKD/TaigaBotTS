import { Keys } from "../types";

const keys: Keys = {
  clientToken: process.env.CLIENT_TOKEN ?? "NULL",
  openAiToken: process.env.OPENAI_TOKEN ?? "NULL",
  openAiOrganization: process.env.OPENAI_ORGANIZATION ?? "NULL",
  testGuild: process.env.TEST_GUILD ?? "NULL",
  pixivRefresh: process.env.PIXIV_TOKEN ?? "NULL",
  saucenaoToken: process.env.SAUCENAO_TOKEN ?? " NULL",
  imgurClient: process.env.IMGUR_CLIENT ?? "NULL",
  imgurEmail: process.env.IMGUR_EMAIL ?? "NULL",
  imgurPass: process.env.IMGUR_PASS ?? "NULL",
  imgurToken: process.env.IMGUR_TOKEN ?? "NULL",
  imgurSecret: process.env.IMGUR_SECRET ?? "NULL",
  imgurRefresh: process.env.IMGUR_REFRESH ?? "NULL",
  mysqlServer: process.env.MYSQL_SERVER ?? "NULL",
  mysqlUser: process.env.MYSQL_USER ?? "NULL",
  mysqlPass: process.env.MYSQL_PASSWORD ?? "NULL",
  mysqlDatabase: process.env.MYSQL_DATABASE ?? "NULL",
};

if (Object.values(keys).includes("NULL")) {
  throw new Error("Not ENV var defined.");
}

export default keys;
