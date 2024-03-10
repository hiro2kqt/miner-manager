const express = require("express");
const { readFileSync, writeFileSync } = require("fs");
const { getCurrentConfig } = require("./automode");
const app = express();
require("dotenv").config();
require("./automode");

const getStatus = async () => {
  const data = readFileSync("status.json", "utf8");
  return JSON.parse(data);
};
getStatus();
app.get("/", (req, res) => {
  res.send("Arbius manager api");
});
app.get("/status", async (req, res) => {
  const statusLog = await getStatus();
  const address = req?.query?.address;
  if (address) res.json(statusLog.find((e) => e?.address == address));
  else res.json(statusLog);
});
const updateStatus = async (data) => {
  try {
    writeFileSync("status.json", JSON.stringify(data));
  } catch (error) {
    console.error("Error updating document:", error);
  }
};

app.get("/update", async (req, res) => {
  try {
    let statusLog = await getStatus();
    const address = req?.query?.address;
    const nodeIndex = statusLog.findIndex((e) => e?.address == address);
    switch (req?.query?.action) {
      case "claim":
        statusLog[nodeIndex]["claim"] = true;
        await updateStatus(statusLog);
        break;
      case "stopclaim":
        statusLog[nodeIndex]["claim"] = false;
        await updateStatus(statusLog);
        break;
      case "automine":
        statusLog[nodeIndex]["start-automine"] = true;
        statusLog[nodeIndex]["start"] = false;
        await updateStatus(statusLog);
        break;
      case "mine":
        statusLog[nodeIndex]["start-automine"] = false;
        statusLog[nodeIndex]["start"] = true;
        await updateStatus(statusLog);
        break;
      case "stopall":
        statusLog[nodeIndex]["start-automine"] = false;
        statusLog[nodeIndex]["start"] = false;
        await updateStatus(statusLog);
        break;
    }
    res.json(await getStatus());
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});
app.get("/autoclaim", async (req, res) => {
  try {
    const data = await getCurrentConfig();
    res.json(data);
  } catch (error) {
    console.log(error);
  }
});

app.post("/autoclaim", async (req, res) => {
  try {
    console.log(req);
  } catch (error) {
    console.log(error);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
