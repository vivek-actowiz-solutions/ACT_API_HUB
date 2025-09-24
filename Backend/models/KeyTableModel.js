const mongoose = require("mongoose");

const apiKeySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
    },
    usage: {
      type: Number,
      default: 0,
    },
    limit: {
      type: Number,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
console.log("hello");
module.exports = mongoose.model("key_table", apiKeySchema, "key_table");
