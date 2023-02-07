import Pixiv from "pixiv.ts";
import keys from "../keys";

const pixiv = Pixiv.refreshLogin(keys.pixivRefresh);

export default pixiv;
