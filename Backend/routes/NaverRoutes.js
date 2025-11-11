const express = require("express");
const router = express.Router();
const {
getLiveStats ,
getLatencyStats ,
} = require("../controllers/NaverDashboardController");
const protect = require("../middleware/AuthMiddleware");
// const RolePermissionMiddleware = require("../middleware/RolePermissionMiddleware");

// router.get("/api-by-search",protect, getAPIbysearch);
router.get("/Naver-dashboard-data",protect , getLiveStats);
router.get("/Naver-dashboard-data-latency", protect, getLatencyStats);

module.exports = router;