import { EmbedBuilder, AttachmentBuilder, Embed } from "discord.js";
import { PixivIllust } from "pixiv.ts";
import https from "https";
import http from "http";
function convertToStars(rating: any) {
  // Verificar que el rating está dentro del rango 1-10
  if (rating < 1 || rating > 10) {
    throw new Error("El rating debe estar entre 1 y 10.");
  }

  // Escalar el rating de 1-10 a 1-5
  const scaledRating = (rating / 10) * 5;

  // Redondear al número entero más cercano
  const roundedRating = Math.round(scaledRating);

  // Crear una cadena de estrellas
  const stars = "⭐".repeat(roundedRating);

  return stars;
}
export function EmbedPelicula(infoPeli: any): EmbedBuilder {
  const embed = new EmbedBuilder();
  embed.setTitle(infoPeli.title);
  embed.addFields({ name: "ID", value: `${infoPeli.id_peli}` });
  embed.addFields({
    name: "Puntaje",
    value: `${infoPeli.score ? infoPeli.score:"-"}/10`,
  });
  embed.addFields({
    name: "Año de Estreno",
    value: `${infoPeli.anio_estreno}`,
  });
  try {
    embed.addFields({
      name: "Estrellas",
      value: `${convertToStars(infoPeli.score)}`,
    });
  } catch (err) {
    embed.addFields({
      name: "Estrellas",
      value: `Sin calificaciones`,
    });
  }
  embed.setColor(0x0099ff);
  embed.setImage(infoPeli.portada);
  return embed;
}
export function EmbedIllust(illust: any, userImg: string): EmbedBuilder {
  const tags = illust.tags.map((tag: any) => {
    if (tag.translated_name)
      return `🏷️: ${tag.name}, 🌐: ${tag.translated_name}`;
    else return `🏷️: ${tag.name}`;
  });
  const embed = new EmbedBuilder();

  embed.setTitle(`${illust.title}`);
  embed.setURL(`${illust.url}`);
  embed.setColor(illust.tags[0].name == "R-18" ? 0xa018f5 : 0x0099ff);
  embed.setAuthor({
    name: `${illust.user.name}`,
    iconURL: `https://media.discordapp.net/attachments/829406711914954802/1073363547670720522/pixiv.png`,
    url: `https://www.pixiv.net/en/users/${illust.user.id}`,
  });
  embed.setTimestamp(new Date(illust.create_date));
  embed.setDescription(
    `${illust.type} ${illust["illust_ai_type"] == 2 ? `| AI Generated` : ``} ${
      illust.page_count == 1 ? `| 1 Page` : `| ${illust.page_count} Pages`
    }`
  );
  embed.addFields(
    {
      name: "Views-Likes",
      value: ` \`\`\`👁️ ${illust.total_view} - ❤️ ${illust.total_bookmarks}\`\`\``,
    },
    {
      name: `Etiquetas`,
      value: `\`\`\`${tags.join(" \n")}\`\`\``,
    }
  );
  embed.setFooter({ text: `${illust.id}`, iconURL: `${userImg}` });
  return embed;
}

export function EmbedIllustDB() {}

