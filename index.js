const { default: axios } = require("axios");
const express = require("express");
const pm2 = require("pm2");
const app = express();
require("dotenv").config();
const listNode = JSON.parse(process.env.NODE_URL);
var nodeData = [
  ...listNode.map((e) => ({
    address: e,
    claim: false,
    "start-automine": false,
    start: false,
  })),
];
app.get("/", (req, res) => {
  res.send("Arbius manager api");
});
app.get("/status", async (req, res) => {
  const address = req?.query?.address;
  if (address) res.json(nodeData.find((e) => e?.address == address));
  else res.json(nodeData);
});
app.get("/update", async (req, res) => {
  try {
    const address = req?.query?.address;
    const nodeIndex = nodeData.findIndex((e) => e?.address == address);
    switch (req?.query?.action) {
      case "claim":
        nodeData[nodeIndex]["claim"] = true;
        break;
      case "stopclaim":
        nodeData[nodeIndex]["claim"] = false;
        break;
      case "automine":
        nodeData[nodeIndex]["start-automine"] = true;
        nodeData[nodeIndex]["start"] = false;
        break;
      case "mine":
        nodeData[nodeIndex]["start-automine"] = false;
        nodeData[nodeIndex]["start"] = true;
        break;
      case "stopall":
        nodeData[nodeIndex]["start-automine"] = false;
        nodeData[nodeIndex]["start"] = false;
        break;
    }
    res.json(nodeData);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
