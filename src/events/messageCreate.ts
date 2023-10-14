import { callLiaChatResponse, event, wordExtract } from "../utils";

export default event("messageCreate", async ({ client, log }, message) => {
  if (message.author.bot) return;
  //if (message.author.id != "208678337646690307") return;
  if (message.channel.id != "920851185467031572") return;
  if (
    message.content.toLowerCase().includes("lia") ||
    message.mentions.repliedUser?.id === "908042945565962313" ||
    message.mentions.users.first()?.id === "908042945565962313"
  ) {
    const words = wordExtract(message.content.toString());
    console.log(words);
    if(!client.openai_enabled) return;
    await callLiaChatResponse(client, message);
  }
});
