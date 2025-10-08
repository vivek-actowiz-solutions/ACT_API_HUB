const mongoose = require("mongoose");

const apiConfigSchema = new mongoose.Schema({
  apiName: {
    type: String,
    required: true,
    trim: true,
  },
  domainName: {
    type: String,
    required: true,
    trim: true,
  },
  categoryName: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["PL", "PDP", "Search", "Review"],
    required: true,
  },
  subType: {
    type: String,
    enum: [
      "BY URL",
      "BY ASIN",
      "BY UPC",
      "BY MPN",
      "BY EAN",
      "BY SKU",
      "BY Keyword",
    ],
    required: true,
  },
  apiEndpoint: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    enum: ["GET", "POST"],
    required: true,
  },
  payload: {
    type: Object,
    default: {},
  },
  header: {
    type: Object,
    default: {},
  },
  applicationType: {
    type: String,
    enum: ["WEB", "APP"],
    required: true,
  },
  customers: [
    {
      _id: false,
      customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      customerName: {
        type: String,
      },
    },
  ],
  dbName: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  github_link: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("API_Config", apiConfigSchema);
