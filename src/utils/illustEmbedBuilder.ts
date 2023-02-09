import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { PixivIllust } from "pixiv.ts";

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
