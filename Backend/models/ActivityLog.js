const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: String,
  endpoint: String,
  ipAddress: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Activity_Logs", activityLogSchema);
