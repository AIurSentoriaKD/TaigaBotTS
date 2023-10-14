import {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
  TextChannel,
} from "discord.js";
import { artistInfo, command } from "../../utils";
import * as puppeteer from "puppeteer";
import { chunk } from "../../utils";
import { Pagination } from "discordjs-button-embed-pagination";

const meta = new SlashCommandBuilder()
  .setName("kpartist")
  .setDescription("Shows the artists posts (latest 30).")
  .addIntegerOption((option) =>
    option
      .setName("id")
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
  );

export default command(meta, async ({ interaction, client }) => {
  await interaction.deferReply();
  const artistId: any = interaction.options.getInteger("id");
  const serviceName: any = interaction.options.getString("service");

  const [illustsObject, artistImage] = await artistInfo(artistId, serviceName, client, "interaction");

  if (illustsObject.length > 5) {
    const chunks = chunk(illustsObject, 5);
    const embeds = chunks.map((chunk: any, index) => {
      const embed = new EmbedBuilder();
      embed.setTitle("Artist");
      embed.setAuthor({
        name: `Kemono Party`,
        iconURL: "https://kemono.party/static/klogo.png",
        url: "https://kemono.party/",
      });
      embed.setDescription(
        `[${chunk[0].artistName}](${chunk[0].artistUrl}) || ${serviceName}`
      );
      embed.setThumbnail(`https://kemono.party${artistImage}`);
      embed.setColor(0xedd015);
      embed.setTimestamp();
      embed.setFooter({
        iconURL: interaction.user.displayAvatarURL().toString(),
        text: `Total Results: ${illustsObject.length}`,
      });
      for (let i = 0; i < chunk.length; i++) {
        const element = chunk[i];
        embed.addFields({
          name: `${element.attachmentsCount} | ID: ${element.postId} | Published: ${element.date}`,
          value: `[${element.title}](${element.pageUrl})`,
        });
      }
      return embed;
    });
    await interaction.editReply("Results. . .");
    return await new Pagination(
      interaction.channel as TextChannel,
      embeds,
      "page",
      60000
    ).paginate();
  } else {
    return await interaction.editReply("Menos de 5 Artworks");
  }
});
