const { default: axios } = require("axios");
const { readFile, writeFile, readFileSync } = require("fs");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const listNode = JSON.parse(process.env.NODE_URL);

const bot = new TelegramBot("6723022602:AAFIxxvopAaEq5d2cNcX0d5zKprbz31BnAI", {
  polling: true,
});
const CORE_URL = `https://miner-manager-tg0l.onrender.com`;
let actions = [];
const addAction = async (msg) => {
  try {
    const fromID = msg?.from?.id;
    actions = [
      ...actions.filter((e) => e?.from != fromID),
      {
        from: fromID,
        action: msg?.text,
      },
    ];
    await bot.sendMessage(
      msg.chat.id,
      `Which node:
Huy: 
/${listNode[0]}
/${listNode[1]}
Thien: 
/${listNode[2]}
/${listNode[3]}`
    );
  } catch (error) {
    console.log("error add action");
  }
};
const addressShortener = (addr = "", digits = 5) => {
  digits = 2 * digits >= addr.length ? addr.length : digits;
  return `${addr.substring(0, digits)}...${addr.slice(-digits)}`;
};

function updateAutoclaimEnable() {
  readFile(path, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }

    try {
      const config = JSON.parse(data);
      config.autoclaim.enable = !config.autoclaim.enable;
      const updatedConfig = JSON.stringify(config, null, 2);

      writeFile(path, updatedConfig, "utf8", (err) => {
        if (err) {
          console.error("Error writing to the file:", err);
        } else {
          console.log("Enable value updated successfully!");
        }
      });
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
    }
  });
}
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const getStatus = async () => {
    const resp = await axios.get(`${CORE_URL}/status`);
    const data = resp?.data;
    await bot.sendMessage(
      chatId,
      `${data
        .map(
          (e, index) => `<b>${addressShortener(e?.address)}</b> | <b>${
            e?.start
              ? "Mining"
              : e?.["start-automine"]
              ? "Automine"
              : "Not running"
          }</b>
Claim: <code>${e?.claim}</code>
\n`
        )
        .join("")}`,
      {
        parse_mode: "HTML",
      }
    );
  };
  const getConfig = async () => {
    try {
      const data = readFileSync("config.json", "utf-8");
      const parseData = JSON.parse(data);
      await bot.sendMessage(
        chatId,
        `Auto Claim: <code>${
          parseData?.autoclaim?.enable ? "ENABLE" : "DISABLE"
        }</code>
<b>${parseData?.autoclaim?.on ? "ON" : "OFF"}</b> <code>${
          parseData?.autoclaim?.thresshold
        }</code>`,
        {
          parse_mode: "HTML",
        }
      );
    } catch (error) {
      console.log("CONFIG", error);
    }
  };
  switch (msg?.text) {
    case "/config":
      getConfig();
      break;
    case "/nodestatus":
      (async () => {
        await bot.sendMessage(chatId, "Loading...");
        await getStatus();
      })();
      break;
    case "/claim":
      addAction(msg);
      break;
    case "/stopclaim":
      addAction(msg);
      break;
    case "/mine":
      addAction(msg);
      break;
    case "/automine":
      addAction(msg);
      break;
    case "/stopall":
      addAction(msg);
      break;
    case "/autoclaim":
      updateAutoclaimEnable();
      break;
    default:
      const selectedNode = msg?.text?.replace("/", "");
      const findAction = actions.find((e) => e?.from == msg?.from?.id);
      console.log(findAction);
      if (selectedNode && findAction) {
        try {
          (async () => {
            await bot.sendMessage(chatId, "Loading...");
            console.log(selectedNode, findAction);
            const url = `${CORE_URL}/update?address=${selectedNode}&action=${findAction?.action?.replace(
              "/",
              ""
            )}`;
            console.log(url);
            await axios.get(url);
            await getStatus();
          })();
        } catch (error) {
          bot.sendMessage(chatId, "Action fail!");
        }
      }
      break;
  }
});
