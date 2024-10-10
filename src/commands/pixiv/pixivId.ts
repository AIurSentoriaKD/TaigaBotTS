import {
    SlashCommandBuilder,
    EmbedBuilder,
    AttachmentBuilder,
} from "discord.js";
import { statSync } from "fs";

import { command, EmbedIllust } from "../../utils";
import { addArtistForScrap } from "../../data/dbMethods";
const meta = new SlashCommandBuilder()
    .setName("pixivid")
    .setDescription("Seach pixiv image by ID")
    .addIntegerOption((option) =>
        option.setName("id").setDescription("Id to search").setRequired(true)
    );

export default command(meta, async ({ interaction, client }) => {
    await interaction.deferReply();
    const message = interaction.options.get("id")?.value;
    const illust: any = await client.pixiv.illust.get(
        `https://www.pixiv.net/en/artworks/${message}`
    );
    await client.pixiv.util.downloadIllust(
        `https://www.pixiv.net/en/artworks/${message}`,
        "./illust",
        "large"
    );

    let imageDir = `./illust/${illust.id}_p0.png`;

    if (illust.page_count == 1) {
        imageDir = `./illust/${illust.id}.png`;
    }
    const imageFile = statSync(imageDir);

    let embed: EmbedBuilder;
    let file: AttachmentBuilder;

    if (imageFile.size / (1024 * 1024) > 8) {
        //Subir a imgur
        return await interaction.editReply({ content: "Imagen pesada" });
        //embed = EmbedIllust(illust, interaction.user.defaultAvatarURL,);
    } else {
        embed = EmbedIllust(illust, interaction.user.displayAvatarURL());
        if (illust.page_count == 1) {
            imageDir = `./illust/${illust.id}.png`;
            embed.setImage(`attachment://${illust.id}.png`);
        } else {
            imageDir = `./illust/${illust.id}_p0.png`;
            embed.setImage(`attachment://${illust.id}_p0.png`);
        }
        file = new AttachmentBuilder(imageDir);

        return await interaction.editReply({
            embeds: [embed],
            files: [file],
        });
    }
});
