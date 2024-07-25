import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import { command, genresES, genresEN } from "../../utils";

const meta = new SlashCommandBuilder()
    .setName("tmdb")
    .setDescription(
        "Comando ver metadatos de una pelicula/serie basados en TMDB (The Movie DataBase)."
    )
    .addStringOption((option) =>
        option
            .setName("title")
            .setDescription("Título de la película")
            .setRequired(true)
    );

export default command(meta, async ({ interaction, client }) => {
    await interaction.deferReply();
    const tituloPelicula: any = interaction.options
        .get("title")
        ?.value?.toString();
    let tmdbData: any;
    let genreNames: any;
    try {
        tmdbData = await client.tmdb.search.movies({
            query: tituloPelicula,
            language: "es-PE",
        });

        //const tmdbDataGenres = await client.tmdb.genres.movies();

        // console.log(tmdbData.results[0]);

        // console.log(tmdbData.results[0].genre_ids);

        // console.log(tmdbDataGenres);

        genreNames = genresES
            .filter((genre) => tmdbData.results[0].genre_ids.includes(genre.id))
            .map((genre) => genre.name + " " + genre.emoji);

        console.log(genreNames);
    } catch (err) {
        console.log(err);
        return await interaction.editReply({
            content:
                "Ocurrió un error con la pelicula, ¿tal vez comprobar el nombre ayude?",
        });
    }

    const embedFilm = new EmbedBuilder()
        .setColor(0x0033ff)
        .setAuthor({ name: "TMDB" })
        .setThumbnail(
            "https://cdn.discordapp.com/attachments/285514257980981259/1266087142698778664/XXqfqs9irPSjphsMPcC-c6Q4-FY5cd8klw4IdI2lof_Ie-yXaFirqbNDzK2kJ808WXJk.png?ex=66a3df09&is=66a28d89&hm=b1511042dec95ce466cb33cf58a4b9d28ca957f0893238341b0e49d280551c5e&"
        )
        .setTitle(tmdbData.results[0].title)
        .addFields({
            name: "Año",
            value: tmdbData.results[0].release_date,
            inline: true,
        })
        .addFields({
            name: "Popularidad",
            value: `${tmdbData.results[0].popularity}`,
            inline: true,
        })
        .addFields({
            name: "Descripción",
            value: `${tmdbData.results[0].overview}`,
        })
        .addFields({
            name: "Votos",
            value: `${tmdbData.results[0].vote_count}`,
            inline: true,
        })
        .addFields({
            name: "Votos promedio",
            value: `${tmdbData.results[0].vote_average}`,
            inline: true,
        })
        .addFields({
            name: "Idioma",
            value: `${tmdbData.results[0].original_language}`,
            inline: true,
        })
        .addFields({
            name: "Genero",
            value: `${genreNames.map((genre: any) => genre).join(" - ")}`,
        })
        .setImage(
            `https://image.tmdb.org/t/p/w600_and_h900_bestv2/${tmdbData.results[0].poster_path}`
        )
        .setAuthor({ name: "TMDB" })
        .setTimestamp();

    const addToDB = new ButtonBuilder()
        .setCustomId("save")
        .setLabel("Guardar  con Taiga")
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(addToDB);

    await interaction.editReply({
        embeds: [embedFilm],
        components: [row],
    });

    const embeddedFilmResponse = await interaction.fetchReply();

    const collectorFilter = (i: { user: { id: string } }) =>
        i.user.id === interaction.user.id;
    try {
        const confirmation = await embeddedFilmResponse.awaitMessageComponent({
            filter: collectorFilter,
            time: 60_000,
        });
        if (confirmation.customId === "save") {
            embedFilm.setColor(0x96ff69);
            embedFilm.setFooter({ text: "Guardada con Taiga!" });
            await confirmation.update({
                embeds: [embedFilm],
                components: [],
            });
            await client.mysql.query(
                "insert into films (title, anio_estreno, portada) values (?,?,?)",
                [
                    tmdbData.results[0].title,
                    tmdbData.results[0].release_date.split("-")[0],
                    `https://image.tmdb.org/t/p/w600_and_h900_bestv2/${tmdbData.results[0].poster_path}`,
                ]
            );
            console.log("Pelicula agregada");
            return;
        }
    } catch (e) {
        await interaction.followUp({
            content: "Confirmation not received within 1 minute, cancelling",
            components: [],
            ephemeral: true,
        });
    }
});
