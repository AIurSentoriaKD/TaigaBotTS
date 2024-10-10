import { NewIllust } from "../types/newIllust";
import { Taiga } from "@/types";

export const add_image = async (client: Taiga, newIllust: NewIllust) => {
    try {
        let original_image_url;
        if (newIllust.illust.page_count === 1) {
            original_image_url = newIllust.illust.original_image_url;
        } else {
            original_image_url =
                newIllust.illust.meta_pages[0].image_urls.original;
        }
        let query = `CALL newillust_author(?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        let params = [
            newIllust.illust.user.id,
            newIllust.illust.user.name,
            newIllust.illust.user.profile_image_urls.medium,
            newIllust.illust.id,
            "",
            newIllust.illust.title,
            newIllust.illust.total_bookmarks,
            newIllust.illust.type,
            newIllust.illust.image_urls.square_medium,
            newIllust.illust.image_urls.large,
            original_image_url,
            newIllust.illust_meta_thumb,
            newIllust.illust_meta_large,
        ];
        await client.mysql.query(query, params);
        console.log("Datos de imagen y autor, agregadas correctamente");
    } catch (e) {
        console.log("Error al insertar imagen: " + e);
        return;
    }
};
export const addNewFilm = async (
    taiga: Taiga,
    tituloPelicula: string,
    anioEstreno: string,
    portada: string
) => {
    const added = await taiga.mysql.query("call add_film(?,?,?)", [
        tituloPelicula,
        anioEstreno,
        portada,
    ]);
    console.log("Pelicula agregada");
    return added;
};
export const getFilmByName = async (taiga: Taiga, busqueda: string) => {
    const results = await taiga.mysql.query(
        `SELECT * FROM films where title like '%${busqueda}%'`,
        []
    );
    return results[0];
};
export const filmHasUserScore = async (
    taiga: Taiga,
    user_id: any,
    id_peli: number
) => {
    return await taiga.mysql.query(
        "select * from user_filmscore where user_id = ? and id_peli = ?",
        [user_id, id_peli]
    );
};
export const addFilmScore = async (
    taiga: Taiga,
    user_id: any,
    id_peli: number,
    score: number,
    action: string
) => {
    if (action === "ADD") {
        await taiga.mysql.query(
            "insert into user_filmscore (user_id, id_peli, score) values (?, ?, ?)",
            [user_id, id_peli, score]
        );
    } else if (action === "UPDATE") {
        await taiga.mysql.query(
            "update user_filmscore set score = ? where user_id = ? and id_peli = ?",
            [score, user_id, id_peli]
        );
    }
};
export const getFilmList = async (taiga: Taiga) => {
    return await taiga.mysql.execute(
        "SELECT * FROM films where score is not null order by score desc",
        []
    );
};
export const getArtistLatestSubmissions = async (
    taiga: Taiga,
    artistID: number
) => {};
export const addArtistForScrap = async (taiga: Taiga, artistID: number) => {
    console.log("obteniendo de id");
    const latestPostID = await taiga.pixiv.user.illusts({ user_id: artistID });
    const illusts = latestPostID.map((illust: any) => {
        return new NewIllust(illust, "", "");
    });
    // console.log(illusts[0]);

    await taiga.mysql.query(
        `insert into artists_to_scrap(?,?) values(${artistID}, ${illusts[0].illust.id})`
    );
};
