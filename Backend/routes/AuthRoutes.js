const express = require("express");
const router = express.Router();
const {
  userRegister,
  login,
  changePassword,
  getRoleBasePermission,
  sendotp
} = require("../controllers/AuthController");
const protect = require("../middleware/AuthMiddleware");

router.post("/add-user", userRegister);
router.post("/login", login);
router.post("/send-otp", sendotp);
router.get("/get-rolebase-permission", protect, getRoleBasePermission);
router.post("/change-password", protect, changePassword);
module.exports = router;
