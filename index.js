const express = require("express");
const pm2 = require('pm2');
const app = express();
require("dotenv").config();

app.get("/", (req, res) => {
  res.send("Arbius manager api");
});
app.get("/pm2/jobs", (req, res) => {
  pm2.connect((err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    pm2.list((err, processes) => {
      if (err) {
        console.error(err);
        pm2.disconnect();
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      console.log(processes);
      res.json({ processes });
      pm2.disconnect();
    });
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
