import { SlashCommandBuilder } from "discord.js";

import { command } from "../../utils";
const meta = new SlashCommandBuilder()
  .setName("img2img")
  .setDescription("Stable Diffusion img2img")
  .addStringOption((option) =>
    option.setName("prompt").setDescription("prompt").setRequired(true)
  );

export default command(meta, async ({ interaction, client }) => {});
