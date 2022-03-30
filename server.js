const express = require("express");
const mongoose = require("mongoose");
const Moralis = require("moralis/node");
const Web3 = require("web3");
const cron = require("node-cron");

require("dotenv").config();

const { getLatestContract } = require("./index");

const app = express();

const PORT = process.env.PORT || 5000;
const CONNECTION_URL = process.env.CONNECTION_URL;

const serverUrl = process.env.SERVER_URL;
const appId = process.env.APP_ID;

app.get("/", (req, res) => {
  res.status(200).send("Hello World");
});

mongoose
  .connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, async () => {
      try {
        console.log(`Server running on port: ${PORT}`);
        await Moralis.start({ serverUrl, appId });

        // eth
        // const eth = cron.schedule("*/30 * * * *", async () => {
        //   console.log("running");
        await getLatestContract(
          new Web3(`https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`),
          Moralis,
          "eth"
        );
        // });
        // eth.start();

        // polygon
        // const polygon = cron.schedule("*/30 * * * *", async () => {
        //   console.log("running");
        //   await getLatestContract(
        //     new Web3(process.env.POLYGON_SERVER_URL),
        //     Moralis,
        //     "matic"
        //   );
        // });
        // polygon.start();
      } catch (error) {
        console.log(error);
      }
    });
  });
