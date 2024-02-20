import {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} from "discord.js";
import { createReadStream, readdirSync, readFileSync, statSync } from "fs";
import { command } from "../../utils";
import { spawn } from "child_process";
import axios from "axios";
import { setTimeout } from "timers/promises";
import keys from "../../keys";

const meta = new SlashCommandBuilder()
  .setName("pixivugoira")
  .setDescription("Gets an ugoira and sends it as gif, may take long time!")
  .addIntegerOption((option) =>
    option.setName("id").setDescription("Id of ugoira").setRequired(true)
  );

export default command(meta, async ({ interaction, client }) => {
  await interaction.deferReply();
  const illustID: any = interaction.options.get("id")?.value;
  const illust: any = await client.pixiv.illust.get(
    `https://www.pixiv.net/en/artworks/${illustID}`
  );
  await client.wait(3000);
  console.log("descargando ugoira");
  const ugoira = await client.pixiv.util.downloadZip(
    `https://www.pixiv.net/en/artworks/${illustID}`,
    "./ugoira"
  );
  console.log("Descargado: ", ugoira);

  const metadata = await client.pixiv.ugoira.metadata({ illust_id: illustID! });
  const frames = metadata.ugoira_metadata.frames;
  //console.log(metadata.ugoira_metadata.frames);

  let time = 0;
  frames.forEach((frame) => {
    time += frame.delay;
  });

  const frameRate = Math.round((frames.length / time) * 100000) / 100;

  async function runFFmpeg(): Promise<Boolean> {
    return new Promise((resolve, reject) => {
      const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
      const ffmpeg = spawn(ffmpegPath, [
        "-framerate",
        frameRate.toString(),
        `-i`,
        `./ugoira/${illustID}/%06d.jpg`,
        // `-c:v`,
        // `libvpx`,
        `-b:v`,
        `2500k`,
        `./ugoira/${illustID}.webm`,
      ]);
      ffmpeg.stdout.on("data", (data) => {
        console.log(`stdout: ${data.toString()}`);
      });

      ffmpeg.stderr.on("data", (data) => {
        console.error(`stderr: ${data.toString()}`);
      });
      ffmpeg.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
        if (code === 0) {
          resolve(true);
        } else {
          reject(false);
        }
      });
    });
  }
  await runFFmpeg()
    .then((result) => {
      console.log(`conversion terminada: ${result}`);
    })
    .catch((error) => {
      console.log(`conversion fallida: ${error}`);
    });

  //   const response = await client.imgur.upload({
  //     image: readFileSync(`./ugoira/${illustID}.webm`),
  //     type: "base64",
  //   });
  //   console.log(response);

  //   await setTimeout(2000);

  async function uploadVideoToImgur(video: Buffer): Promise<string> {
    const blob = new Blob([video]);
    const formData = new FormData();
    formData.append("image", blob, "video.mp4");

    try {
      const response = await axios.post(
        "https://api.imgur.com/3/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${keys.imgurToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const { data } = response;
      return data.data.link;
    } catch (error) {
      throw error;
    }
  }
  const webmBuffer = readFileSync(`./ugoira/${illustID}.webm`);
  //const link = await uploadVideoToImgur(webmBuffer);
  //console.log(link);
  //   const embed = new EmbedBuilder()
  //     .setColor(0x0099ff)
  //     .setTitle(`${illust.title}`)
  //     .setImage(`${response.data.link}`);

  return await interaction.editReply({
    content: `${illust.title}, ${time / 1000}s`,
    files: [`./ugoira/${illustID}.webm`],
    // embeds: [embed],
  });

  //   async function runFFmpeg(): Promise<Boolean> {
  //     return new Promise((resolve, reject) => {
  //       const ffmpeg = spawn("C:/FFmpeg/bin/ffmpeg", [
  //         // "-framerate",
  //         // metadata.ugoira_metadata.frames[0].delay.toString(),
  //         `-i`,
  //         // `./ugoira/${illustID}/%06d.jpg`,
  //         `./ugoira/${illustID}.gif`,
  //         "-movflags",
  //         "faststart",
  //         "-pix_fmt",
  //         "yuv420p",
  //         "-vf",
  //         `scale=trunc(iw/2)*2:trunc(ih/2)*2`,
  //         `./ugoira/${illustID}.mp4`,
  //       ]);
  //       ffmpeg.stdout.on("data", (data) => {
  //         console.log(`stdout: ${data.toString()}`);
  //       });

  //       ffmpeg.stderr.on("data", (data) => {
  //         console.error(`stderr: ${data.toString()}`);
  //       });
  //       ffmpeg.on("close", (code) => {
  //         console.log(`child process exited with code ${code}`);
  //         if (code === 0) {
  //           resolve(true);
  //         } else {
  //           reject(false);
  //         }
  //       });
  //     });
  //   }

  //   const stats = statSync(`./ugoira/${illustID}.gif`);
  //   const sizeMB = stats.size / (1024 * 1024);
  //   let extension = "gif";
  //   if (sizeMB > 7) {
  //     console.log("The ugoira is more than 10MB, can't upload.");
  //     await interaction.editReply({
  //       content: "Ugoira gif more than 7mb, the conversion may take a while. . .",
  //     });
  //     await runFFmpeg()
  //       .then((result) => {
  //         console.log(`conversion terminada: ${result}`);
  //       })
  //       .catch((error) => {
  //         console.log(`conversion fallida: ${error}`);
  //       });
  //     await interaction.editReply({
  //       content: "Conversion finished, uploading. . .",
  //     });
  //     extension = "mp4";
  //   }
  //   await setTimeout(2000);

  //   const response = await client.imgur.upload({
  //     image: readFileSync(`./ugoira/${illustID}.${extension}`),
  //     type: "stream",
  //   });

  //   await setTimeout(2000);

  //   console.log(response.data);
  //   return await interaction.editReply({
  //     content: "A",
  //   });

  //   const embed = new EmbedBuilder()
  //     .setColor(0x0099ff)
  //     .setTitle(`${illust.title}`)
  //     .setImage(`${response.data.link}`);
  //   return await interaction.editReply({
  //     embeds: [embed],
  //   });
});
