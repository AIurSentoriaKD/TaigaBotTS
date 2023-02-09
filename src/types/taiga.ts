import Pixiv from "pixiv.ts";
import { Client } from "discord.js";

export class Taiga extends Client {
  pixiv: Pixiv;
  lastIllustID: number;
  lastDate: string;
  constructor(options: any, pixiv: Pixiv) {
    super(options);
    this.pixiv = pixiv;
    this.lastIllustID = 0;
    this.lastDate = "";
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
}
