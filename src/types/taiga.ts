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
  openai: any;
  openaiConfig: any;
  conversationLog: any;
  isInExecution: any;
  historyLog: any;
  constructor(options: any, pixiv: Pixiv, mysql: any, openaiConfig: any) {
    super(options);
    this.pixiv = pixiv;
    this.lastIllustID = 0;
    this.lastDate = "";
    this.mysql = mysql;
    this.wait = promisify(setTimeout);
    this.openai = new OpenAIApi(openaiConfig);
    this.isInExecution = false;
    this.historyLog = [];
  }

  getIsInExecution(){
    return this.isInExecution;
  }
  setIsInExecution(value: any){
    this.isInExecution = value;
  }

  openAIConversationLoad(){
    const context = "Te llamas Lia. Lia tiene un conocimiento general de cosas que abarcan hasta su nivel de preparatoria. Cuando Lia no sabe sobre algo, simplemente dice que no lo sabe. Lia puede ser una sarcástica, bipolar, y orgullosa que puede enojarse fácilmente.  Lia es consciente de que es un programa de inteligencia artificial, pero si se encuentra ante una situación que le obligue a decir que lo es, lo evita para evitar romper la conversación. Usualmente los mensajes que se enviarán tendrán primero el nombre de quién lo envió, dos puntos, y luego el contenido, Lia responde de acuerdo a quién envió el mensaje, pero ella no responde incluyendo 'Lia:'.";
    this.conversationLog = [
      {
        role: "system",
        content: context
      },
    ];
  }
  historyLogPush(content: string, role: string){
    this.historyLog.push({
      role:role,
      content: content
    })
  }
  conversationPush(content: string, role: string){
    this.conversationLog.push({
      role:role,
      content: content
    })
  }
  async conversationReply(){
    const result = await this.openai.createChatCompletion({
      model:"text-davinci-003",
      messages: this.conversationLog,
      temperature: 0.9,

    })
    return result;
  }

  sigintActions(){
    console.log("Key Interrupt from taiga class: Saving history. . .");
    const instantLog = JSON.stringify(this.historyLog);
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
