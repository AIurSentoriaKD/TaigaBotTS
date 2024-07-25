import { SlashCommandBuilder } from "discord.js";
import { command } from "../../utils";

const meta = new SlashCommandBuilder()
    .setName("rankear")
    .setDescription("Comando para agregar la calificación de un usuario")
    .addStringOption((option) => {
        return option
            .setName("idpeli")
            .setDescription("El id de la película")
            .setRequired(true);
    })
    .addStringOption((option) => {
        return option
            .setName("puntaje")
            .setDescription("asigna tu puntaje")
            .setRequired(true);
    });
export default command(meta, async ({ interaction, client }) => {
    try {
        const idPeli: string =
            interaction.options.get("idpeli")?.value?.toString() ?? "";
        const puntaje: string =
            interaction.options.get("puntaje")?.value?.toString() ?? "";
        if (!Number.isInteger(Number(puntaje))) {
            return await interaction.reply({
                content: "El puntaje debe ser un número entero.",
                ephemeral: true,
            });
        }
        if (isNaN(parseInt(puntaje)))
            return await interaction.reply({
                content: "El puntaje debe ser un número",
                ephemeral: true,
            });
        if (parseInt(puntaje) > 10 || parseInt(puntaje) < 1)
            return await interaction.reply({
                content: "El puntaje debe estar entre 1 y 10",
                ephemeral: true,
            });
        if (isNaN(parseInt(idPeli)))
            return await interaction.reply({
                content: "El id de la película debe ser un número",
                ephemeral: true,
            });
        // comprobar si ya existe
        const existe = await client.mysql.query(
            "select * from user_filmscore where user_id = ? and id_peli = ?",
            [interaction.user.id, parseInt(idPeli)]
        );
        if (existe[0].length > 0) {
            // actualizar score anterior
            await client.mysql.query(
                "update user_filmscore set score = ? where user_id = ? and id_peli = ?",
                [parseInt(puntaje), interaction.user.id, parseInt(idPeli)]
            );
            return await interaction.reply({
                content:
                    "Ya existe una calificación para esta película. Se actualizó tu calificación anterior.",
                ephemeral: true,
            });
        }
        // insertar
        await client.mysql.query(
            "insert into user_filmscore (user_id, id_peli, score) values (?, ?, ?)",
            [interaction.user.id, parseInt(idPeli), parseInt(puntaje)]
        );
        return await interaction.reply({
            content: "Calificación agregada",
        });
    } catch (error: any) {
        console.log(error);
        // const userID = interaction.user.id;
        // const username = interaction.user.username;
        // const newUserQuery =
        //     "insert into discord_users (user_id, username) values (?, ?)";
        // await client.mysql.query(newUserQuery, [userID, username]);
        // console.log("Nuevo usuario creado.");
        // return await interaction.reply({
        //     content: `Error al agregar la calificación. \n\`\`\`${error.message}\`\`\` \nSi es la primera vez que usas el bot, este error ya no saldrá. Intentalo de nuevo.`,
        //     ephemeral: false,
        // });
    }
});
