const { default: axios } = require("axios");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const listNode = JSON.parse(process.env.NODE_URL);

const bot = new TelegramBot("6723022602:AAFIxxvopAaEq5d2cNcX0d5zKprbz31BnAI", {
  polling: true,
});
const getAcceptID = (id) => listNode?.find((e) => `/${e?.name}` == id);
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
Huy: /node01 /node02
Thien: /node03 /node04`
    );
  } catch (error) {
    console.log("error add action");
  }
};
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const getStatus = async () => {
    const status = await Promise.all(
      listNode.map(async (obj) => {
        try {
          const resp = await axios.get(`http://${obj?.url}/pm2/jobs`);
          return resp.data;
        } catch (error) {
          return false;
        }
      })
    );
    await bot.sendMessage(
      chatId,
      `${status
        .map((e, index) =>
          e == false
            ? `${listNode[
                index
              ]?.name?.toUpperCase()}: <code>Server not connected</code>\n`
            : `<b>${listNode[index]?.name?.toUpperCase()}</b>:\n${e
                ?.map(
                  (j) =>
                    `${j?.name}: <code>${
                      j?.status ? "running" : "offline"
                    }</code>\n`
                )
                .join("")}`
        )
        .join("")}`,
      {
        parse_mode: "HTML",
      }
    );
  };
  switch (msg?.text) {
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
    default:
      const selectedNode = getAcceptID(msg?.text);
      const findAction = actions.find((e) => e?.from == msg?.from?.id);
      try {
        async () => {
          await axios.get(
            `http://${selectedNode?.url}/action?job=${findAction}`
          );
          await getStatus();
        };
      } catch (error) {
        bot.sendMessage(chatId, "Action fail!");
      }
      break;
  }
});
