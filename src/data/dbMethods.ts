import { Illust } from "pixiv.ts";
import { NewIllust } from "../types/newIllust";

export async function add_image(newIllust: NewIllust) {
  try {
    let original_image_url;
    if (newIllust.illust.page_count === 1) {
      original_image_url = newIllust.illust.original_image_url;
    } else {
      original_image_url = newIllust.illust.meta_pages[0].image_urls.original;
    }
    let query = `CALL newillust_author(?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    let params = [
      newIllust.illust.user.id,
      newIllust.illust.user.name,
      newIllust.illust.user.profile_image_urls.medium,
      newIllust.illust.id,
      newIllust.related,
      newIllust.illust.title,
      newIllust.illust.total_bookmarks,
      newIllust.illust.type,
      newIllust.illust.image_urls.square_medium,
      newIllust.illust.image_urls.large,
      original_image_url,
      newIllust.illust_meta_thumb,
      newIllust.illust_meta_large,
    ];
    await newIllust.client.mysql.query(query, params);
    console.log("Datos de imagen y autor, agregadas correctamente");
  } catch (e) {
    console.log("Error al insertar imagen: " + e)
    // TODO CHANGE TO LOGGER CLASS
    return
  }
}
