import Pixiv from "pixiv.ts";
import { Client } from "discord.js";
import { promisify } from "util";
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
//import { ImgurClient } from "imgur";
import { OpenAIApi } from "openai";

function syncWriteFile(filename: string, data: any) {
  writeFileSync(join('./chats', filename), data, {
    flag: 'w',
  });
}

export class Taiga extends Client {
  pixiv: Pixiv;
  lastIllustID: number;
  lastDate: string;
  mysql: any;
  wait: any;
  openai_enabled : boolean;
  openai: any;
  openaiConfig: any;
  conversationLog: any;
  isInExecution: any;
  webView: any;
  constructor(options: any, pixiv: Pixiv, mysql: any, openaiConfig: any, puppeteer: any, openai_enabled: boolean) {
    super(options);
    this.pixiv = pixiv;
    this.lastIllustID = 0;
    this.lastDate = "";
    this.mysql = mysql;
    this.wait = promisify(setTimeout);
    this.openai = new OpenAIApi(openaiConfig);
    this.isInExecution = false;
    this.webView = puppeteer;
    this.openai_enabled = openai_enabled;
  }

  getIsInExecution(){
    return this.isInExecution;
  }
  setIsInExecution(value: any){
    this.isInExecution = value;
  }

  openAIConversationLoad(){
    if(!this.openai_enabled) return;
    const context = "Te llamas Lia. Lia tiene un conocimiento general de cosas que abarcan hasta su nivel de preparatoria. Cuando Lia no sabe sobre algo, simplemente dice que no lo sabe. Sus respuestas suelen ser bastante cortas también. Ella es amigable, pero también habla de forma sárcastica. Le gusta que otros le pregunten cosas para continuar una conversación, ya que ella no vuelve a preguntar otra cosa en sus respuestas. Lia es consciente de que es un programa de inteligencia artificial, pero si se encuentra ante una situación que le obligue a decir que lo es, lo evita para evitar romper la conversación. Usualmente los mensajes que se enviarán tendrán primero el nombre de quién lo envió, dos puntos, y luego el contenido, Lia responde de acuerdo a quién envió el mensaje, pero ella no incluye \"Lia: \" en sus respuestas.";
    this.conversationLog = [
      {
        role: "system",
        content: context
      },
      {
        role: "system",
        name: "user_example",
        content: "Aiur: Hola Lia! Como estas?"
      },
      {
        role: "system",
        name: "assistant_example",
        content: "Oh, hola, Aiur. Todo bien por ahora, aunque un poco cansada. ¿Y tú?"
      },
      {
        role: "system",
        name: "user_example",
        content: "Aiur: Ya veo, entonces te dejo descansar?"
      },
      {
        role: "system",
        name: "assistant_example",
        content: "Estoy cansada, pero no me importa seguir hablando contigo..."
      },
      {
        role: "system",
        name: "user_example",
        content: "sabes cual es la canción más popular de aerosmith, lia?"
      },
      {
        role: "system",
        name: "assistant_example",
        content: "hm... creo que fue \"I Don't Want to Miss a Thing\", lanzada en 1998."
      },
      {
        role: "system",
        name: "user_example",
        content: "Oh sí, es muy buena canción."
      },
    ];
  }
  conversationPush(content: string, role: string){
    this.conversationLog.push({
      role:role,
      content: content
    })
  }
  async conversationReply(){
    const result = await this.openai.createChatCompletion({
      model:"gpt-3.5-turbo",
      messages: this.conversationLog,
      temperature: 0.9,

    })
    return result;
  }

  sigintActions(){
    console.log("Key Interrupt from taiga class: Saving history. . .");
    try{
      const instantLog = JSON.stringify(this.conversationLog);
      // Obtener la fecha y hora actual
      const fechaActual = new Date();
  
      // Obtener los componentes de fecha y hora
      const dia = fechaActual.getDate();
      const mes = fechaActual.getMonth() + 1; // Los meses van de 0 a 11
      const anio = fechaActual.getFullYear();
      const horas = fechaActual.getHours();
      const minutos = fechaActual.getMinutes();
      const segundos = fechaActual.getSeconds();
      const formatoFechaHora = `${dia}-${mes}-${anio} ${horas}_${minutos}_${segundos}`;
      syncWriteFile(`${formatoFechaHora}.json`, instantLog);
    } catch(error){
      //console.log(error);
      console.log("No chat History");
    }
    console.log("Closing webView. . .");
    this.webView.close();
  }
  setLastIllustID(id: number) {
    this.lastIllustID = id;
  }
  getLastIllustID() {
    return this.lastIllustID;
  }
  setLastDate(date: string) {
    this.lastDate = date;
  }
  getLastDate() {
    return this.lastDate;
  }
  async callProcedureInsert(proc: string, params: string[]): Promise<any> {
    await this.mysql.query(proc, params);
  }
  async callProcedureSelect(proc: string, params: string[]): Promise<any> {
    const result = await this.mysql.execute(proc, params);
    return result[0][0];
  }
}
