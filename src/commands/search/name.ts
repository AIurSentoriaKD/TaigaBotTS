import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import { command, SauceNaoEmbedBuilder } from "../../utils";

import sagiri from "sagiri";
import keys from "../../keys";
const sauceNao_Client = sagiri(keys.saucenaoToken);
const URLPattern =
  /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
const meta = new SlashCommandBuilder()
  .setName("name")
  .setDescription("Obtén la fuente de una imagen. si es que la conozco.")
  .addAttachmentOption((option) =>
    option.setName("imgfile").setDescription("Id of the required artist.")
  )
  .addStringOption((option) =>
    option.setName("url").setDescription("Puedes usar el link de una imagen.")
  );

export default command(meta, async ({ interaction, client }) => {
  const imgfile: any = interaction.options.getAttachment("imgfile");
  let urlToSearch: any;
  if (imgfile) {
    urlToSearch = imgfile.url;
  } else {
    urlToSearch = interaction.options.getString("url");
    if (!urlToSearch) {
      return;
    }
    if (!URLPattern.test(urlToSearch)) {
      return;
    }
  }
  //console.log(urlToSearch);
  await interaction.deferReply();
  try {
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
          .setURL(
            "https://www.google.com/searchbyimage?image_url=" + urlToSearch
          )
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

    let currentResultPage = 0;
    let currentPage: any;
    let currentButtons: any = [pageButtons];
    let results = await sauceNao_Client(urlToSearch);

    currentPage = await interaction.editReply({
      embeds: [
        SauceNaoEmbedBuilder(
          results[currentResultPage],
          "Loading!!",
          urlToSearch,
          interaction.user.username,
          interaction.user.avatarURL()
        ),
      ],
      components: currentButtons,
    });

    const collector = await currentPage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 1800_000,
    }); // 30 minutes  1800_000

    collector.on("collect", async (i: any) => {
      switch (i.customId) {
        case "previous":
          if (currentResultPage <= 0) {
            currentResultPage = results.length - 1;
          } else {
            currentResultPage -= 1;
          }
          break;
        case "next":
          if (currentResultPage >= results.length - 1) {
            currentResultPage = 0;
          } else {
            currentResultPage += 1;
          }
          break;
        case "video":
          // TODO
          break;
        case "delete":
          await currentPage.delete();
          currentPage = undefined;
          break;
        case "links":
          currentButtons = linkButtons;
          break;
        case "back":
          currentButtons = [pageButtons];
          break;
        default:
          break;
      }
      if (!currentPage) {
        collector.stop();
        return;
      } // Ignore if message was deleted
      i.deferUpdate();
      // Save it's image to discord
      currentPage = await currentPage.edit({
        embeds: [
          SauceNaoEmbedBuilder(
            results[currentResultPage], // SauceNAO result list
            currentResultPage, // Page number
            urlToSearch, // Url of image that the user is searching
            interaction.user.username, // User name
            interaction.user.avatarURL() // User pfp
          ),
        ],
        components: currentButtons,
      }); // Buttons to add to the message
    });

    // Deactivate buttons if we are not reading them anymore
    collector.on("end", async () => {
      if (!currentPage) {
        return;
      }
      currentPage.edit({
        embeds: [
          SauceNaoEmbedBuilder(
            results[currentResultPage],
            currentResultPage,
            urlToSearch,
            interaction.user.username, // User name
            interaction.user.avatarURL() // User pfp
          ),
        ],
        components: deactivateButtons([pageButtons]),
      });

      function deactivateButtons(buttons: any) {
        buttons.forEach((buttonRow: any) => {
          buttonRow.components.forEach((button: any) => {
            button.setDisabled();
          });
        });
        return buttons;
      }
    });
  } catch (e: any) {
    console.log(e);
    if (e.name == "SagiriClientError") {
      return interaction.editReply(
        `Algo salió mal. . .\nError:  \`\`${e.message}\`\``
      );
    }
    return interaction.editReply(
      `Error con la solicitud.\n\`\`\`${e.message}\`\`\``
    );
  }
});
