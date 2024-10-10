import { SlashCommandBuilder, TextChannel } from "discord.js";
import { EmbedPelicula, command } from "../../utils";
import { Pagination } from "discordjs-button-embed-pagination";
import { getFilmByName } from "./../../data/dbMethods";

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
    // if (busqueda.length > 3) {
    let results: any;
    try {
        results = await getFilmByName(client, busqueda);
        console.log(results);
    } catch (err) {
        console.log(err);
        return await interaction.editReply({
            content: "Error con la búsqueda.",
        });
    }
    if (results.length > 0) {
        if (results.length > 1) {
            const embeds = results.map((result: any) => EmbedPelicula(result));
            await interaction.editReply({ content: "Cargado" });
            await interaction.deleteReply();
            return await new Pagination(
                interaction.channel as TextChannel,
                embeds,
                "page",
                60000
            ).paginate();
        } else {
            const embed = EmbedPelicula(results[0]);
            return await interaction.editReply({
                embeds: [embed],
            });
        }
    } else {
        return await interaction.editReply({
            content:
                "No se ha encontrado la pelicula. Asegurate de que el nombre de la pelicula este bien escrito.",
        });
    }
    // } else {
    //     return await interaction.editReply({
    //         content: "Agrega mas letras a tu búsqueda mongolaso",
    //     });
    // }
});
