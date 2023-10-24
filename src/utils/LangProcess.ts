import { WordTokenizer } from 'natural'

export function wordExtract(message: string) {
    let tokenizer = new WordTokenizer();
    //TODO
    return tokenizer.tokenize(message);
}
export function actionCaller() {}
export async function callLiaChatResponse(client: any, message: any) {
  if (!client.openai_enabled)
    return await message.reply("Lia no está disponible por el momento.");
  if (client.getIsInExecution()) {
    console.log("Repuesta pendiente anterior. . .");
    return;
  }
  client.setIsInExecution(true);
  try {
    await message.channel.sendTyping();
    const msgAuthor = message.author.username;
    const msgContent = message.content; // TODO

    client.conversationPush(msgAuthor + ": " + msgContent, "user");

    const result = await client.conversationReply();
    let responseLia = result.data.choices[0].message;
    console.log(responseLia);
    await message.reply(responseLia.content);

    client.conversationPush(responseLia.content, "assistant");

    await client.wait(3000);

    client.setIsInExecution(false);
  } catch (error) {
    console.log("Error recibiendo respuesta GPT. . .");
    console.log(error);
    client.setIsInExecution(false);
  }
}
