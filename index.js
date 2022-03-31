require("dotenv").config();
const axios = require("axios");
const generalDb = require("./model/general");
const contractDb = require("./model/contract");
const errorDb = require("./model/error");

const getLatestContract = async (web3, Moralis, chain) => {
  try {
    const latestBlock = await web3.eth.getBlockNumber();
    const data = await generalDb.find({});
    // const toBLock =
    //   latestBlock - data[0].LastEthBlock > parseInt(process.env.LOOP)
    //     ? data[0].LastEthBlock + parseInt(process.env.LOOP)
    //     : latestBlock;
    for (let i = data[0].LastEthBlock; i < latestBlock; i++) {
      await getContractByBlock(i, Moralis, chain, data[0]._id);
    }
  } catch (error) {
    console.log(error);
  }
};

const getContractByBlock = async (block, Moralis, chain, id) => {
  try {
    const blockData = await Moralis.Web3API.native.getBlock({
      chain,
      block_number_or_hash: block,
    });
    for (let i = 0; i < blockData.transactions.length; i++) {
      const tx = blockData.transactions[i];
      if (tx.to_address == null && tx.receipt_status) {
        const data = await axios.get(
          `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${tx.receipt_contract_address}&apikey=${process.env.ETHERSCAN_API_KEY}`
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
            TimeStamp: new Date(tx.block_timestamp),
            TransactionHash: tx.hash,
            BlockNumber: blockData.number,
            From: tx.from_address,
          });
        }
      }
    }
    await generalDb.findByIdAndUpdate(id, { $set: { LastEthBlock: block } });
  } catch (error) {
    console.log(error);
    await errorDb.create({ BlockNumber: block, Chain: chain });
  }
};

module.exports = {
  getLatestContract,
  getContractByBlock,
};
