import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import { command, genresES, genresEN, EditReply } from "../../utils";
function buildEmbedFilms(tmdbData: any, genreNames: any) {
    return tmdbData.results.map((result: any) => {
        let shortdescription =
            result.overview.length > 50
                ? result.overview.slice(0, 50) + "..."
                : result.overview;
        return new EmbedBuilder()
            .setColor(0x0033ff)
            .setAuthor({ name: "TMDB" })
            .setThumbnail(
                "https://cdn.discordapp.com/attachments/285514257980981259/1266087142698778664/XXqfqs9irPSjphsMPcC-c6Q4-FY5cd8klw4IdI2lof_Ie-yXaFirqbNDzK2kJ808WXJk.png"
            )
            .setTitle(result.title)
            .addFields({
                name: "Año",
                value: result.release_date,
                inline: true,
            })
            .addFields({
                name: "Popularidad",
                value: `${result.popularity}`,
                inline: true,
            })
            .addFields({
                name: "Descripción",
                value: `${shortdescription}`,
            })
            .addFields({
                name: "Votos",
                value: `${result.vote_count}`,
                inline: true,
            })
            .addFields({
                name: "Votos promedio",
                value: `${result.vote_average}`,
                inline: true,
            })
            .addFields({
                name: "Idioma",
                value: `${result.original_language}`,
                inline: true,
            })
            .addFields({
                name: "Genero",
                value: `${genreNames.map((genre: any) => genre).join(" - ")}`,
            })
            .setImage(
                `https://image.tmdb.org/t/p/w600_and_h900_bestv2/${result.poster_path}`
            )
            .setAuthor({ name: "TMDB" })
            .setTimestamp();
    });
}
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

        console.log(
            "con la búsqueda hay: ",
            tmdbData.results.length,
            " peliculas se reducirá a 10"
        );
        if (tmdbData.results.length >= 11) {
            // split results to fit only 10
            tmdbData.results = tmdbData.results.slice(0, 10);
        }

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
    let embedFilms: any;
    try {
        embedFilms = buildEmbedFilms(tmdbData, genreNames);
    } catch (err) {
        console.log("Error con embedfilms");
        console.log(err);
        console.log("reduciendo array aún más");
        tmdbData.results = tmdbData.results.slice(0, 5);
        embedFilms = buildEmbedFilms(tmdbData, genreNames);
        // return await interaction.editReply({
        //     content: `Error al construir el embed film \`\`\`${err} \`\`\``,
        // });
    }
    console.log("Embed films construido");
    // const embedFilm = new EmbedBuilder()
    //     .setColor(0x0033ff)
    //     .setAuthor({ name: "TMDB" })
    //     .setThumbnail(
    //         "https://cdn.discordapp.com/attachments/285514257980981259/1266087142698778664/XXqfqs9irPSjphsMPcC-c6Q4-FY5cd8klw4IdI2lof_Ie-yXaFirqbNDzK2kJ808WXJk.png?ex=66a3df09&is=66a28d89&hm=b1511042dec95ce466cb33cf58a4b9d28ca957f0893238341b0e49d280551c5e&"
    //     )
    //     .setTitle(tmdbData.results[0].title)
    //     .addFields({
    //         name: "Año",
    //         value: tmdbData.results[0].release_date,
    //         inline: true,
    //     })
    //     .addFields({
    //         name: "Popularidad",
    //         value: `${tmdbData.results[0].popularity}`,
    //         inline: true,
    //     })
    //     .addFields({
    //         name: "Descripción",
    //         value: `${tmdbData.results[0].overview}`,
    //     })
    //     .addFields({
    //         name: "Votos",
    //         value: `${tmdbData.results[0].vote_count}`,
    //         inline: true,
    //     })
    //     .addFields({
    //         name: "Votos promedio",
    //         value: `${tmdbData.results[0].vote_average}`,
    //         inline: true,
    //     })
    //     .addFields({
    //         name: "Idioma",
    //         value: `${tmdbData.results[0].original_language}`,
    //         inline: true,
    //     })
    //     .addFields({
    //         name: "Genero",
    //         value: `${genreNames.map((genre: any) => genre).join(" - ")}`,
    //     })
    //     .setImage(
    //         `https://image.tmdb.org/t/p/w600_and_h900_bestv2/${tmdbData.results[0].poster_path}`
    //     )
    //     .setAuthor({ name: "TMDB" })
    //     .setTimestamp();

    const addToDB = new ButtonBuilder()
        .setCustomId("save")
        .setLabel("Guardar  con Taiga")
        .setStyle(ButtonStyle.Primary);
    const nextButton = new ButtonBuilder()
        .setCustomId("next")
        .setLabel("➡")
        .setStyle(ButtonStyle.Primary);
    const prevButton = new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("⬅")
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        prevButton,
        addToDB,
        nextButton
    );
    console.log("Row construido");
    let selectedFilmIndex = 0;
    try {
        await interaction.editReply({
            embeds: [embedFilms[selectedFilmIndex]],
            components: [row],
        });

        const embeddedFilmResponse = await interaction.fetchReply();
        const collector =
            await embeddedFilmResponse.createMessageComponentCollector({
                componentType: ComponentType.Button,
            });

        // const collectorFilter = (i: { user: { id: string } }) =>
        //     i.user.id === interaction.user.id;

        collector.on("collect", async (i) => {
            if (i.user.id === interaction.user.id) {
                await i.deferUpdate();
                if (i.customId === "prev") {
                    if (selectedFilmIndex > 0)
                        selectedFilmIndex = selectedFilmIndex - 1;
                } else if (i.customId === "next") {
                    if (selectedFilmIndex < embedFilms.length - 1)
                        selectedFilmIndex = selectedFilmIndex + 1;
                } else if (i.customId === "save") {
                    embedFilms[selectedFilmIndex].setColor(0x96ff69);
                    embedFilms[selectedFilmIndex].setFooter({
                        text: "Guardada con Taiga!",
                    });
                    await interaction.editReply({
                        embeds: [embedFilms[selectedFilmIndex]],
                        components: [],
                    });
                    await client.mysql.query(
                        "insert into films (title, anio_estreno, portada) values (?,?,?)",
                        [
                            tmdbData.results[selectedFilmIndex].title,
                            tmdbData.results[
                                selectedFilmIndex
                            ].release_date.split("-")[0],
                            `https://image.tmdb.org/t/p/w600_and_h900_bestv2/${tmdbData.results[selectedFilmIndex].poster_path}`,
                        ]
                    );
                    console.log("Pelicula agregada");
                    return;
                }

                if (selectedFilmIndex === 0) {
                    nextButton.setDisabled(false);
                    prevButton.setDisabled(true);
                } else {
                    nextButton.setDisabled(false);
                    prevButton.setDisabled(false);
                }

                if (selectedFilmIndex === embedFilms.length - 1) {
                    prevButton.setDisabled(false);
                    nextButton.setDisabled(true);
                } else {
                    prevButton.setDisabled(false);
                    nextButton.setDisabled(false);
                }

                await interaction.editReply({
                    embeds: [embedFilms[selectedFilmIndex]],
                    components: [row],
                });
                collector.resetTimer();
            }
        });
        collector.on("end", async () => {
            await interaction
                .editReply({
                    embeds: [embedFilms[selectedFilmIndex]],
                    components: [],
                })
                .catch((err) => {
                    console.log(err);
                });
        });
    } catch (err) {
        console.log(err);
        await interaction.editReply({
            content: "Error al buscar, ver consola",
        });
    }
    // try {
    //     const confirmation = await embeddedFilmResponse.awaitMessageComponent({
    //         filter: collectorFilter,
    //         time: 60_000,
    //     });
    //     if (confirmation.customId === "save") {
    //         embedFilm.setColor(0x96ff69);
    //         embedFilm.setFooter({ text: "Guardada con Taiga!" });
    //         await confirmation.update({
    //             embeds: [embedFilm],
    //             components: [],
    //         });
    //         await client.mysql.query(
    //             "insert into films (title, anio_estreno, portada) values (?,?,?)",
    //             [
    //                 tmdbData.results[0].title,
    //                 tmdbData.results[0].release_date.split("-")[0],
    //                 `https://image.tmdb.org/t/p/w600_and_h900_bestv2/${tmdbData.results[0].poster_path}`,
    //             ]
    //         );
    //         console.log("Pelicula agregada");
    //         return;
    //     }
    // } catch (e) {
    //     await interaction.followUp({
    //         content: "Confirmation not received within 1 minute, cancelling",
    //         components: [],
    //         ephemeral: true,
    //     });
    // }
});
