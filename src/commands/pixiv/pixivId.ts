import {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} from "discord.js";

import { command } from "../../utils";
const meta = new SlashCommandBuilder()
  .setName("pixivid")
  .setDescription("Seach pixiv image by ID")
  .addIntegerOption((option) =>
    option.setName("id").setDescription("Id to search").setRequired(true)
  );

export default command(meta, async ({ interaction, client }) => {
  await interaction.deferReply();
  const message = interaction.options.getInteger("id");
  const illust: any = await client.pixiv.illust.get(
    `https://www.pixiv.net/en/artworks/${message}`
  );

  let image: any;
  if (illust.page_count < 2) {
    image = await client.pixiv.util.downloadIllust(
      `https://www.pixiv.net/en/artworks/${message}`,
      "./illust",
      "large"
    );
  } else {
    image = await client.pixiv.util.downloadIllusts(
      `https://www.pixiv.net/en/artworks/${message}`,
      "./illust",
      "large",
      [{ folder: `${message}`, tag: `${message}` }]
    );
  }

  // const files = readdirSync(image.split(".")[0]);
  // const filePaths = files.map((file) => path.join(image.split(".")[0], file));

  // const times = metadata.ugoira_metadata.frames.map((frame) => frame.delay);

  // const imageWebp = await client.pixiv.util.encodeAnimatedWebp(filePaths, times);
  // console.log(imageWebp);
  // const stats = statSync(image);
  // const filesize = stats.size / (1024 * 1024);

  // const response = await client.imgur.upload({
  //   image: readFileSync(image),
  //   type: "stream",
  // });

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
