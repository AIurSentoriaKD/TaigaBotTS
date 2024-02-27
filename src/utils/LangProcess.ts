import { WordTokenizer } from "natural";
import { createPaginationButtons } from "./sauce";
import sagiri from "sagiri";
import keys from "../keys";
import { SauceNaoEmbedBuilder } from "./illustEmbedBuilder";
import { ComponentType } from "discord.js";

export function wordExtract(message: string) {
  let tokenizer = new WordTokenizer();
  //TODO
  return tokenizer.tokenize(message);
}
export async function callTaigaCommandName(
  client: any,
  urlToSearch: string,
  message: any
) {
  // comando name pero en forma de chat
  if (!client.openai_enabled)
    return await message.reply(
      "Taiga no está disponible por el momento. Intenta usar el comando `/name`"
    );
  if (client.getIsInExecution()) {
    console.log("Repuesta pendiente anterior. . .");
    return;
  }
  client.setIsInExecution(true);
  try {
    const sauceNao_Client = sagiri(keys.saucenaoToken);
    const [linkButtons, pageButtons] = createPaginationButtons(urlToSearch);

    let currentResultPage = 0;
    let currentPage: any;
    let currentButtons: any = [pageButtons];
    let results = await sauceNao_Client(urlToSearch);

    currentPage = await message.reply({
      embeds: [
        SauceNaoEmbedBuilder(
          results[currentResultPage],
          "Loading!!",
          urlToSearch,
          message.user.username,
          message.user.avatarURL()
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
            message.user.username, // User name
            message.user.avatarURL() // User pfp
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
            message.user.username, // User name
            message.user.avatarURL() // User pfp
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

    await client.wait(3000);

    client.setIsInExecution(false);
  } catch (error) {
    console.log("Error recibiendo respuesta GPT. . . in langprocess");
    console.log(error);
    client.setIsInExecution(false);
  }
}
export async function callTaigaChatResponse(
  client: any,
  message: any,
  textoMensaje: string
) {
  // if (!client.openai_enabled)
  //   return await message.reply("Taiga no está disponible por el momento.");
  if (client.getIsInExecution()) {
    console.log("Repuesta pendiente anterior. . .");
    return;
  }
  client.setIsInExecution(true);
  try {
    await message.channel.sendTyping();
    const msgAuthor = message.author.username;

    client.conversationPush(msgAuthor + ": " + textoMensaje, "user");

    const result = await client.conversationReply();
    let responseTaiga = result.data.choices[0].message;
    console.log(result.data.choices);
    await message.reply(responseTaiga.content.split(": ")[1]);

    client.conversationPush(responseTaiga.content, "assistant");

    await client.wait(5000);

    client.setIsInExecution(false);
  } catch (error) {
    console.log("Error recibiendo respuesta GPT. . . incallresponse");
    console.log(error);
    client.setIsInExecution(false);
  }
}
