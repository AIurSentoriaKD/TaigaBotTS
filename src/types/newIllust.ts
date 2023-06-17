import { Taiga } from "./taiga";
export class NewIllust {
  client: Taiga;
  illust: any;
  related: string;
  illust_meta_thumb: string;
  illust_meta_large: string;
  constructor(
    client: Taiga,
    illust: any,
    related: string,
    illust_meta_thumb: string,
    illust_meta_large: string
  ) {
    this.client = client;
    this.illust = illust;
    this.related = related;
    this.illust_meta_thumb = illust_meta_thumb;
    this.illust_meta_large= illust_meta_large;
  }
  getClient() {
    return this.client;
  }
  getIllust() {
    return this.illust;
  }
  getThumb() {
    return this.illust_meta_thumb;
  }
  getLarge() {
    return this.illust_meta_large;
  }
  getRelated() {
    return this.related;
  }
  getTagsString() {
    return "Etiquetas TODO";
  }
}
