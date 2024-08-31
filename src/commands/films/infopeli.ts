import { SlashCommandBuilder, TextChannel } from "discord.js";
import { EmbedPelicula, command } from "../../utils";
import { Pagination } from "discordjs-button-embed-pagination";

const meta = new SlashCommandBuilder()
    .setName("infopeli")
    .setDescription("Comando para ver la info de una peli ")
    .addStringOption((option) =>
        option
            .setName("busqueda")
            .setDescription("escribe el nombre de la peli que quieres buscar")
            .setRequired(true)
    );

export default command(meta, async ({ interaction, client }) => {
    await interaction.deferReply();
    const busqueda: string =
        interaction.options.get("busqueda")?.value?.toString() ?? "";
    if (busqueda.length > 3) {
        const results = await client.mysql.query(
            `SELECT * FROM films where title like '%${busqueda}%'`,
            []
        );
        if (results[0].length > 0) {
            if (results[0].length > 1) {
                const embeds = results[0].map((result: any) =>
                    EmbedPelicula(result)
                );
                await interaction.editReply({ content: "Cargado" });
                await interaction.deleteReply();
                return await new Pagination(
                    interaction.channel as TextChannel,
                    embeds,
                    "page",
                    60000
                ).paginate();
            } else {
                const embed = EmbedPelicula(results[0][0]);
                return await interaction.reply({
                    embeds: [embed],
                });
            }
        } else {
            return await interaction.reply({
                content:
                    "No se ha encontrado la pelicula. Asegurate de que el nombre de la pelicula este bien escrito.",
                ephemeral: true,
            });
        }
    } else {
        return await interaction.reply({
            content: "Agrega mas letras a tu búsqueda mongolaso",
            ephemeral: true,
        });
    }
});
