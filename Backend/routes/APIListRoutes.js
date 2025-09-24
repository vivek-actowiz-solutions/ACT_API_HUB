const express = require("express");
const router = express.Router();
const {
  getAPIList,
  getAPIListById,
  updatekey,
  addkey,
  deletekey,
  gettestapi,
  apistatusupdate,
  getlogsDetails,
  getAPIkeyList,
  getExportLogsData,
  getAPIListExportData,
  getAPIkeyhistoryList,
  restorekey ,
  getKeyLogs,
  generateDoc ,
  getlogsData,
  permanentDeletekey
} = require("../controllers/APIListController");
const protect = require("../middleware/AuthMiddleware");
const RolePermissionMiddleware = require("../middleware/RolePermissionMiddleware");
const keyTablesLogs =  require("../middleware/KeyTablesLogs")
 
router.get(
  "/getAPIList",
  protect,
  RolePermissionMiddleware("Api_List"),
  getAPIList
);
router.get("/getApiListExportData", getAPIListExportData);
router.get(
  "/getAPIDetailsById/:id",
  protect,
  RolePermissionMiddleware("Api_key_Details"),
  getAPIListById
);
router.get("/get-apikey-List/:id", protect,  getAPIkeyList);
router.get("/get-apikey-history-List/:id", protect, getAPIkeyhistoryList);
router.put("/apistatusupdate/:id", protect, apistatusupdate);
router.post("/gettestapi", gettestapi);
router.post("/addkey",  protect,keyTablesLogs("Add_Key"),addkey );
router.put("/updatekey/:id", protect,keyTablesLogs("Update_Key"),  updatekey);
router.post("/Delete-key/:id", protect,keyTablesLogs("Delete_Key"), deletekey);
router.post("/permanent-Delete-key/:id", protect,keyTablesLogs("Delete_Key"), permanentDeletekey);
router.post("/Restore-key/:id",  protect,keyTablesLogs("Restore_Key"), restorekey);
router.get("/Key-logs/:id", getKeyLogs);
router.get("/get-logs-details/:key",protect,RolePermissionMiddleware("Api_key_Details" ,"View_Logs"), getlogsDetails);
router.get("/get-logs-data/:key",protect,RolePermissionMiddleware("Api_key_Details" ,"View_Logs"), getlogsData);
router.get("/exportLogsData/:key", protect, getExportLogsData);
router.get("/generate-doc" ,generateDoc) 

module.exports = router;
