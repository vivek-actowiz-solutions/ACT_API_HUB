const API_Config = require("../models/APIConfigrationModel");
const key_tables_logs = require("../models/keytablesLogModel");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const axios = require("axios");
const moment = require("moment");
const { format } = require("date-fns");
const connectDynamicDB = require("../config/GetdbConnection");
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
// const { dateFormetter } = require("../util/dateFormetter");
// const dateFormatter = (input) => {
//   const date = new Date(input);
//   const pad = (n) => n.toString().padStart(2, "0");

//   const yyyy = date.getFullYear();
//   const mm = pad(date.getMonth() + 1);
//   const dd = pad(date.getDate());
//   const hh = pad(date.getHours());
//   const mi = pad(date.getMinutes());
//   const ss = pad(date.getSeconds());

//   return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
// };

const getAPIList = async (req, res) => {
  const permission = res.locals.permissions;
  const rolelevel = req.user.Rolelevel;
  console.log("rolelevel", rolelevel);
  console.log("permission in my api", permission);
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {
      $or: [
        { apiName: { $regex: search, $options: "i" } },
        { domainName: { $regex: search, $options: "i" } },
        { categoryName: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { applicationType: { $regex: search, $options: "i" } },
      ],
    };
    if (rolelevel === 4) {
      query.customers = { $elemMatch: { customerId: req.user.id } };
    }

    const skip = (page - 1) * limit;
    const data = await API_Config.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await API_Config.countDocuments(query);

    res.status(200).json({ data, total, permission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAPIListExportData = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const rolelevel = req.user.Rolelevel;
    const query = {
      $or: [
        { apiName: { $regex: search, $options: "i" } },
        { domainName: { $regex: search, $options: "i" } },
        { categoryName: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { applicationType: { $regex: search, $options: "i" } },
      ],
    };
    if (rolelevel === 4) {
      query.customers = { $elemMatch: { customerId: req.user.id } };
    }
    const data = await API_Config.find(query);

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const apistatusupdate = async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  try {
    const key = await API_Config.findById(id);

    if (!key) return res.status(404).json({ message: "Key not found" });
    key.status = status;
    await key.save();
    res.status(200).json({ message: "Key status updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};
const addcustomerToAPI = async (req, res) => {
  const id = req.params.id;
  const customers = req.body; // Expecting an array of { customerId, customerName }

  console.log("📥 Received Customers:", customers);

  if (!Array.isArray(customers)) {
    return res.status(400).json({
      message: "Request body must be an array of customers",
    });
  }

  try {
    // Find API config by id
    const apiConfig = await API_Config.findById(id);
    if (!apiConfig) {
      return res.status(404).json({ message: "API Config not found" });
    }

    // If no customers provided, clear all
    if (customers.length === 0) {
      console.log("⚠️ No customers received, clearing database list.");

      apiConfig.customers = [];
      await apiConfig.save();

      return res.status(200).json({
        success: true,
        message: "No customers provided. Database cleared.",
        data: apiConfig,
      });
    }

    // Track changes
    let addedCustomers = [];
    let updatedCustomers = [];
    let removedCustomers = [];

    // --- 1️⃣ Remove customers not in new list ---
    const newIds = customers.map((c) => c.customerId.toString());
    const existingIds = apiConfig.customers.map((c) => c.customerId.toString());

    // Find which existing customers should be removed
    removedCustomers = apiConfig.customers.filter(
      (c) => !newIds.includes(c.customerId.toString())
    );

    // Keep only those present in new list
    apiConfig.customers = apiConfig.customers.filter((c) =>
      newIds.includes(c.customerId.toString())
    );

    // --- 2️⃣ Add or update existing ---
    for (const cust of customers) {
      const { customerId, customerName } = cust;
      if (!customerId || !customerName) continue;

      const existing = apiConfig.customers.find(
        (c) => c.customerId.toString() === customerId
      );

      if (existing) {
        // Update name if changed
        if (existing.customerName !== customerName) {
          existing.customerName = customerName;
          updatedCustomers.push(cust);
        }
      } else {
        // Add new
        apiConfig.customers.push({ customerId, customerName });
        addedCustomers.push(cust);
      }
    }

    await apiConfig.save();

    res.status(200).json({
      success: true,
      message: "Customer list synced successfully",
      added: addedCustomers,
      updated: updatedCustomers,
      removed: removedCustomers,
      totalCustomers: apiConfig.customers.length,
      data: apiConfig,
    });
  } catch (err) {
    console.error("❌ Error in addcustomerToAPI:", err);
    res
      .status(500)
      .json({ message: err.message || "Internal Server Error" });
  }
};
// const getAPIListById = async (req, res) => {
//   const id = req.params.id;
//   const { page = 1, limit = 10, search = "" } = req.query;
//   const skip = (parseInt(page) - 1) * parseInt(limit);

//   let conn;

//   try {
//     const data = await API_Config.findById(id);
//     if (!data) return res.status(404).json({ error: "API config not found" });

//     const { mongoURI, dbName, collectionName } = data;

//     const [keyCollection, logCollection] = collectionName
//       .split(",")
//       .map((name) => name.trim());

//     conn = await mongoose.createConnection(mongoURI, {
//       dbName,
//     });

//     const genericSchema = new mongoose.Schema({}, { strict: false });
//     const KeyModel = conn.model("KeyCollection", genericSchema, keyCollection);
//     const LogModel = conn.model("LogCollection", genericSchema, logCollection);

//     // Optional search filter
//     const keyFilter = search ? { key: { $regex: search, $options: "i" } } : {};

//     const keyDocs = await KeyModel.find(keyFilter)
//       .skip(skip)
//       .limit(parseInt(limit));

//     const totalKeyDocs = await KeyModel.countDocuments(keyFilter);

//     const logData = await LogModel.find({}).limit(20); // No pagination for logs

//     res.status(200).json({
//       data,
//       keyData: {
//         docs: keyDocs,
//         totalDocs: totalKeyDocs,
//         page: parseInt(page),
//         limit: parseInt(limit),
//       },
//       logData,
//     });
//   } catch (error) {
//     console.error("Error fetching API config data:", error.message);
//     res.status(500).json({ error: error.message });
//   } finally {
//     if (conn && typeof conn.close === "function") {
//       await conn.close();
//     }
//   }
// };
const getAPIListById = async (req, res) => {
  const id = req.params.id;
  const permission = res.locals.permissions;
  console.log("permission in my api", permission);
  // const { page = 1, limit = 10, search = "" } = req.query;
  // const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const data = await API_Config.findById(id);
    if (!data) return res.status(404).json({ message: "API config not found" });

    // const { dbName } = data;
    // console.log("dbName", dbName);

    // const conn = await connectDynamicDB(dbName);
    // const key_tables = new mongoose.Schema({}, { strict: false });
    // const KeyModel = conn.models["key_tables"]
    //   ? conn.model("key_tables")
    //   : conn.model("key_tables", key_tables);

    // const keyFilter = search ? { key: { $regex: search, $options: "i" } } : {};

    // const [keyDocs, totalKeyDocs] = await Promise.all([
    //   KeyModel.find(keyFilter).skip(skip).limit(parseInt(limit)),
    //   KeyModel.countDocuments(keyFilter),
    // ]);

    res.status(200).json({
      data: data,
      permission,
      // keyData: {
      //   docs: keyDocs,
      //   totalDocs: totalKeyDocs,
      //   page: parseInt(page),
      //   limit: parseInt(limit),
      // },
    });
  } catch (error) {
    // console.error("Error in getAPIListById:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const getAPIkeyList = async (req, res) => {
  const { id } = req.params;
  const permission = res.locals.permissions;
  const rolelevel = req.user.Rolelevel;
  const clientName = req.user.name;
  const { page = 1, limit = 10, search = "" } = req.query;
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  try {
    const config = await API_Config.findById(id).lean();
    if (!config) {
      return res.status(404).json({ message: "API config not found" });
    }
    const { dbName } = config;
    const conn = await connectDynamicDB(dbName);

    const KeyModel = conn.collection("key_tables");

    let keyFilter = { deletedAt: null };
    if (rolelevel === 4) {
      keyFilter.name = clientName;
    }
    if (search && search.trim()) {
      // Apply search for other roles
      keyFilter.$or = [
        { key: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const [docs, totalDocs] = await Promise.all([
      KeyModel.find(keyFilter).skip(skip).limit(limitNumber).toArray(),
      KeyModel.countDocuments(keyFilter),
    ]);

    res.status(200).json({
      keyData: {
        docs,
        totalDocs,
        page: pageNumber,
        limit: limitNumber,
      },
      permission
    });
  } catch (err) {
    // console.error(" getAPIkeyList error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
const getAPIkeyhistoryList = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10, search = "" } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  try {
    // Step 1: Get API Configuration
    const config = await API_Config.findById(id).lean();
    if (!config) {
      return res.status(404).json({ message: "API config not found" });
    }
    const { dbName } = config;
    const conn = await connectDynamicDB(dbName);
    const KeyModel = conn.collection("key_tables");
    // const keyFilter = search.trim()
    //   ? {
    //       $or: [
    //         { key: { $regex: search, $options: "i" } },
    //         { name: { $regex: search, $options: "i" } },
    //       ],
    //     }
    //   : {};
    const keyFilter = search.trim()
      ? {
          $and: [
            { deletedAt: { $ne: null } }, // only active docs
            {
              $or: [
                { key: { $regex: search, $options: "i" } },
                { name: { $regex: search, $options: "i" } },
              ],
            },
          ],
        }
      : { deletedAt: { $ne: null } };

    const [docs, totalDocs] = await Promise.all([
      KeyModel.find(keyFilter).skip(skip).limit(limitNumber).toArray(),
      KeyModel.countDocuments(keyFilter),
    ]);

    res.status(200).json({
      keyData: {
        docs,
        totalDocs,
        page: pageNumber,
        limit: limitNumber,
      },
    });
  } catch (err) {
    console.log(" getAPIkeyList error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
const gettestapi = async (req, res) => {
  const { method, apiEndpoint, payload, headers = {} } = req.body;
  console.log("Incoming API Request:", {
    method,
    apiEndpoint,
    payload,
    headers,
  });

  // Validate input
  // if (!method || !apiEndpoint) {
  //   return res
  //     .status(400)
  //     .json({ message: "Missing required fields" });
  // }

  try {
    const start = Date.now();
    const response = await axios({
      method: method.toLowerCase(),
      url: apiEndpoint,
      headers:
        headers && Object.keys(headers).length > 0
          ? headers
          : {
              "Content-Type": "application/json",
            },
      data: payload,
    });
    console.log("API Response:", response.data);
    console.log("API Response:", response);
    const end = Date.now(); // ⏱️ End timing
    const executionTime = end - start; // ⌛ Execution time in ms

    const rawData = JSON.stringify(response.data);
    const sizeInKB =
      (Buffer.byteLength(rawData, "utf8") / 1024).toFixed(2) + " KB";
    return res.status(200).json({
      status: response.status,
      statusText: response.statusText,
      executionTime: `${executionTime} ms`,
      size: sizeInKB,
      headers: response.headers,
      data: response.data,
    });
  } catch (error) {
    // console.log("Error:", error);
    console.log("Error:", error.response.data);
    const end = Date.now();
    const executionTime =
      end - (error.config?.metadata?.startTime || Date.now());
    return res.status(error.response?.status || 500).json({
      status: error.response?.status || 500,
      executionTime: `${executionTime} ms`,
      message: error.message,
      details: error.response?.data || null,
    });
  }
};

const addkey = async (req, res) => {
  const { API_id, key, limit, status, name } = req.body;

  if (!API_id || !key || !limit || !status)
    return res.status(400).json({ message: "Missing required fields" });

  // console.log("Incoming Add Key:", { API_id, key, limit, status });

  try {
    // 1. Get API config by ID
    const apiConfig = await API_Config.findById(API_id);
    if (!apiConfig)
      return res.status(404).json({ message: "API config not found" });

    const { dbName } = apiConfig;

    const conn = await connectDynamicDB(dbName);

    const KeyModel = conn.collection("key_tables");
    // 4. Create a new document
    const newKey = {
      name,
      key,
      limit,
      usage: 0,
      status,
    };
    const result = await KeyModel.insertOne(newKey);
    if (result.insertedId) {
      return res.status(201).json({
        success: true,
        message: "Key created successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to create key",
      });
    }
  } catch (error) {
    // console.error("Add key error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
const updatekey = async (req, res) => {
  const { API_id, limit, status } = req.body;
  const key_id = req.params.id;

  try {
    // Get API config
    const data = await API_Config.findById(API_id);
    if (!data) return res.status(404).json({ message: "API config not found" });

    const { dbName } = data;
    const conn = await connectDynamicDB(dbName);
    const KeyModel = conn.collection("key_tables");

    const updatedKey = await KeyModel.findOneAndUpdate(
      { _id: new ObjectId(key_id) },
      { $set: { limit, status } },
      { returnDocument: "after" }
    );

    if (!updatedKey) return res.status(404).json({ error: "Key not found" });

    res.status(200).json({ message: "Key updated successfully", updatedKey });
  } catch (error) {
    // console.error("Update error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const deletekey = async (req, res) => {
  const { API_id } = req.body;
  const key_id = req.params.id;

  try {
    // 1. Get API config
    const apiConfig = await API_Config.findById(API_id);
    if (!apiConfig)
      return res.status(404).json({ message: "API config not found" });

    const { dbName } = apiConfig;

    const conn = await connectDynamicDB(dbName);
    const KeyModel = conn.collection("key_tables");

    const deletedKey = await KeyModel.findOneAndUpdate(
      { _id: new ObjectId(key_id) },
      { $set: { deletedAt: new Date() } },
      { returnDocument: "after" }
    );
    if (!deletedKey) return res.status(404).json({ message: "Key not found" });

    res.status(200).json({ message: "Key deleted successfully", deletedKey });
  } catch (error) {
    // console.error("Delete error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
const permanentDeletekey = async (req, res) => {
  const { API_id } = req.body;
  const key_id = req.params.id;

  try {
    // 1. Get API config
    const apiConfig = await API_Config.findById(API_id);
    if (!apiConfig)
      return res.status(404).json({ message: "API config not found" });

    const { dbName } = apiConfig;

    const conn = await connectDynamicDB(dbName);
    // 3. Define dynamic model

    const KeyModel = conn.collection("key_tables");

    // 4. Delete the key
    // const deletedKey = await KeyModel.findByIdAndDelete(key_id);
    const deletedKey = await KeyModel.findOneAndDelete({
      _id: new ObjectId(key_id),
    });
    if (!deletedKey) return res.status(404).json({ message: "Key not found" });

    res.status(200).json({ message: "Key deleted successfully", deletedKey });
  } catch (error) {
    // console.error("Delete error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
const restorekey = async (req, res) => {
  const { API_id } = req.body;
  const key_id = req.params.id;

  try {
    // 1. Get API config
    const apiConfig = await API_Config.findById(API_id);
    if (!apiConfig)
      return res.status(404).json({ message: "API config not found" });

    const { dbName } = apiConfig;

    const conn = await connectDynamicDB(dbName);

    const KeyModel = conn.collection("key_tables");
    const restoredKey = await KeyModel.findOneAndUpdate(
      { _id: new ObjectId(key_id) },
      { $set: { deletedAt: null } },
      { returnDocument: "after" }
    );
    if (!restoredKey) return res.status(404).json({ message: "Key not found" });

    res.status(200).json({ message: "Key restored successfully", restoredKey });
  } catch (error) {
    // console.error("Delete error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
const getKeyLogs = async (req, res) => {
  const key_id = req.params.id;
  console.log("key_id", key_id);
  try {
    const keyLogs = await key_tables_logs
      .find({ keyId: key_id })
      .populate("changedBy", "name") // only bring `name` from User model
      .select("action timestamp changedBy") // only needed fields
      .sort({ timestamp: -1 })
      .lean();
    res.status(200).json({ message: "Key logs found", keyLogs });
  } catch (error) {
    // console.error("Delete error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// const getlogsDetails = async (req, res) => {
//   const key = String(req.params.key);
//   const { id, startDate, endDate, status, domain } = req.query;
//   console.log("📥 Received Query Params:", req.query);

//   try {
//     // 1. Get key config
//     const keyData = await API_Config.findById(id);
//     if (!keyData) return res.status(404).json({ message: "Key not found" });

//     const dbName = keyData.dbName;
//     const conn = await connectDynamicDB(dbName);
//     const logs_table = `logs_table_${new Date().getFullYear()}_${String(
//       new Date().getMonth() + 1
//     ).padStart(2, "0")}`;
//     const LogModel = conn.collection(`${logs_table}`);

//        const collections = await conn.listCollections().toArray();
//     const logCollections = collections
//       .map((c) => c.name)
//       .filter((name) => name.startsWith("logs_table_"));
// console.log("logCollections",logCollections);
//     // 3. Query filters
//     const query = { key, vendor_name: domain };
//     if (startDate && endDate) {
//       query.request_time = {
//         $gte: format(new Date(startDate), "yyyy-MM-dd HH:mm:ss"),
//         $lte: format(new Date(endDate), "yyyy-MM-dd HH:mm:ss"),
//       };
//     }
//     if (status) {
//       query.status_code = parseInt(status, 10); // convert string to integer
//     }

//      const totalDocs = await LogModel.countDocuments(query);

//    const allLogs = await LogModel
//       .find(query, { projection: { request_time: 1, status_code: 1 } })
//       .toArray();

//     const statusGroups = {
//       success: [200, 404],
//       fail: [504, 408, 502, 500, 422, 429, 401, 400, 201, 410, 500],
//     };

//     // Determine which codes to count based on filter
//     let filteredQuery = { ...query };
//     let successCount = 0;
//     let failureCount = 0;

//     // If a specific status is selected
//     if (status) {
//       const statusInt = parseInt(status, 10);
//       filteredQuery.status_code = statusInt;

//       if (statusGroups.success.includes(statusInt))
//         successCount = await LogModel.countDocuments(filteredQuery);
//       else if (statusGroups.fail.includes(statusInt))
//         failureCount = await LogModel.countDocuments(filteredQuery);
//       // N/A codes can be counted separately if needed
//     } else {
//       // No filter selected → count all grouped by Success/Fail
//       [successCount, failureCount] = await Promise.all([
//         LogModel.countDocuments({
//           ...filteredQuery,
//           status_code: { $in: statusGroups.success },
//         }),
//         LogModel.countDocuments({
//           ...filteredQuery,
//           status_code: { $in: statusGroups.fail },
//         }),
//       ]);
//     }

//     // Calculate percentages safely
//     const total = successCount + failureCount || 1;
//     const successPercentage = ((successCount / total) * 100).toFixed(2);
//     const failurePercentage = ((failureCount / total) * 100).toFixed(2);

//     // 7. Build chart buckets
//     let chartMap = {};
//     let fullLabels = [];

//     let start = startDate
//       ? moment(startDate).startOf("day")
//       : moment().subtract(14, "days").startOf("day");
//     let end = endDate ? moment(endDate).endOf("day") : moment().endOf("day");

//     let durationInDays = end.diff(start, "days", true);
//     let useHourly = durationInDays <= 2;

//     if (useHourly) {
//       // 3-hour intervals
//       let current = start.clone();
//       while (current <= end) {
//         const label = current.format("YYYY-MM-DD HH:00");
//         fullLabels.push(label);
//         chartMap[label] = { interval: label, total: 0, success: 0, failure: 0 };
//         current.add(3, "hours");
//       }

//       allLogs.forEach((log) => {
//         const logTime = moment(log.request_time);
//         const bucketHour = logTime
//           .startOf("hour")
//           .subtract(logTime.hour() % 3, "hours");
//         const label = bucketHour.format("YYYY-MM-DD HH:00");

//         const status = log.status_code;
//         if (chartMap[label]) {
//           chartMap[label].total++;
//           if (status === 200) chartMap[label].success++;
//           else chartMap[label].failure++;
//         }
//       });
//     } else {
//       // Daily intervals
//       let current = start.clone();
//       while (current <= end) {
//         const label = current.format("YYYY-MM-DD");
//         fullLabels.push(label);
//         chartMap[label] = { interval: label, total: 0, success: 0, failure: 0 };
//         current.add(1, "day");
//       }

//       allLogs.forEach((log) => {
//         const date = moment(log.request_time).format("YYYY-MM-DD");
//         const status = log.status_code;
//         if (chartMap[date]) {
//           chartMap[date].total++;
//           if (status === 200) chartMap[date].success++;
//           else chartMap[date].failure++;
//         }
//       });
//     }

//     const formattedChartData = fullLabels.map((label) => chartMap[label]);

//     // 8. Send response
//     res.status(200).json({
//       data: keyData,
//       logdata: {
//         totalDocs,
//         successPercentage,
//         successCount,
//         failurePercentage,
//         failureCount,
//         chartData: formattedChartData,
//       },
//       message: "Logs fetched successfully",
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message || "Server error" });
//   }
// };

const getlogsDetails = async (req, res) => {
  const key = String(req.params.key);
  const { id, startDate, endDate, status, domain } = req.query;
  console.log("📥 Received Query Params:", req.query);

  try {
    // 1. Get key config
    const keyData = await API_Config.findById(id);
    if (!keyData) return res.status(404).json({ message: "Key not found" });

    const dbName = keyData.dbName;
    const conn = await connectDynamicDB(dbName);

    // 2. List all collections
    const collections = await conn.listCollections().toArray();
    const existingCollections = collections
      .map((c) => c.name)
      .filter((name) => name.startsWith("logs_table_"));

    // 3. Determine which collections to query based on startDate/endDate
    let logCollections = [];
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      while (current <= end) {
        const collectionName = `logs_table_${current.getFullYear()}_${String(
          current.getMonth() + 1
        ).padStart(2, "0")}`;
        if (existingCollections.includes(collectionName)) {
          logCollections.push(collectionName);
        }
        current.setMonth(current.getMonth() + 1);
      }
    } else {
      // Default to current month
      const now = new Date();
      const collectionName = `logs_table_${now.getFullYear()}_${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;
      if (existingCollections.includes(collectionName)) {
        logCollections.push(collectionName);
      }
    }

    console.log("Collections to query:", logCollections);

    if (!logCollections.length) {
      return res
        .status(404)
        .json({ message: "No logs found for the selected date range" });
    }

    // 4. Build query filters
    const query = { key, vendor_name: domain };
    if (startDate && endDate) {
      query.request_time = {
        $gte: format(new Date(startDate), "yyyy-MM-dd HH:mm:ss"),
        $lte: format(new Date(endDate), "yyyy-MM-dd HH:mm:ss"),
      };
    }
    if (status) {
      query.status_code = parseInt(status, 10);
    }

    // 5. Aggregate logs across all relevant collections
    let allLogs = [];
    for (const collName of logCollections) {
      const LogModel = conn.collection(collName);
      const logs = await LogModel.find(query, {
        projection: { request_time: 1, status_code: 1 },
      }).toArray();
      allLogs = allLogs.concat(logs);
    }

    const totalDocs = allLogs.length;

    // 6. Count success/failure
    const statusGroups = {
      success: [200, 404],
      fail: [504, 408, 502, 500, 422, 429, 401, 400, 201, 410],
    };

    let successCount = allLogs.filter((log) =>
      statusGroups.success.includes(log.status_code)
    ).length;
    let failureCount = allLogs.filter((log) =>
      statusGroups.fail.includes(log.status_code)
    ).length;

    // If specific status filter applied
    if (status) {
      const statusInt = parseInt(status, 10);
      successCount = statusGroups.success.includes(statusInt)
        ? allLogs.length
        : 0;
      failureCount = statusGroups.fail.includes(statusInt) ? allLogs.length : 0;
    }

    const total = successCount + failureCount || 1;
    const successPercentage = ((successCount / total) * 100).toFixed(2);
    const failurePercentage = ((failureCount / total) * 100).toFixed(2);

    // 7. Build chart data (hourly if <= 2 days, else daily)
    let chartMap = {};
    let fullLabels = [];
    let startMoment = startDate
      ? moment(startDate).startOf("day")
      : moment().subtract(14, "days").startOf("day");
    let endMoment = endDate
      ? moment(endDate).endOf("day")
      : moment().endOf("day");

    let durationInDays = endMoment.diff(startMoment, "days", true);
    let useHourly = durationInDays <= 2;

    if (useHourly) {
      let current = startMoment.clone();
      while (current <= endMoment) {
        const label = current.format("YYYY-MM-DD HH:00");
        fullLabels.push(label);
        chartMap[label] = { interval: label, total: 0, success: 0, failure: 0 };
        current.add(3, "hours");
      }

      allLogs.forEach((log) => {
        const logTime = moment(log.request_time);
        const bucketHour = logTime
          .startOf("hour")
          .subtract(logTime.hour() % 3, "hours");
        const label = bucketHour.format("YYYY-MM-DD HH:00");

        if (chartMap[label]) {
          chartMap[label].total++;
          if (statusGroups.success.includes(log.status_code))
            chartMap[label].success++;
          else chartMap[label].failure++;
        }
      });
    } else {
      let current = startMoment.clone();
      while (current <= endMoment) {
        const label = current.format("YYYY-MM-DD");
        fullLabels.push(label);
        chartMap[label] = { interval: label, total: 0, success: 0, failure: 0 };
        current.add(1, "day");
      }

      allLogs.forEach((log) => {
        const date = moment(log.request_time).format("YYYY-MM-DD");
        if (chartMap[date]) {
          chartMap[date].total++;
          if (statusGroups.success.includes(log.status_code))
            chartMap[date].success++;
          else chartMap[date].failure++;
        }
      });
    }

    const formattedChartData = fullLabels.map((label) => chartMap[label]);

    // 8. Send response
    res.status(200).json({
      data: keyData,
      logdata: {
        totalDocs,
        successPercentage,
        successCount,
        failurePercentage,
        failureCount,
        chartData: formattedChartData,
      },
      message: "Logs fetched successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// const getlogsData = async (req, res) => {
//   const key = String(req.params.key);
//   const { id, startDate, endDate, status, domain } = req.query;
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 10;
//   const skip = (page - 1) * limit;

//   try {
//     // 1. Get key config
//     const keyData = await API_Config.findById(id);
//     if (!keyData) return res.status(404).json({ message: "Key not found" });

//     const dbName = keyData.dbName;
//     const conn = await connectDynamicDB(dbName);

//     // 2. Logs model

//     const logs_table = `logs_table_${new Date().getFullYear()}_${String(
//       new Date().getMonth() + 1
//     ).padStart(2, "0")}`;
//     const LogModel = conn.collection(`${logs_table}`);

//     // 3. Query filters
//     const query = { key, vendor_name: domain };
//   if (startDate && endDate) {
//       query.request_time = {
//         $gte: format(new Date(startDate), "yyyy-MM-dd HH:mm:ss"),
//         $lte: format(new Date(endDate), "yyyy-MM-dd HH:mm:ss"),
//       };
//     }

//      if (status) query.status_code = parseInt(status, 10);

//       const totalDocs = await LogModel.countDocuments(query);
//        const logs = await LogModel.find(query)
//       .sort({ _id: -1 })
//       .skip(skip)
//       .limit(limit)
//       .toArray();

//     // 8. Send response
//     res.status(200).json({
//       data: keyData,
//       logdata: {
//         data: logs,
//         totalDocs,
//         currentPage: page,
//         limit,
//       },
//       message: "Logs fetched successfully",
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message || "Server error" });
//   }
// };

const getlogsData = async (req, res) => {
  console.log("📥 getlogsData called");

  const key = String(req.params.key);
  const {
    id,
    startDate,
    endDate,
    status,
    domain,
    page = 1,
    limit = 10,
  } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    // 1️⃣ Get key config
    const keyData = await API_Config.findById(id);
    if (!keyData) {
      return res.status(404).json({ message: "Key not found" });
    }

    const dbName = keyData.dbName;
    const conn = await connectDynamicDB(dbName);

    // 2️⃣ Get existing collections
    const collections = await conn.listCollections().toArray();
    const existingCollections = collections
      .map((c) => c.name)
      .filter((name) => name.startsWith("logs_table_"));

    // 3️⃣ Determine collections to query (based on date range)
    let logCollections = [];

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      while (current <= end) {
        const collectionName = `logs_table_${current.getFullYear()}_${String(
          current.getMonth() + 1
        ).padStart(2, "0")}`;
        if (existingCollections.includes(collectionName)) {
          logCollections.push(collectionName);
        }
        current.setMonth(current.getMonth() + 1);
      }
    } else {
      // Default: current month collection
      const now = new Date();
      const collectionName = `logs_table_${now.getFullYear()}_${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;
      if (existingCollections.includes(collectionName)) {
        logCollections.push(collectionName);
      }
    }

    if (logCollections.length === 0) {
      return res.status(200).json({
        data: keyData,
        logdata: {
          data: [],
          totalDocs: 0,
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
        message: "No log collections found for given date range",
      });
    }

    console.log("🗂 Collections to query:", logCollections);

    // 4️⃣ Build base query
    const baseQuery = { key };
    if (domain) baseQuery.vendor_name = domain;
    if (status) baseQuery.status_code = parseInt(status, 10);

    // If date range provided
    if (startDate && endDate) {
      baseQuery.request_time = {
        $gte: format(new Date(startDate), "yyyy-MM-dd HH:mm:ss"),
        $lte: format(new Date(endDate), "yyyy-MM-dd HH:mm:ss"),
      };
    }

    // 5️⃣ Fetch logs from each collection
    let allLogs = [];
    let totalDocs = 0;

    for (const collectionName of logCollections) {
      const collection = conn.collection(collectionName);

      const collectionCount = await collection.countDocuments(baseQuery);
      totalDocs += collectionCount;

      console.log(`📊 ${collectionName} → ${collectionCount} docs`);

      if (collectionCount > 0) {
        const logs = await collection
          .find(baseQuery)
          .sort({ _id: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .toArray();

        console.log(`📜 ${collectionName} logs fetched:`, logs.length);
        allLogs.push(...logs);
      }
    }

    // 6️⃣ Combine, sort, and paginate globally
    allLogs.sort((a, b) => b._id.getTimestamp() - a._id.getTimestamp());

    // Optional: Global pagination (if multiple collections overlap)
    const paginatedLogs = allLogs.slice(0, parseInt(limit));

    // 7️⃣ Send response
    res.status(200).json({
      data: keyData,
      logdata: {
        data: paginatedLogs,
        totalDocs,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
      message: "✅ Logs fetched successfully",
    });
  } catch (err) {
    console.error("❌ Error fetching logs:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

const getExportLogsData = async (req, res) => {
  console.log("getExportLogsData called");

  const key = String(req.params.key);
  const { id, startDate, endDate, status } = req.query;
  console.log("📥 Received Query Params:", req.query);

  try {
    // 1. Get key config
    const keyData = await API_Config.findById(id);
    if (!keyData) return res.status(404).json({ message: "Key not found" });

    const dbName = keyData.dbName;
    const domain = keyData.domainName;
    console.log("📦 Target DB:", dbName);

    // 2. Connect to target DB
    const conn = await connectDynamicDB(dbName);

    // 3. Log model
    const logSchema = new mongoose.Schema({}, { strict: false });
    const logs_table = `logs_table_${new Date().getFullYear()}_${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}`;
    const LogModel = conn.model(`${logs_table}`, logSchema, `${logs_table}`);
    // const LogModel = conn.model("logs_table", logSchema, "logs_table");

    // 4. Build Query
    const query = { key, vendor_name: domain };

    if (startDate && endDate) {
      query.request_time = {
        $gte: startDate,
        $lte: endDate,
      };
    }
    const result = await LogModel.aggregate([
      { $match: query },
      { $sort: { _id: -1 } },
    ]);

    // Extract results

    // 7. Send response
    res.status(200).json({
      data: result,
      message: "Logs fetched successfully",
    });

    // console.log("formattedChartData", formattedChartData);
  } catch (err) {
    // console.error("❌ Error in getKeyDetails:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};
const generateDoc = async (req, res) => {
  try {
    // 1. Load template
    const templatePath = path.join(__dirname, "../templates/demo_doc.docx");
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);

    // 2. Render with data
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    doc.render({
      API_NAME: "Sample API",
      API_KEY: "12345-ABCDE",
      API_PARAMS: "{param1: value1, param2: value2}",
      API_METHOD: "POST",
      API_ENDPOINT: "https://api.example.com/endpoint",
      API_CURL:
        'curl -X POST https://api.example.com/endpoint -H \'Content-Type: application/json\' -d \'{"param1":"value1","param2":"value2"}\'',
      API_RESPONSE: "{status: success, data: {id: 1, name: Sample API}}",
    });

    // 3. Generate buffer
    const buf = doc.getZip().generate({ type: "nodebuffer" });

    res.set({
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename=${Date.now()}_Guide.docx`,
    });
    res.send(buf);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating document");
  }
};

const getcustomerbysearch = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const users = await mongoose.connection.db
      .collection("users")
      .aggregate([
        {
          $lookup: {
            from: "roles", // roles collection
            localField: "roleId", // field in users
            foreignField: "_id", // field in roles
            as: "roleInfo",
          },
        },
        { $unwind: "$roleInfo" }, // flatten role array
        {
          $match: {
            "roleInfo.roleName": "Customer",
            name: { $regex: search, $options: "i" },
          },
        }, // filter by role and search
        { $project: { _id: 1, name: 1 } }, // only return id and name
      ])
      .toArray();

    res
      .status(200)
      .json({ data: users, message: "Users fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Apisampledata = async (req, res) => {
  const id = req.params.id;

  try {
    const apiData = await API_Config.findById(id);
    if (!apiData) return res.status(404).json({ message: "API not found" });

    const sampleFilePath = apiData.sampleFile;
    if (!sampleFilePath)
      return res.status(400).json({ message: "Sample file not provided" });

    const fullPath = path.resolve(sampleFilePath);
    if (!fs.existsSync(fullPath))
      return res.status(404).json({ message: "Sample file not found" });

    // Read Excel file
    const workbook = XLSX.readFile(fullPath);
    const sheetName = workbook.SheetNames[0]; // get first sheet
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet); // convert to JSON




    res.status(200).json({
      count: jsonData.length,
      data: jsonData,

      message: "Excel file read successfully",
    });
  } catch (err) {
    console.error("❌ Error reading sample file:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

module.exports = {
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
  restorekey,
  getKeyLogs,
  generateDoc,
  getlogsData,
  permanentDeletekey,
  getcustomerbysearch,
  addcustomerToAPI,
  Apisampledata,
};
