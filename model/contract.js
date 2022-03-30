const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema({
  ContractAddress: String,
  SourceCode: String,
  ABI: String,
  ContractName: String,
  CompilerVersion: String,
  ConstructorArguments: String,
  Proxy: String,
  Implementation: String,
  Chain: String,
  TimeStamp: String,
  TransactionHash: String,
  BlockNumber: Number,
  From: String,
});

const contract = mongoose.model("contract", contractSchema);
module.exports = contract;
