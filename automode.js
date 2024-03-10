const { default: axios } = require("axios");
const { ethers } = require("ethers");
const EngineABI = require("./V2_EngineV2.json");
const { readFileSync, writeFileSync } = require("fs");
const cron = require("node-cron");
require("dotenv").config();
const D_UP = 0;
const D_DOWN = 1;
const configPath = "config.json";
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const arbiusContract = new ethers.Contract(
  "0x3BF6050327Fa280Ee1B5F3e8Fd5EA2EfE8A6472a",
  EngineABI,
  provider
);
async function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}
const fetchPrice = async () => {
  const data = {
    submitTask: null,
    claimSolution: null,
    submitSolution: null,
    signalCommitment: null,
  };
  try {
    while (
      !(
        data?.submitTask &&
        data?.claimSolution &&
        data?.submitSolution &&
        data?.signalCommitment
      )
    ) {
      const blockNumber = await provider.getBlockNumber();
      const apiScan = `https://api-nova.arbiscan.io/api?module=account&action=txlist&address=0x3BF6050327Fa280Ee1B5F3e8Fd5EA2EfE8A6472a&startblock=${
        blockNumber - 1000
      }&endblock=${blockNumber}&sort=asc&apikey=QRMANDI8UY4GSF8NT39H6JHXVXNG5EGUUQ`;
      const rs = await axios({
        baseURL: apiScan,
        method: "get",
        headers: {
          "Content-Type": "application/json",
          "cache-control": "no-cache",
          "Access-Control-Allow-Origin": "*",
        },
      });
      const methods = [
        "submitTask",
        "claimSolution",
        "submitSolution",
        "signalCommitment",
      ];
      let gasUsed = 0;
      methods.map((method) => {
        const submiskTask = rs?.data?.result.find(
          (el) => el.functionName.includes(method) && el.isError == "0"
        );
        if (submiskTask?.gasUsed) data[method] = submiskTask.gasUsed;
      });
    }
    return data;
  } catch (error) {
    console.log(error);
  }
};
const fetchReward = async () => {
  try {
    const reward = await arbiusContract.getReward();
    return ethers.formatEther(reward);
  } catch (error) {}
};
const getCurrentConfig = async () => {
  const data = readFileSync(configPath, "utf-8");
  return JSON.parse(data);
};
const processAutomate = async () => {
  try {
    const gasFee = await fetchPrice();
    const reward = await fetchReward();
    const realReward = reward * 0.9;
    console.log("current reward", realReward);
    // const realReward = 0.0013;
    let configf = await getCurrentConfig();
    if (
      realReward >= configf.autoclaim.thresshold &&
      configf.autoclaim.direction == D_DOWN
    ) {
      console.log("run claim");
      configf["autoclaim"]["direction"] = D_UP;
      writeFileSync(configPath, JSON.stringify(configf));
    } else if (
      realReward < configf.autoclaim.thresshold &&
      configf.autoclaim.direction == D_UP
    ) {
      console.log("run stop claim");
      configf["autoclaim"]["direction"] = D_DOWN;
      writeFileSync(configPath, JSON.stringify(configf));
    }
  } catch (error) {
    console.log(error);
  }
};

// (async () => {
//   while (true) {
//     try {
//       await processAutomate();
//       await delay(2000);
//     } catch (error) {
//       console.log(error);
//     }
//   }
// })();

const tenSecondlyTask = () => {
  processAutomate();
};

const cronExpression = "0 */10 * * * *";
cron.schedule(cronExpression, tenSecondlyTask, {
  runOnInit: true,
});
