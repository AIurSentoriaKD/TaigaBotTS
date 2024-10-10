import { EmbedBuilder, SlashCommandBuilder, TextChannel } from "discord.js";
import { command } from "../../utils";
import { Pagination } from "discordjs-button-embed-pagination";
import { getFilmList } from "./../../data/dbMethods";

const meta = new SlashCommandBuilder()
    .setName("top")
    .setDescription("Comando para ver una tabla de las pelis de mejor a peor");

interface ArrayDivProps {
    array: any[];
    size: number;
}
function divideArray({ array, size }: ArrayDivProps) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}
export default command(meta, async ({ interaction, client }) => {
    await interaction.deferReply();
    const results = await getFilmList(client);
    const dividedPrincipalArray = divideArray({
        array: results[0],
        size: 5,
    });

    const embedPages = [];
    let filmPos = 0;
    for (let i = 0; i < dividedPrincipalArray.length; i++) {
        const dataForPage = dividedPrincipalArray[i];
        const embedPage = new EmbedBuilder();
        embedPage.setTitle("Ranking de pelis según el Daphie");
        embedPage.setColor(0x0033ff);
        embedPage.setThumbnail(dataForPage[0].portada);
        embedPage.setFooter({
            text: `Peliculas: ${results[0].length} - Pagina ${i + 1}`,
        });
        dataForPage.map((film, index) => {
            filmPos++;
            embedPage.addFields({
                name: `${filmPos} - ${film.title}`,
                value: `${film.score.toFixed(2)}/10`,
            });
        });
        embedPages.push(embedPage);
    }
    // TODO Change dep of embedpagination
    await interaction.editReply({ content: "Cargado" });
    await interaction.deleteReply();

    return await new Pagination(
        interaction.channel as TextChannel,
        embedPages,
        "page",
        60000
    ).paginate();
});
