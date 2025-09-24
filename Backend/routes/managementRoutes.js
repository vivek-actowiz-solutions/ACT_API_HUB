const express = require("express");
const router = express.Router();
const {
  getModules,
  getRoles,
  updatePermissions,
  getusers,
  updateuserstatus
} = require("../controllers/managementController");

const protect = require("../middleware/AuthMiddleware");
const RolePermissionMiddleware = require("../middleware/RolePermissionMiddleware");
// router.post("/userRegister", userRegister);
router.get("/get-modules", getModules);
router.get("/get-roles",protect,RolePermissionMiddleware("Role"), getRoles);
router.put("/update-role-permissions/:id", updatePermissions);
router.get("/get-user",protect,RolePermissionMiddleware("User"),  getusers);
router.put("/user-status/:id", updateuserstatus);
// router.post("/login", login);
// router.post("/change-password", protect, changePassword);
module.exports = router;
