import "@bootstrapp/app/entry.js";
import $APP from "bootstrapp";

$APP.databaseConfig = {
  type: "indexeddb",
  syncOnInit: false,
};
