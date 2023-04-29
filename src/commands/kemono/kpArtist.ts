import {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
  TextChannel,
} from "discord.js";
import { command } from "../../utils";
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
  const artistId = interaction.options.getInteger("id");
  const serviceName = interaction.options.getString("service");
  const browser = await puppeteer.launch({
    headless: "new",
  });
  const page = await browser.newPage();
  await page.goto(`https://kemono.party/${serviceName}/user/${artistId}`, {
    waitUntil: "networkidle2",
  });

  const [
    artistName,
    illustTitles,
    illustDates,
    illustAttachments,
    illustRefs,
    artistImage,
  ] = await page.evaluate(() => {
    const artistImage: any = document
      .querySelectorAll<HTMLElement>(".fancy-image__picture img[src]")[1]
      ?.getAttribute("src");

    const artistName: string = document.querySelectorAll<HTMLElement>(
      ".user-header__profile span"
    )[1].innerText;

    const illustTitles = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".card-list__items article .image-link .post-card__header"
      )
    ).map((x) => x.innerText);

    const illustDates = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".card-list__items article .image-link .post-card__footer .timestamp"
      )
    ).map((x) => x.innerText.split(" ")[0]);

    const illustAttachments = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".card-list__items article .image-link .post-card__footer div"
      )
    ).map((x) => x.innerText);

    const illustRefs = Array.from(
      document.querySelectorAll(".card-list__items article a[href]")
    ).map((x) => x.getAttribute("href"));

    return [
      artistName,
      illustTitles,
      illustDates,
      illustAttachments,
      illustRefs,
      artistImage,
    ];
  });

  page.close();
  browser.close();

  let illustsObject: any[] = [];

  for (let i = 0; i < illustTitles.length; i++) {
    const illust = {
      artistId: artistId,
      artistName: artistName,
      artistUrl: "https://kemono.party/fanbox/user/" + artistId,
      title: illustTitles[i],
      date: illustDates[i],
      attachmentsCount: illustAttachments[i],
      pageUrl: "https://kemono.party" + illustRefs[i],
      postId: illustRefs[i].split("/").at(-1),
    };
    illustsObject.push(illust);
  }

  if (illustsObject.length > 5) {
    const chunks = chunk(illustsObject, 5);
    const embeds = chunks.map((chunk, index) => {
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
