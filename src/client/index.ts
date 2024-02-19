import { GatewayIntentBits } from "discord.js";
import { registerEvents } from "../utils";
import events from "../events";
import keys from "../keys";
import Pixiv from "pixiv.ts";
import { Taiga } from "../types";
import mysql from "mysql2";
import { OpenAI } from "openai";
import * as puppeteer from "puppeteer";

//import { ImgurClient } from "imgur";
console.time("taiga");
let taiga: Taiga;
let browser: any;
const init = async () => {
  const pixiv = await Pixiv.refreshLogin(keys.pixivRefresh);

  // const imgurClient = new ImgurClient({
  //   clientId: keys.imgurClient,
  //   clientSecret: keys.imgurSecret,
  //   refreshToken: keys.imgurRefresh,
  //   accessToken: keys.imgurToken,
  // });

  // const mysqlConnection = mysql.createConnection({
  //   host: keys.mysqlServer,
  //   user: keys.mysqlUser,
  //   password: keys.mysqlPass,
  //   database: keys.mysqlDatabase,
  // });
  const loadOpenAi = false;
  const openaiConfig = new OpenAI({
    apiKey: keys.openAiToken,
  });
  browser = await puppeteer.launch({
    headless: "new",
  });
  const webView = await browser.newPage();
  taiga = new Taiga(
    {
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    },
    pixiv,
    null,
    openaiConfig,
    webView,
    loadOpenAi
  );

  taiga.openAIConversationLoad();

  registerEvents(taiga, events);

  taiga.login(keys.clientToken).catch((err) => {
    console.error("[Login Error]", err);
    process.exit(1);
  });
};

init();

process.on("SIGINT", function () {
  // console.log("Caught interrupt signal");
  taiga.sigintActions();
  browser.close();
  console.timeEnd("taiga");
  //process.exit();
});
