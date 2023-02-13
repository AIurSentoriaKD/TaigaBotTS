import {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
  TextChannel,
} from "discord.js";
import { command } from "../../utils";
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
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto(`https://kemono.party/artists`, {
    waitUntil: "networkidle2",
  });
  await page.type("#q", artistName);

  await client.wait(500);

  const artistsData = await page.evaluate(() => {
    const artistsDiv = document.querySelectorAll(".card-list__items a");
    const artistsAref = document.querySelectorAll(".card-list__items a[href]");

    let output: any[] = [];

    for (let i = 0; i < artistsDiv.length; i++) {
      const artist: any = artistsDiv[i];
      const artistInfo = artist.innerText.split(/\r\n|\r|\n/);
      console.log(artistInfo);
      output.push({
        service: artistInfo[0],
        name: artistInfo[1],
        favorites: artistInfo[2].split(" ")[0],
        url: "https://kemono.party" + artistsAref[i].getAttribute("href"),
        id: artistsAref[i].getAttribute("href")?.split("/").at(-1),
      });
    }

    // let artists: string[] = [];
    // let artistsLink: string[] = [];

    // artistsAref.forEach((a: any) => artistsLink.push(a.getAttribute("href")));

    // artistsDiv.forEach((artist: any) => {
    //   artists.push(artist.innerText.split(/\r\n|\r|\n/));
    // });

    return output;
  });
  page.close();
  browser.close();

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
        text: `Total Results: ${artistsData.length} | Page ${index+1} of ${chunks.length}`,
      });
      for (let i = 0; i < chunk.length; i++) {
        const element = chunk[i];
        embed.addFields({
          name: `Service: ${element.service} || ID: ${element.id} `,
          value: `[${element.name}](${element.url})`,
        });
      }
      return embed;
    });
    await interaction.editReply('Results. . .');
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
