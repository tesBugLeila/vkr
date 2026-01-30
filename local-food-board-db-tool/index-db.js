const express = require("express");
// import the SQLite DB that you use
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("../local-food-board-backend/database.sqlite");
// Import the package
const { SqliteGuiNode } = require("sqlite-gui-node");

const app = express();

// use the GUI
SqliteGuiNode(db, 3005).catch((err) => {
  console.error("Error starting the GUI:", err);
});

app.listen(4001);