export class NewIllust {
    illust: any;
    illust_meta_thumb: string;
    illust_meta_large: string;
    constructor(
        illust: any,
        illust_meta_thumb: string,
        illust_meta_large: string
    ) {
        this.illust = illust;
        this.illust_meta_thumb = illust_meta_thumb;
        this.illust_meta_large = illust_meta_large;
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
    getTagsString() {
        return "Etiquetas TODO";
    }
}
