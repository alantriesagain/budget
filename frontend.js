import "/app/i18n/index.js";
import en from "/locales/en.js";
import "/models/schema.js";
import "/controllers/index.js";

globalThis.$APP.i18n?.addTranslations("en", en);
