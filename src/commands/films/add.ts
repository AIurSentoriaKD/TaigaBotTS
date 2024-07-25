import { SlashCommandBuilder } from "discord.js";
import { command } from "../../utils";

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
    const tituloPelicula: string =
        interaction.options.get("title")?.value?.toString() ?? "";
    const anioEstreno: string =
        interaction.options.get("anio")?.value?.toString() ?? "";
    const portada: string =
        interaction.options.get("portada")?.value?.toString() ?? "";
    await client.mysql.query(
        "insert into films (title, anio_estreno, portada) values (?,?,?)",
        [tituloPelicula, anioEstreno, portada]
    );
    console.log("Pelicula agregada");
    return await interaction.reply({
        content: "Pelicula agregada",
    });
    // } else {
    //   return await interaction.reply({
    //     content: "No tienes permiso para usar este comando",
    //     ephemeral: true,
    //   });
    // }
});
