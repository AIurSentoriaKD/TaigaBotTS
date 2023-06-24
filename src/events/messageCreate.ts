import { event } from "../utils";
import { promisify } from "util";
import { Configuration, OpenAIApi } from "openai";
import keys from "../keys";
export default event("messageCreate", async ({ client, log }, message) => {
   
  if (message.author.bot) return;
  //if (message.author.id != "208678337646690307") return;
  if (message.channel.id != "920851185467031572") return;
  if (message.content.toLowerCase().includes("lia") || message.mentions.repliedUser?.id === "908042945565962313"){
    await callTaigaResponse(client, message);
    //console.log(message.mentions.repliedUser)
  }
  // if(message.mentions.repliedUser?.id != "908042945565962313"){
  //   await callTaigaResponse(client, message);
  // }
});

async function callTaigaResponse(client: any, message: any){
  if(client.getIsInExecution()){
    console.log("Repuesta pendiente anterior. . .")
    return;
  }
  client.setIsInExecution(true);
  try{
    await message.channel.sendTyping();
    const msgAuthor = message.author.username;
    const msgContent = message.content; // TODO
    client.conversationPush(msgAuthor+": "+msgContent, 'user');
    const result = await client.conversationReply();
    await message.reply(result.data.choices[0].message!);
    // client.conversationPush(result.data.choices[0].message, 'lia');
    await client.wait(3000);
    client.setIsInExecution(false);
  } catch(error){
    console.log("Error recibiendo respuesta GPT. . .");
    console.log(error);
    client.setIsInExecution(false);
  }
}