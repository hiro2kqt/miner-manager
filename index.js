const { default: axios } = require("axios");
const express = require("express");
const pm2 = require("pm2");
const app = express();
require("./chatbot");
require("dotenv").config();
const listNode = JSON.parse(process.env.NODE_URL);
app.get("/", (req, res) => {
  res.send("Arbius manager api");
});
app.get("/jobs", async (req, res) => {
  const status = await Promise.all(
    listNode.map(async (obj) => {
      const resp = await axios.get(`http://${obj?.url}/pm2/jobs`);
      return resp.data;
    })
  );
  res.json(status);
});
app.get("/claim", async (req, res) => {
  try {
    const newStatus = req?.query?.status;
    const target = req?.query?.target;
    const targetObj = listNode.find((e) => e?.name == target);
    const resp = await axios.get(
      `http://${targetObj?.url}/claim?status=${newStatus}`
    );
    res.json(resp.data);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});
app.get("./automine");

app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
