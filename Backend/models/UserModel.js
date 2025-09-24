const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "user" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: Number },
    otpExpiry: { type: Date },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "roles" },
    designation: { type: String, required: true },
    status: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
