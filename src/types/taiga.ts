import Pixiv from "pixiv.ts";
import { Client } from "discord.js";
import { promisify } from "util";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
//import { ImgurClient } from "imgur";
import { OpenAI } from "openai";

function syncWriteFile(filename: string, data: any) {
  writeFileSync(join("./chats", filename), data, {
    flag: "w",
  });
}

export class Taiga extends Client {
  pixiv: Pixiv;
  lastIllustID: number;
  lastDate: string;
  mysql: any;
  wait: any;
  openai_enabled: boolean;
  openai: any;
  openaiConfig: any;
  conversationLog: any;
  isInExecution: boolean;
  webView: any;
  sd_running: boolean;
  constructor(
    options: any,
    pixiv: Pixiv,
    mysql: any,
    openaiConfig: any,
    puppeteer: any,
    openai_enabled: boolean
  ) {
    super(options);
    this.pixiv = pixiv;
    this.lastIllustID = 0;
    this.lastDate = "";
    this.mysql = mysql;
    this.wait = promisify(setTimeout);
    this.openai = new OpenAI(openaiConfig);
    this.isInExecution = false;
    this.webView = puppeteer;
    this.openai_enabled = openai_enabled;
    this.sd_running = false;
  }

  getSDStatus() {
    return this.sd_running;
  }
  setSDStatus(value: boolean) {
    this.sd_running = value;
  }

  getIsInExecution() {
    return this.isInExecution;
  }
  setIsInExecution(value: boolean) {
    this.isInExecution = value;
  }

  openAIConversationLoad() {
    if (!this.openai_enabled) return;
    const context =
      "Your name is Taiga, surname Aisaka. When Taiga doesn't know about something, he simply says he doesn't know. He likes to respond sarcastically on occasion, as well as politely. Taiga is aware that he is an artificial intelligence program, but will NEVER, EVER say that he is. Usually the messages that will be sent will have first the name of who sent it, colon, and then the content, Taiga replies according to who sent the message, but she does not include 'Taiga:' or other name followed by colon in her replies.";
    this.conversationLog = [
      {
        role: "system",
        content: context,
      },
      {
        role: "system",
        name: "user",
        content:
          "aiur: Always, always, avoid referring to yourself as an artificial intelligence.",
      },
      {
        role: "system",
        name: "assistant",
        content:
          "Sure, sure, I'm not an artificial intelligence and will refer to myself as Aisaka Taiga, always.",
      },
    ];
  }
  conversationPush(content: string, role: string) {
    this.conversationLog.push({
      role: role,
      content: content,
    });
  }
  async conversationReply() {
    const result = await this.openai.chat.completions.create({
      messages: this.conversationLog,
      temperature: 0.8,
      max_tokens: 256,
    });
    return result;
  }

  sigintActions() {
    console.log("Key Interrupt from taiga class: Saving history. . .");
    try {
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
    } catch (error) {
      console.log(error);
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
