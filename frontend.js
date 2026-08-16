import "/app/i18n/index.js";
import en from "/locales/en.js";
import "/models/schema.js";
import $APP from "bootstrapp";

$APP.i18n?.addTranslations("en", en);
