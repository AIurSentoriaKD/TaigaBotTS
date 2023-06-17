import Pixiv from "pixiv.ts";
import { Client } from "discord.js";
import { promisify } from "util";
//import { ImgurClient } from "imgur";

export class Taiga extends Client {
  pixiv: Pixiv;
  lastIllustID: number;
  lastDate: string;
  mysql: any;
  wait: any;
  constructor(options: any, pixiv: Pixiv, mysql: any) {
    super(options);
    this.pixiv = pixiv;
    this.lastIllustID = 0;
    this.lastDate = "";
    this.mysql = mysql;
    this.wait = promisify(setTimeout);
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
  async imageFolderCreator() {}
}
