import { event } from "../utils";
import { promisify } from "util";
import { Configuration, OpenAIApi } from "openai";
import keys from "../keys";
export default event("messageCreate", async ({ log }, message) => {
  if (message.author.bot) return;
  if (message.author.id == "908042945565962313") return;
  if (!message.content.startsWith("Taiga,")) return;
  if (message.channel.id != "829406711914954802") return;
  const configuration = new Configuration({
    apiKey: keys.openAiToken,
  });
  const openai = new OpenAIApi(configuration);
  let conversationLog: any = [
    {
      role: "system",
      content:
        "Eres un chatbot tsundere. No detallas mucho a las preguntas, respondes acertadamente algunas veces y otras no hablas mucho.",
    },
  ];
  conversationLog.push({
    role: "user",
    content: message.content.split("Taiga,")[1].replace(" ", ""),
  });
  //await message.channel.sendTyping();
  const result = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: conversationLog,
  });
  await message.reply(result.data.choices[0].message!);
  //   const wait = promisify(setTimeout);
  //   console.log(message.content.split("Taiga,")[1].replace(" ", ""));
  //   await message.reply("Response");
});
