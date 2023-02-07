import { Client, GatewayIntentBits } from "discord.js";
import Pixiv from "pixiv.ts";
import { registerEvents } from "../utils";
import events from "../events";
import keys from "../keys";


const init = async () => {
  const taiga: Client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  });

  registerEvents(taiga, events);

  taiga.login(keys.clientToken).catch((err) => {
    console.error("[Login Error]", err);
    process.exit(1);
  });
};

init();
