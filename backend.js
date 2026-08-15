import "@bootstrapp/app/entry.js";

const $APP = globalThis.$APP;

$APP.databaseConfig = {
  type: "indexeddb",
  syncOnInit: false,
};
