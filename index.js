import dotEnv from "dotenv";
import express from "express";
import helmet from "helmet";
import SQLite3 from "sqlite3";
import path, { join } from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

import crud from "./Routes/CRUD.js";
import image from "./Views/imageView.js";
import handleError from "./Views/handleError.js";

dotEnv.config();

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME,
  SERVER_PORT = process.env.SERVER_POR,
  url = `http://${SERVER_HOSTNAME}:${SERVER_PORT}`,
  __filename = fileURLToPath(import.meta.url),
  __dirname = path.dirname(__filename),
  app = express();

app.use(helmet());
app.use(express.json());

let htmlDropDownPopulation = readFileSync(
  __dirname + "/public/MainPage/Index.html",
  "utf-8"
);

app.use("/CRUD", crud);
app.use("/Images", image);
app.use("/handleError", handleError);

let ModelliDB = new SQLite3.Database(join(__dirname + "/Database/modelli.db"));

app.listen(SERVER_PORT, SERVER_HOSTNAME, (_) => {
  console.log(`Server avviato su ${url}`);
});

app.get("", (req, res) => {
  ModelliDB.serialize((_) => {
    ModelliDB.all("SELECT ROWID, Nome FROM Modelli", (err, rows) => {
      if (err) res.status(500).send("Errore popolazione dropdown");
      let jsonTemplate = JSON.parse(JSON.stringify(rows)),
        populatedNameDropDown = [];
      jsonTemplate.map((json) => {
        if (!populatedNameDropDown.includes(`<option>${json.Nome}</option>`))
          populatedNameDropDown.push(`<option>${json.Nome}</option>`);
      });
      app.use(express.static("./public/MainPage"));
      res
        .status(200)
        .send(
          htmlDropDownPopulation.replace(
            "{{%ListaNomi%}}",
            populatedNameDropDown.join(",")
          )
        );
    });
  });
});
