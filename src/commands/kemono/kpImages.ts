import {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
  TextChannel,
} from "discord.js";
import { command, imageDeliver } from "../../utils";
import * as puppeteer from "puppeteer";
import { Pagination } from "discordjs-button-embed-pagination";
const meta = new SlashCommandBuilder()
  .setName("kpimages")
  .setDescription(
    "Gets an artist most recent 5 images. It's recommended to use the other two before."
  )
  .addIntegerOption((option) =>
    option
      .setName("userid")
      .setDescription("Id of the required artist.")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("service")
      .setDescription("Service wich you want to get.")
      .setRequired(true)
      .addChoices(
        { name: "Pixiv FanBox", value: "fanbox" },
        { name: "Patreon", value: "patreon" },
        { name: "Fantia", value: "fantia" }
      )
  )
  .addIntegerOption((option) =>
    option
      .setName("postid")
      .setDescription("Id of required post.")
      .setRequired(true)
  );

export default command(meta, async ({ interaction, client }) => {
  await interaction.deferReply();
  const artistId: any = interaction.options.get("userid")?.value;
  const postId: any = interaction.options.get("postid")?.value;
  const serviceName: any = interaction.options.get("service")?.value;

  const imagesData = await imageDeliver(
    artistId,
    postId,
    serviceName,
    client,
    "interaction"
  );

  const embeds = imagesData.images.map((image: any) => {
    const embed = new EmbedBuilder();
    embed.setTitle("Kemono Party Image");
    embed.setDescription(`${imagesData.title}`);
    embed.setColor(0xedd015);
    embed.setAuthor({
      name: "Kemono Party",
      iconURL: "https://kemono.su/static/klogo.png",
      url: "https://kemono.su/",
    });
    embed.setTimestamp();
    //console.log(imagesData.avatar[1])
    embed.setThumbnail(`${imagesData.avatar[1]}`);
    embed.setFooter({
      iconURL: interaction.user.displayAvatarURL().toString(),
      text: `${imagesData.images.length} Images`,
    });
    embed.setImage(`https:${image[1]}`);
    //console.log(`https:${image[1]}`)
    embed.setFooter({
      iconURL: interaction.user.displayAvatarURL().toString(),
      text: `Total Images: ${imagesData.images.length}`,
    });
    return embed;
  });

  await interaction.editReply("Resultados. . .");
  return await new Pagination(
    interaction.channel as TextChannel,
    embeds,
    "page",
    60000
  ).paginate();
});
