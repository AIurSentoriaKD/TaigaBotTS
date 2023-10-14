import {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
  TextChannel,
} from "discord.js";
import { artistSearch, command } from "../../utils";
import * as puppeteer from "puppeteer";
import { Pagination } from "discordjs-button-embed-pagination";
import { chunk } from "../../utils";

const meta = new SlashCommandBuilder()
  .setName("kpsearch")
  .setDescription(
    "Search for an artist by its name, this can show a list of artists."
  )
  .addStringOption((option) =>
    option
      .setName("artist")
      .setDescription(
        "Artist name using Name. Useful to know artist ID and service."
      )
      .setRequired(true)
  );
export default command(meta, async ({ interaction, client }) => {
  await interaction.deferReply();
  const artistName: any = interaction.options.getString("artist");
  if (!artistName) return await interaction.editReply({ content: "Nombre?" });
  const artistsData = await artistSearch(artistName, client, "interaction");
  if (artistsData.length > 5) {
    const chunks = chunk(artistsData, 5);
    const embeds = chunks.map((chunk, index) => {
      const embed = new EmbedBuilder();
      embed.setTitle("Kemono Party Search");
      embed.setAuthor({
        name: "Kemono Party",
        iconURL: "https://kemono.party/static/klogo.png",
        url: "https://kemono.party/",
      });
      embed.setColor(0xedd015);
      embed.setTimestamp();
      embed.setFooter({
        iconURL: interaction.user.displayAvatarURL().toString(),
        text: `Total Results: ${artistsData.length} | Page ${index + 1} of ${
          chunks.length
        }`,
      });
      for (let i = 0; i < chunk.length; i++) {
        const element: any = chunk[i];
        embed.addFields({
          name: `Service: ${element.service} || ID: ${element.id} `,
          value: `[${element.name}](${element.url})`,
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
    const embed = new EmbedBuilder();
    embed.setTitle("Kemono Party Search");
    embed.setAuthor({
      name: "Kemono Party",
      iconURL: "https://kemono.party/static/klogo.png",
      url: "https://kemono.party/",
    });
    embed.setColor(0xedd015);
    embed.setTimestamp();
    embed.setFooter({
      iconURL: interaction.user.displayAvatarURL().toString(),
      text: `Total Results: ${artistsData.length}`,
    });
    for (let i = 0; i < artistsData.length; i++) {
      const element = artistsData[i];
      embed.addFields({
        name: `Service: ${element.service} || ID: ${element.id} `,
        value: `[${element.name}](${element.url})`,
      });
    }
    return await interaction.editReply({
      embeds: [embed],
    });
  }
});
