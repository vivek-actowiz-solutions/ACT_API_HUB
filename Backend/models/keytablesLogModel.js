const mongoose = require("mongoose");

const keyTablesLogSchema = new mongoose.Schema({
  keyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  action: {
    type: String,
    enum: ["Add_Key", "Update_Key", "Delete_Key", "Restore_Key"],
    required: true,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  action_values: {
    type: Object, // store details of what changed
    default: {},
  },
});

module.exports = mongoose.model("key_tables_logs", keyTablesLogSchema);