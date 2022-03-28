const mongoose = require("mongoose");

const generalSchema = new mongoose.Schema({
  LastEthBlock: Number,
  LastPolygonBlock: Number,
});

const general = mongoose.model("general", generalSchema);
module.exports = general;