export function SauceNaoEmbedBuilder(
  sauceNAO_element: any,
  pageNumber: any,
  searched_image: string,
  author_name: string,
  author_image: any
) {
  // Regex that extracts the "Danbooru" in "Index #9:Danbooru"
  const getIndexName = /^[I,i]ndex #\d*:[ ]*(.*)/;
  const getURLDomain = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/;
  const result_data = sauceNAO_element.raw.data;
  const emb_similarity = sauceNAO_element.similarity;
  const fieldDataList = [];
  let emb_preview,
    emb_index_saucenao,
    emb_link,
    emb_artist,
    emb_name,
    emb_episode,
    statusCode,
    emb_character,
    emb_company,
    emb_game,
    emb_color,
    emb_embbed_tittle,
    emb_footer;

  if ("in_discord" in result_data) {
    emb_preview = sauceNAO_element.raw.discord_image;
  } else if ("thumbnail" in sauceNAO_element) {
    emb_preview = sauceNAO_element.thumbnail;
  }
  if (emb_similarity > 50) {
    emb_index_saucenao = sauceNAO_element.raw.header.index_name.split("-")[0];
    // Test if URL is still working
    statusCode = getUrlStatusCode(result_data.ext_urls[0]);
    if (statusCode != 404) {
      emb_link = result_data.ext_urls[0];
    }
    // Check Pixiv
    if ("pixiv_id" in result_data) {
      emb_artist = result_data.member_name;
    }
    // Check Nijie
    else if ("nijie_id" in result_data) {
      emb_name = result_data.title;
      emb_artist = result_data.member_name;
    }
    // Check for other sources
    else if ("source" in result_data) {
      if ("part" in result_data) {
        emb_name = result_data.source;
        emb_episode = result_data.part;
      } else if (result_data.source.search("twitter.com") != -1) {
        emb_artist = result_data.creator;
      }
      if ("material" in result_data) {
        emb_name = result_data.material;
      }
      if ("source" in result_data) {
        emb_link = result_data.source;
      }
      // else {
      //     emb_link = '**Link del Twitt original caído**';
      // }
    }
    // Check for Sankaku/Gelbooru/Konachan
    else if (
      "sankaku_id" in result_data ||
      "gelbooru_id" in result_data ||
      "konachan_id" in result_data
    ) {
      if ("creator" in result_data) {
        if (!result_data.creator) {
          if (result_data.material) {
            emb_name = result_data.material.split(",")[0];
          }
        }
      }
      if (result_data.characters) {
        emb_character = result_data.characters;
      }
      if ("material" in result_data) {
        if (result_data.material == "original") {
          if ("characters" in result_data) {
            if (result_data.characters) {
              emb_character = result_data.characters;
            }
          }
        } else if (result_data.material) {
          emb_name = result_data.material;
        }
      }
      if (result_data.creator) {
        emb_artist = result_data.creator;
      }
    }
    if ("getchu_id" in result_data) {
      emb_company = result_data.company;
      emb_game = result_data.title;
    }

    // Fill unfilled data
    if (!emb_name) {
      try {
        if ("title_english" in result_data) {
          emb_name = result_data["title_english"];
        } else {
          emb_name = result_data["title"];
        }
      } catch (e) {
        // ignore error
      }
    }
    if (!emb_artist) {
      try {
        if (result_data.creator instanceof Array) {
          for (const artist of result_data.creator) {
            emb_artist += artist + ", ";
          }
          emb_artist = emb_artist.slice(0, -2);
        } else {
          emb_artist = result_data["creator"];
        }
      } catch (e) {
        // Ignore error
      }
    }

    if (!emb_character) {
      try {
        emb_character = result_data["characters"];
      } catch (e) {
        // Ignore error
      }
    }
    if (!emb_link) {
      try {
        if ("mal_id" in result_data) {
          emb_link = "https://myanimelist.net/anime/" + result_data["mal_id"];
        } else if (result_data.ext_urls instanceof Array) {
          emb_link = result_data.ext_urls[0];
        } else {
          emb_link = result_data.ext_urls;
        }
      } catch (e) {
        // Ignore error
      }
    }

    if (!emb_link) {
      try {
        if (result_data.ext_urls instanceof Array) {
          emb_link = result_data.ext_urls[0];
        } else {
          emb_link = result_data.ext_urls;
        }
      } catch (e) {
        // Ignore error
      }
    }
    if (!emb_name) {
      try {
        emb_name = result_data.eng_name;
      } catch (e) {
        // Ignore error
      }
    }

    if (!emb_episode && "episode" in result_data) {
      emb_episode = result_data.episode;
    }
  }
  if (emb_similarity > 89) {
    emb_color = 1425173; // A nice green
    emb_embbed_tittle = "Nombre encontrado!";
  } else if (emb_similarity > 65) {
    emb_color = 16776960; // An insecure yellow
    emb_embbed_tittle = "Nombre quizás encontrado!";
  } else {
    emb_color = 15597568; // A worrying red
    emb_embbed_tittle = "Nombre probablemente no encontrado (┬┬﹏┬┬)";
  }

  emb_footer =
    "Porcentaje de seguridad: " +
    emb_similarity +
    "% | Page " +
    (pageNumber + 1);

  // We should already have all the data at this point, so we create the message
  if (emb_name || emb_artist || emb_link) {
    //emb_description = '';
    if (emb_name) {
      // emb_description += '**Nombre: ** ' + emb_name + '\n';
      fieldDataList.push({
        name: "Nombre:",
        value: emb_name,
        inline: false,
      });
    }
    if (emb_episode) {
      // emb_description += '**Episodio: ** ' + emb_episode + '\n';
      fieldDataList.push({
        name: "Episodio:",
        value: emb_episode,
        inline: true,
      });
    }
    if (emb_character) {
      // emb_description += '**Personaje: ** ' + emb_character + '\n';
      fieldDataList.push({
        name: "Personaje:",
        value: emb_character,
        inline: false,
      });
    }
    if (emb_artist) {
      // emb_description += '**Artista: ** ' + emb_artist + '\n';
      fieldDataList.push({
        name: "Artista:",
        value: emb_artist,
        inline: true,
      });
    }
    if (emb_company) {
      // emb_description += '**Compañía: ** ' + emb_company + '\n';
      fieldDataList.push({
        name: "Compañía:",
        value: emb_company,
        inline: true,
      });
    }
    if (emb_game) {
      // emb_description += '**Juego: ** ' + emb_game + '\n';
      fieldDataList.push({
        name: "Juego:",
        value: emb_game,
        inline: true,
      });
    }
    if (emb_link) {
      // emb_description += '**Link: ** ' + emb_link + '\n';
      // Extract the Website's name from the Index name
      let indexNameExtracted = getIndexName.exec(emb_index_saucenao);
      //  and if it wasnt found, show the Index name
      indexNameExtracted = indexNameExtracted
        ? indexNameExtracted[1]
        : emb_index_saucenao;

      fieldDataList.push({
        name: "Link:",
        value: "[" + indexNameExtracted + "](" + emb_link + ")",
        inline: true,
      });
    }

    const embedWithResults = new EmbedBuilder()
      .setTitle(emb_embbed_tittle)
      .setAuthor({ name: author_name, iconURL: author_image })
      .setFields(fieldDataList)
      //.setDescription(emb_description)
      .setColor(emb_color)
      .setThumbnail(searched_image)
      .setFooter({ text: emb_footer });
    if (emb_preview) {
      embedWithResults.setImage(emb_preview);
    }
    return embedWithResults;
  } else {
    // In case we couldn't gather enough information from the RAW data, use the API data
    //emb_description = '';
    if (sauceNAO_element.authorName) {
      // emb_description += '**Artista: ** ' + sauceNAO_element.authorName + '\n';
      fieldDataList.push({
        name: "Artista:",
        value: sauceNAO_element.authorName,
        inline: true,
      });
    }
    if (
      sauceNAO_element.authorUrl &&
      getUrlStatusCode(sauceNAO_element.authorUrl) != 404
    ) {
      // emb_description += '**Link del artista: ** ' + sauceNAO_element.authorUrl + '\n';

      // Extract the Website's name from the URL
      let domainNameExtracted = getURLDomain.exec(sauceNAO_element.authorUrl);
      domainNameExtracted = domainNameExtracted
        ? domainNameExtracted[1]
        : sauceNAO_element.authorUrl;
      fieldDataList.push({
        name: "Link del artista:",
        value:
          "[" + domainNameExtracted + "](" + sauceNAO_element.authorUrl + ")",
        inline: true,
      });
    }
    if (sauceNAO_element.site) {
      // emb_description += '**Página: ** ' + sauceNAO_element.site + '\n';
      fieldDataList.push({
        name: "Página:",
        value: sauceNAO_element.site,
        inline: true,
      });
    }
    if (sauceNAO_element.url && getUrlStatusCode(sauceNAO_element.url) != 404) {
      // emb_description += '**Link: ** ' + sauceNAO_element.url + '\n';

      // Extract the Website's name from the URL
      let domainNameExtracted = getURLDomain.exec(sauceNAO_element.url);
      domainNameExtracted = domainNameExtracted
        ? domainNameExtracted[1]
        : sauceNAO_element.url;
      fieldDataList.push({
        name: "Link de la imágen:",
        value: "[" + domainNameExtracted + "](" + sauceNAO_element.url + ")",
        inline: true,
      });
    }
    const embedWithResults = new EmbedBuilder()
      .setTitle(emb_embbed_tittle)
      .setAuthor({ name: author_name, iconURL: author_image })
      //.setDescription(emb_description)
      .setFields(fieldDataList)
      .setColor(emb_color)
      .setThumbnail(searched_image)
      .setFooter({ text: emb_footer });
    if (emb_preview) {
      embedWithResults.setImage(emb_preview);
    }
    return embedWithResults;
  }
}
function getUrlStatusCode(url: string) {
  try {
    // We first try with the HTTPS library
    https
      .get(url, (resp) => {
        return resp.statusCode;
      })
      .on("error", (err) => {
        console.log("HTTP Error: " + err.message);
        return 404;
      });
  } catch (e) {
    // And then with the HTTP library, in case the link is a HTTP
    try {
      http
        .get(url, (resp) => {
          return resp.statusCode;
        })
        .on("error", (err) => {
          console.log("HTTP Error: " + err.message);
          return 404;
        });
    } catch (error) {
      console.log(error);
      return 404;
    }
  }
}
