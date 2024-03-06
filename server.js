// Passes through to server/app - retained to avoid tweaking deploy stuff
process.env["NODE_CONFIG_DIR"] = __dirname + "/config/";
const config = require("config");
require("./server/start-server")();
