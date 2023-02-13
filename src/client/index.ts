import { GatewayIntentBits } from "discord.js";
import { registerEvents } from "../utils";
import events from "../events";
import keys from "../keys";
import Pixiv from "pixiv.ts";
import { ImgurClient } from "imgur";
import { Taiga } from "../types";
import mysql from "mysql2";
const init = async () => {
  const pixiv = await Pixiv.refreshLogin(keys.pixivRefresh);
  const imgurClient = new ImgurClient({
    clientId: keys.imgurClient,
    clientSecret: keys.imgurSecret,
    refreshToken: keys.imgurRefresh,
    accessToken: keys.imgurToken,
  });
  // const connection = mysql.createConnection({
  //   host: keys.mysqlServer,
  //   user: keys.mysqlUser,
  //   password: keys.mysqlPass,
  //   database: keys.mysqlDatabase,
  // });

  const taiga: Taiga = new Taiga(
    {
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    },
    pixiv,
    null
  );

  registerEvents(taiga, events);

  taiga.login(keys.clientToken).catch((err) => {
    console.error("[Login Error]", err);
    process.exit(1);
  });
};

init();
