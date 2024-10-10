import {
    SlashCommandBuilder,
    EmbedBuilder,
    AttachmentBuilder,
} from "discord.js";
import { statSync } from "fs";

import { command, EmbedIllust } from "../../utils";
import { addArtistForScrap } from "../../data/dbMethods";
const meta = new SlashCommandBuilder()
    .setName("pixivf")
    .setDescription("comando metamorfico")
    .addIntegerOption((option) =>
        option.setName("id").setDescription("Id").setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("action")
            .setDescription("Action to perform")
            .setRequired(true)
    );

export default command(meta, async ({ interaction, client }) => {
    await interaction.deferReply();
    const artisttoscrap: any = interaction.options.get("id")?.value;
    const action: any = interaction.options.get("action")?.value;
    if (action === "addnewartist") {
        await addArtistForScrap(client, artisttoscrap);
    }
    return await interaction.editReply({ content: "Cargado" });
});
