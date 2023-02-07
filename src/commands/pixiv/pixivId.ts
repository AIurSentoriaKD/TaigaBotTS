import {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} from "discord.js";
import { command } from "../../utils";
import Pixiv from "pixiv.ts";
import keys from "../../keys";
const meta = new SlashCommandBuilder()
  .setName("pixivid")
  .setDescription("Seach pixiv image by ID")
  .addIntegerOption((option) =>
    option.setName("id").setDescription("Id to search").setRequired(true)
  );

export default command(meta, async ({ interaction }) => {
  await interaction.deferReply();

  const message = interaction.options.getInteger("id");

  const pixiv = await Pixiv.refreshLogin(keys.pixivRefresh);
  const illust = await pixiv.illust.get(
    `https://www.pixiv.net/en/artworks/${message}`
  );
  const image = await pixiv.util.downloadIllust(
    `https://www.pixiv.net/en/artworks/${message}`,
    "./illust",
    "large"
  );
  //console.log(image);
  //console.log(illust);
  const file = new AttachmentBuilder(image);
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`${illust.title}`)
    .setImage(`attachment://${message}.png`);

  return await interaction.editReply({
    embeds: [embed],
    files: [file],
  });
});
