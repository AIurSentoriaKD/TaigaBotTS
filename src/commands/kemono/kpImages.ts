import {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
  TextChannel,
} from "discord.js";
import { command } from "../../utils";
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
  const artistId = interaction.options.getInteger("userid");
  const postId = interaction.options.getInteger("postid");
  const serviceName = interaction.options.getString("service");

  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto(
    `https://kemono.party/${serviceName}/user/${artistId}/post/${postId}`
  );
  const grabData = await page.evaluate(() => {
    const artistName =
      document.querySelector<HTMLElement>(".post__user-name")?.innerText;
    const artistProfile = document
      .querySelector<HTMLElement>(".post__user a[href]")
      ?.getAttribute("href");
    const illustTitle =
      document.querySelectorAll<HTMLElement>(".post__title")[0].innerText;

    const images = Array.from(
      document.querySelectorAll(".post__thumbnail")
    ).map((x) => {
      return [
        x.querySelector("a[href]")?.getAttribute("href"),
        x.querySelector("img[src]")?.getAttribute("src"),
      ];
    });

    const profileImages = Array.from(
      document.querySelectorAll(".fancy-image__picture")
    ).map((img) => {
      return (
        "https://kemono.party" +
        img.querySelector("img[src]")?.getAttribute("src")
      );
    });

    const data = {
      name: artistName,
      profileLink: "https://kemono.party" + artistProfile,
      avatar: profileImages,
      title: illustTitle,
      images: images,
    };
    return data;
  });
  page.close();
  browser.close();

  const embeds = grabData.images.map((image) => {
    const embed = new EmbedBuilder();
    embed.setTitle("Kemono Party Image");
    embed.setDescription(`${grabData.title}`);
    embed.setColor(0xedd015);
    embed.setAuthor({
      name: "Kemono Party",
      iconURL: "https://kemono.party/static/klogo.png",
      url: "https://kemono.party/",
    });
    embed.setTimestamp();
    embed.setThumbnail(`${grabData.avatar[1]}`);
    embed.setFooter({
      iconURL: interaction.user.displayAvatarURL().toString(),
      text: `${grabData.images.length} Images`,
    });
    embed.setImage(`https://kemono.party${image[1]}`);
    embed.setFooter({
      iconURL: interaction.user.displayAvatarURL().toString(),
      text: `Total Images: ${grabData.images.length}`,
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
