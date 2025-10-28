const express = require("express");
const router = express.Router();
const { apiconfigration  , } = require("../controllers/APIConfigController");
const upload = require("../utils/fileUpload");
const protect = require("../middleware/AuthMiddleware");
const RolePermissionMiddleware = require("../middleware/RolePermissionMiddleware");

router.post("/apiconfigration", protect, RolePermissionMiddleware("Api_List", "Create"),upload.single("file") ,  apiconfigration  );
router.get("/get-apiconfigration", protect, RolePermissionMiddleware("Api_List", "Create"));
// console.log("hello");

module.exports = router;
