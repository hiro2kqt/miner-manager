async function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}
const fetchPrice = async () => {
  try {
  } catch (error) {}
};
const fetchGas = async () => {
  try {
  } catch (error) {}
};
const processAutomate = async () => {
  try {
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  while (true) {
    await processAutomate();
    await delay(2000);
  }
})();
