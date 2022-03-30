const mongoose = require("mongoose");

const errorSchema = new mongoose.Schema({
  BlockNumber: Number,
});

const error = mongoose.model("error", errorSchema);
module.exports = error;
