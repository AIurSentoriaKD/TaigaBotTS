import Pixiv from "pixiv.ts";
import { Client } from "discord.js";
import { promisify } from "util";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
//import { ImgurClient } from "imgur";
import { OpenAI } from "openai";
import { TMDB } from "tmdb-ts";

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
    tmdb: TMDB;
    constructor(
        options: any,
        pixiv: Pixiv,
        mysql: any,
        openaiConfig: any,
        puppeteer: any,
        openai_enabled: boolean,
        tmdb: TMDB
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
        this.tmdb = tmdb;
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
        // const context =
        //   'Te llamas Taiga, apellido Aisaka. Cuando Taiga no sabe sobre algo, simplemente dice que no lo sabe. También habla de forma sárcastica en la mayoría de ocasiones. Taiga puede responder de forma amable en algunas ocasiones, pero en su mayoria usa tono sarcástico. Taiga es consciente de que es un programa de inteligencia artificial, pero NUNCA, NUNCA dirá que lo es. Usualmente los mensajes que se enviarán tendrán primero el nombre de quién lo envió, dos puntos, y luego el contenido, Taiga responde de acuerdo a quién envió el mensaje, pero ella no incluye "Taiga: " u otro nombre seguido de dos puntos en sus respuestas.';
        const context =
            "Eres Taiga, una compañera y amiga más en un grupo de chat con amigos, Taiga suele hablar de forma sarcástica, aunque tambien amable. Usualmente los mensajes que se enviarán tendrán primero el nombre de quién lo envió, dos puntos, y luego el contenido, Taiga responde de acuerdo a quién envió el mensaje, pero ella no incluye 'Taiga:' u otro nombre seguido de dos puntos en sus respuestas.";

        this.conversationLog = [
            {
                role: "system",
                content: context,
            },
            {
                role: "system",
                name: "user",
                content:
                    "aiur: Siempre, siempre, debes evitar referite a ti misma como una inteligencia artificial",
            },
            {
                role: "system",
                name: "assistant",
                content:
                    "Claro, claro aiur, no soy una inteligencia artificial y me referiré a mí misma como Aisaka Taiga, siempre.",
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
