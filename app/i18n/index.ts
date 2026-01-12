import { I18n } from "i18n-js";

import bn from "./bn";
import en from "./en";
import hi from "./hi";
import mr from "./mr";

const i18n = new I18n({ en, hi, mr, bn });

i18n.enableFallback = true;
i18n.locale = "en";

export default i18n;
