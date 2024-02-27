import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  MessageActionRowComponent,
  MessageActionRowComponentBuilder,
  SlashCommandBuilder,
} from "discord.js";

import { command, img2img, sd_samplers, txt2img } from "../../utils";
import { base64decode, base64encode } from "nodejs-base64";
import { writeFile } from "fs";
import name from "../search/name";

const meta = new SlashCommandBuilder()
  .setName("txttoimg")
  .setDescription("Stable Diffusion txt2img")
  .setNSFW(true)
  .addStringOption((option) =>
    option
      .setName("positiveprompt")
      .setDescription("lo que quieres que tenga la imagen")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("negativeprompt")
      .setDescription("lo que NO quieres que la imagen contenga")
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName("formato")
      .setDescription("define el formato de la imagen")
      .setRequired(false)
      .addChoices(
        { name: "Wide", value: "wide" },
        { name: "Tall", value: "tall" },
        { name: "Square", value: "square" }
      )
  )
  .addStringOption((option) =>
    option
      .setName("sampler") //esta wea nunca con mayus
      .setDescription(
        "Escoge el algoritmo de muestreo, diferente sampler produce resultados diferentes."
      )
      .setRequired(false)
      .addChoices(
        ...sd_samplers.map((sampler) => ({
          name: sampler.name,
          value: sampler.name,
        }))
      )
  )
  .addNumberOption((option) =>
    option
      .setName("steps")
      .setDescription("A más steps la imagen puede ser más refinada.")
      .setRequired(false)
      .setMaxValue(30)
      .setMinValue(15)
  )
  .addNumberOption((option) =>
    option
      .setName("cfg")
      .setDescription("Que tanta importancia darle al prompt.")
      .setRequired(false)
      .setMaxValue(15)
      .setMinValue(3)
  )
  .addStringOption((option) =>
    option
      .setName("preset")
      .setDescription(
        "Elige entre algunos ajustes predeterminados para mejorar el resultado de tu imagen."
      )
      .addChoices(
        { name: "Cute Anime", value: "anime" },
        { name: "Cool Anime", value: "cool_anime" },
        { name: "Detailed Anime", value: "detailed_anime" },
        { name: "Cute Furry", value: "furry" },
        { name: "Minimalistic Furry", value: "min_furry" },
        { name: "Detailed Furry", value: "detailed_furry" }
      )
      .setRequired(false)
  );

