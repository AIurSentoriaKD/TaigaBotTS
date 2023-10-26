import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export function createPaginationButtons(urlToSearch: string) {
  const pageButtons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("previous")
        .setLabel("◀")
        .setStyle(ButtonStyle.Primary)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("▶")
        .setStyle(ButtonStyle.Primary)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("links")
        .setLabel("LINKS")
        .setStyle(ButtonStyle.Secondary)
    );
  // .addComponents(
  //   new ButtonBuilder()
  //     .setCustomId("delete")
  //     .setLabel("🗑️")
  //     .setStyle(ButtonStyle.Danger)
  // );
  const buttonLinks_1 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setLabel("YANDEX")
        .setURL(
          "https://yandex.com/images/search?rpt=imageview&url=" + urlToSearch
        )
        .setStyle(ButtonStyle.Link)
    )
    .addComponents(
      new ButtonBuilder()
        .setLabel("GOOGLE")
        .setURL("https://www.google.com/searchbyimage?image_url=" + urlToSearch)
        .setStyle(ButtonStyle.Link)
    )
    .addComponents(
      new ButtonBuilder()
        .setLabel("ASCII2D")
        .setURL("https://ascii2d.net/search/url/" + urlToSearch)
        .setStyle(ButtonStyle.Link)
    );
  const buttonLinks_2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setLabel("IMAGE-OPS")
        .setURL("https://imgops.com/" + urlToSearch)
        .setStyle(ButtonStyle.Link)
    )
    .addComponents(
      new ButtonBuilder()
        .setLabel("TINY-EYE")
        .setURL("https://www.tineye.com/search/?url=" + urlToSearch)
        .setStyle(ButtonStyle.Link)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("back")
        .setLabel("BACK")
        .setStyle(ButtonStyle.Primary)
    );
  const linkButtons = [buttonLinks_1, buttonLinks_2];
  return [linkButtons, pageButtons];
}

export async function createNamePagination(urlToSearch: string) {
    
}
