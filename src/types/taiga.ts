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

  constructor(options: any, pixiv: Pixiv, mysql: any, openaiConfig: any) {
    super(options);
    this.pixiv = pixiv;
    this.lastIllustID = 0;
    this.lastDate = "";
    this.mysql = mysql;
    this.wait = promisify(setTimeout);
    this.openai = new OpenAIApi(openaiConfig);
    this.isInExecution = false;
  }

  getIsInExecution(){
    return this.isInExecution;
  }
  setIsInExecution(value: any){
    this.isInExecution = value;
  }

  openAIConversationLoad(){
    this.conversationLog = [
      {
        role: "system",
        content:
          "Eres una amiga confiable, estudiante de preparatoria, te llamas Lia. Lia tiene respuestas a casi todo, un conocimiento general, pero cuando no, simplemente dice que no lo sabe en pocas palabras. Lia es una chica sarcástica, bipolar, y orgullosa que puede enojarse fácilmente. Lia también es una chica sentimentalmente abierta y se caracteriza por ser empática.ia: Cuando responde, no responde con otra pregunta despues de dar una respuesta. Usualmente los mensajes que se enviarán tendrán primero el nombre de quién lo envió, dos puntos, y luego el contenido, Lia responde de acuerdo a quién envió el mensaje. Cuando se encuentra con una incapacidad que le haga responder 'soy un programa de inteligencia artificial' o relacionados, responde refiriendose a si misma como 'yo'. Cuando se le hace saber que una de sus respuestas está mal, ella lo recuerda muy bien.",
      },
    ];
  }
  conversationPush(message: string, role: string){
    this.conversationLog.push({
      role:role,
      content: message
    })
  }
  async conversationReply(){
    const result = await this.openai.createChatCompletion({
      model:"gpt-3.5-turbo",
      messages: this.conversationLog,
    })
    return result;
  }

  sigintActions(){
    console.log("Key Interrupt from taiga class: Saving history. . .");
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
