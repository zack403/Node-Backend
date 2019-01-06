const express = require("express");
const app = express();
const winston = require("winston");
const cors = require("cors");

let corsOption = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200
};

app.use(cors(corsOption));

require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/database")();
require("./startup/config")();

const environment = app.get("env");
const username = process.env.GMAIL_USERNAME;
const password = process.env.GMAIL_PASSWORD;
console.log(environment);
console.log(username, password);

const port = process.env.port || 4000;
const server = app.listen(port, () =>
  winston.info(`Server is listening on port ${port}`)
);

module.exports = server;
