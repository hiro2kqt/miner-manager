const { default: axios } = require("axios");
const express = require("express");
const pm2 = require("pm2");
const app = express();
require("dotenv").config();

app.get("/", (req, res) => {
  res.send("Arbius manager api");
});
app.get("/jobs", async (req, res) => {
  const listNode = JSON.parse(process.env.NODE_URL);
  const status = await Promise.all(
    listNode.map(async (obj) => {
      const resp = await axios.get(`http://${obj}/pm2/jobs`);
      return resp.data;
    })
  );
  res.json(status);
});
app.get("./automine");

app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
