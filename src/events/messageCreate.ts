import {
  callTaigaChatResponse,
  event,
  wordExtract,
  callTaigaCommandName,
} from "../utils";

export default event("messageCreate", async ({ client, log }, message) => {
  if (message.author.bot) return;
  // if (message.author.id != "208678337646690307") return;
  // if (message.channel.id != "920851185467031572") return;
  if (
    message.content.toLowerCase().includes("taiga") ||
    message.mentions.repliedUser?.id === "539302272534839296" ||
    message.mentions.users.first()?.id === "539302272534839296"
  ) {
    const mentionedUsers = message.mentions.users.map((user) => {
      return { id: user.id, username: user.username };
    });
    console.log(mentionedUsers);
    const words = wordExtract(message.content);
    if (
      words?.includes("name") ||
      words?.includes("autor") ||
      words?.includes("sauce")
    ) {
      let urlToSearch: any;
      if (message.attachments.first()?.url) {
        urlToSearch = message.attachments.first()?.url;
      } else if (message.embeds.length > 0) {
        urlToSearch = message!.content
          .split(" ")
          .find((word) => word.startsWith("https"));
      }
      if (urlToSearch) {
        await callTaigaCommandName(client, urlToSearch, message);
      }
    }
    if (words) {
      for (let I = 0; I < mentionedUsers!.length; I++) {
        const user = mentionedUsers![I];
        let index = words.indexOf(user.id);
        words[index] = user.username;
      }
    }
    console.log(words);
    const mensageFinal: string = words!.join(" ");
    await callTaigaChatResponse(client, message, mensageFinal);
  }
});
