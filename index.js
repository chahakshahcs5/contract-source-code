require("dotenv").config();
const axios = require("axios");
const generalDb = require("./model/general");
const contractDb = require("./model/contract");
const errorDb = require("./model/error");

const getPastContract = async () => {
  try {
    const data = await generalDb.find({});
    for (let i = data.OldLastEthBlock; i < data.OldLastEthBlock - 400; i--) {
      await getContractByBlock(i);
    }
    await generalDb.findByIdAndUpdate(
      { _id: data[0]._id },
      { $set: { OldLastEthBlock: data.OldLastEthBlock - 400 } }
    );
  } catch (error) {
    console.log(error);
  }
};

const getLatestContract = async (web3, Moralis, chain) => {
  try {
    const latestBlock = await web3.eth.getBlockNumber();
    const data = await generalDb.find({});
    if (chain == "eth") {
      const toBLock =
        latestBlock - data[0].LastEthBlock > 3000
          ? data[0].LastEthBlock + 3000
          : latestBlock;
      console.log(toBLock);
      for (let i = data[0].LastEthBlock; i < toBLock; i++) {
        await getContractByBlock(i, Moralis, chain);
      }
      await generalDb.findByIdAndUpdate(
        { _id: data[0]._id },
        { $set: { LastEthBlock: toBLock } }
      );
    } else {
      const toBLock =
        latestBlock - data[0].LastPolygonBlock > 3000
          ? data[0].LastPolygonBlock + 3000
          : latestBlock;
      for (let i = data[0].LastPolygonBlock; i < toBLock; i++) {
        await getContractByBlock(i, Moralis, chain);
      }
      await generalDb.findByIdAndUpdate(
        { _id: data[0]._id },
        { $set: { LastPolygonBlock: toBLock } }
      );
    }
  } catch (error) {
    console.log(error);
  }
};

const getContractByBlock = async (block, Moralis, chain) => {
  try {
    const blockData = await Moralis.Web3API.native.getBlock({
      chain,
      block_number_or_hash: block,
    });
    // const blockData = await web3.eth.getBlock(block);
    for (let i = 0; i < blockData.transactions.length; i++) {
      // const tx = await web3.eth.getTransactionReceipt(
      //   blockData.transactions[i]
      // );
      const tx = blockData.transactions[i];
      if (tx.to_address == null) {
        const data = await axios.get(
          chain == "eth"
            ? `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${tx.receipt_contract_address}&apikey=${process.env.ETHERSCAN_API_KEY}`
            : `https://api.polygonscan.io/api?module=contract&action=getsourcecode&address=${tx.receipt_contract_address}&apikey=${process.env.POLYGONSCAN_API_KEY}`
        );
        if (data.data && data.data.result[0].SourceCode) {
          await contractDb.create({
            ContractAddress: tx.receipt_contract_address,
            SourceCode: data.data.result[0].SourceCode,
            ABI: data.data.result[0].ABI,
            ContractName: data.data.result[0].ContractName,
            CompilerVersion: data.data.result[0].CompilerVersion,
            ConstructorArguments: data.data.result[0].ConstructorArguments,
            Proxy: data.data.result[0].Proxy,
            Implementation: data.data.result[0].Implementation,
            Chain: "ethereum",
            TimeStamp: tx.block_timestamp,
            TransactionHash: tx.hash,
            BlockNumber: blockData.number,
            From: tx.from_address,
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    await errorDb.create({ BlockNumber: block });
  }
};

module.exports = {
  getPastContract,
  getLatestContract,
  getContractByBlock,
};