export default command(meta, async ({ interaction, client }) => {
  if (client.getSDStatus() == false) {
    client.setSDStatus(true);
    if (process.platform == "win32") {
      await interaction.deferReply();

      const positivePrompt = interaction.options.get("positiveprompt")?.value;
      const negativePrompt = interaction.options.get("negativeprompt")?.value;
      const formato = interaction.options.get("formato")?.value;
      const samplerName = interaction.options.get("sampler")?.value;
      const stepsNumber = interaction.options.get("steps")?.value;
      const cfgScale = interaction.options.get("cfg")?.value;
      const preset = interaction.options.get("preset")?.value;

      let width = 512;
      let height = 512;
      switch (formato) {
        case "wide":
          width = 800;
          height = 512;
          break;
        case "tall":
          width = 512;
          height = 800;
        case "square":
          break;
      }
      let fullPrompt;
      switch (preset) {
        case "anime":
          fullPrompt =
            "(masterpiece, best quality, high quality, highres, ultra-detailed), " +
            positivePrompt +
            ",<lora:add_detail:0.3>";
          break;
        case "cute_anime":
          fullPrompt = positivePrompt;
          break;
        case "detailed_anime":
          fullPrompt = positivePrompt;
          break;
        case "furry":
          fullPrompt =
            "(fluffy anthro furry,furry:1.2)," +
            positivePrompt +
            "BREAK (cute Anime artwork,white outline a1 pictures style),detailed background";
          break;
        case "min_furry":
          fullPrompt =
            "Beautiful mature female Avali,(fluffy anthro furry:1.3), " +
            positivePrompt +
            "<lora:add_detail:-0.3> (fur,((body fur))),(a1 pictures white outline:1.1), detailed,masterpiece,best quality,absurdres,(white outline:1.1),(simple background:1.2)";
          break;
        case "detailed_furry":
          fullPrompt =
            "((masterpiece)), (beautiful background), (detailed lighting), (anthro:1.2)," +
            positivePrompt +
            " <lora:fluffyrock-quality-tags-v4:1> <lora:add_detail:0.3> ";
          break;
        default:
          fullPrompt = positivePrompt;
          break;
      }
      let payload = {
        prompt: fullPrompt,
        negative_prompt:
          negativePrompt +
          "(worst quality:1.2,low quality:1.2),(feral) noise,extra legs,watermark,amputee,blurry,simple background,bad anatomy,bad framing,grainy,ugly,morbid,mutation,gross proportions,long neck,disgusting,meme,flat colors,jpeg,artifacts,double ears,chromatic aberration,lowres,extra limbs,deformed,black penis,anal,countershading,bad-hands-5",
        steps: stepsNumber ?? 22,
        width: width,
        height: height,
        save_images: true,
        sampler_name: samplerName ?? "Euler a",
        cfg_scale: cfgScale ?? 7,
      };

      let imageName;
      let imageBuffer;
      let imageDir;
      let imageMetadata;
      try {
        [imageName, imageBuffer, imageMetadata] = await txt2img(payload);
      } catch (error: any) {
        console.log(error);
        return await interaction.editReply({
          content: error,
        });
      }

      imageDir = `./outputs/${imageName}`;

      //const buffer = Buffer.from(data.images[0]);
      //const attach = new AttachmentBuilder(buffer, { name: "result.jpeg" });
      const imageEmbed = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle("SD Image")
        .setAuthor({
          name: interaction.user.displayName,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(`\`\`\`${positivePrompt}\`\`\``)
        .addFields({ name: "seed", value: imageMetadata.seed })
        .setTimestamp()
        .setImage(`attachment://${imageName}`)
        .setFooter({
          text: "Click en Refine si el resultado te agrada, click en remake para hacer otro ",
        });
      const imageAtt = new AttachmentBuilder(imageDir);

      const refine = new ButtonBuilder()
        .setCustomId("refine")
        .setLabel("Refine Image")
        .setStyle(ButtonStyle.Primary);
      const remake = new ButtonBuilder()
        .setCustomId("remake")
        .setLabel("Remake Image")
        .setStyle(ButtonStyle.Secondary);
      const row =
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
          refine,
          remake
        );
      const collectFilter = (interaction: any) =>
        interaction.user.id === interaction.user.id;

      const embeddedImage = await interaction.editReply({
        embeds: [imageEmbed],
        files: [imageAtt],
        components: [row],
      });

      try {
        const buttonClick = await embeddedImage.awaitMessageComponent({
          filter: collectFilter,
          time: 30_000,
        });
        if (buttonClick.customId === "refine") {
          const img2imgPayload = {
            prompt: fullPrompt,
            negative_prompt:
              negativePrompt +
              "(worst quality:1.2,low quality:1.2),(feral) noise,extra legs,watermark,amputee,blurry,simple background,bad anatomy,bad framing,grainy,ugly,morbid,mutation,gross proportions,long neck,disgusting,meme,flat colors,jpeg,artifacts,double ears,chromatic aberration,lowres,extra limbs,deformed,black penis,anal,countershading,bad-hands-5",
            steps: stepsNumber ?? 22,
            width: width,
            height: height,
            save_images: true,
            sampler_name: samplerName ?? "Euler a",
            cfg_scale: cfgScale ?? 7,
            denoising_strength: 0.6,
            enable_hr: true,
            hr_scale: 1.5,
            hr_second_pass_steps: 10,
            hr_upscaler: "4xUltrasharp_4xUltrasharpV10",
            seed: imageMetadata.seed,
          };
          await interaction.editReply({
            content: "Refinando Imagen. . .",
            embeds: [],
            components: [],
            files: [],
          });
          //await buttonClick.deferReply();
          let refinedImageName, refinedImageBuffer, refinedImageMetadata;
          try {
            [refinedImageName, refinedImageBuffer, refinedImageMetadata] =
              await txt2img(img2imgPayload);
          } catch (error: any) {
            console.log(error);
            return await interaction.editReply({
              content: error,
            });
          }
          console.log(refinedImageName);

          const refinedAttach = new AttachmentBuilder(
            `./outputs/${refinedImageName}`
          );
          const refinedEmbed = new EmbedBuilder()
            .setColor("DarkGreen")
            .setTitle("SD Refined Image")
            .setAuthor({
              name: interaction.user.displayName,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(`\`\`\`${positivePrompt}\`\`\``)
            .addFields({ name: "seed", value: imageMetadata.seed })
            .setTimestamp()
            .setImage(`attachment://${refinedImageName}`);

          await interaction.editReply({
            content: "",
            files: [refinedAttach],
            embeds: [refinedEmbed],
            components: [],
          });
        } else if (buttonClick.customId === "remake") {
          console.log("Remake image clicked");
          await buttonClick.update({
            content: `Remake click`,
            embeds: [],
            files: [],
            components: [],
          });
        }
      } catch (e) {
        await interaction.editReply({
          embeds: [imageEmbed],
          files: [imageAtt],
          components: [],
        });
      }
    } else {
      await interaction.reply({
        content: "El servicio no está disponible.",
        ephemeral: true,
      });
    }
    client.wait(1000);
    client.setSDStatus(false);
  } else {
    await interaction.reply({
      content:
        "Hay una ejecución pendiente o el comando esta en enfriamiento, espera unos momentos.",
      ephemeral: true,
    });
  }
});

// intento de modal
// const modal = new ModalBuilder().setCustomId("sdmodal").setTitle("SD Prompt");
// const positivePromptInput = new TextInputBuilder()
//   .setCustomId("sdmodal_positive")
//   .setLabel("Positive prompt")
//   .setPlaceholder("Lo que quieres que la imagen contenga")
//   .setStyle(TextInputStyle.Paragraph);
// const negativePromptInput = new TextInputBuilder()
//   .setCustomId("sdmodal_negative")
//   .setLabel("Negative prompt")
//   .setValue("(worst quality, low quality, normal quality), ")
//   .setPlaceholder("Cosas que no quieres que vaya en la imagen")
//   .setStyle(TextInputStyle.Paragraph);
// const stepsInput = new TextInputBuilder()
//   .setCustomId("sdmodal_steps")
//   .setValue("22")
//   .setStyle(TextInputStyle.Short)
//   .setRequired(false);

// const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
//   positivePromptInput
// );
// const secondActionRow =
//   new ActionRowBuilder<TextInputBuilder>().addComponents(negativePromptInput);
// const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
//   stepsInput
// );

// modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
// await interaction.showModal(modal);
