import { SlashCommandBuilder } from "discord.js";
import { command } from "../../utils";
import { addNewFilm } from "./../../data/dbMethods";

const meta = new SlashCommandBuilder()
    .setName("addfilm")
    .setDescription("Comando para agregar una pelicula ")
    .addStringOption((option) =>
        option
            .setName("title")
            .setDescription("Título de la película")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("anio")
            .setDescription("Año de estreno")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("portada")
            .setDescription("Portada de la película")
            .setRequired(true)
    );

export default command(meta, async ({ interaction, client }) => {
    // if (interaction.user.id === "208678337646690307") {
    // agregar el nombre de la pelicula a la base de datos
    await interaction.deferReply();
    const tituloPelicula: string =
        interaction.options.get("title")?.value?.toString() ?? "";
    const anioEstreno: string =
        interaction.options.get("anio")?.value?.toString() ?? "";
    const portada: string =
        interaction.options.get("portada")?.value?.toString() ?? "";

    try {
        await addNewFilm(client, tituloPelicula, anioEstreno, portada);
        return await interaction.editReply({
            content: "Pelicula agregada",
        });
    } catch {
        return await interaction.editReply({
            content: "Error al agregar la pelicula",
        });
    }
});
