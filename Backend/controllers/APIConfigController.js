// const mongoose = require("mongoose");
// const API_Config = require("../models/APIConfigrationModel");
// const connectDynamicDB = require("../config/GetdbConnection");

// // Define your expected schemas
// const expectedkeySchema = {
//   key: "string",
//   usage: "number",
//   limit: "number",
//   status: "boolean",
//   name: "string",
// };

// const expectedLogSchema = {
//   ip: "string",
//   params: "object",
//   request_time: "string",
//   status_code: "number",
//   key: "string",
//   response: "object",
// };

// const getType = (value) => {
//   if (value === null) return "null";
//   if (Array.isArray(value)) return "array";
//   return typeof value;
// };

// const validateSchema = (doc, expected) => {
//   for (const key in expected) {
//     if (!(key in doc)) {
//       return `Missing field: "${key}"`;
//     }
//     const actualType = getType(doc[key]);
//     if (actualType !== expected[key]) {
//       return `Field "${key}" should be type "${expected[key]}", but got "${actualType}"`;
//     }
//   }
//   return null;
// };

// const apiconfigration = async (req, res) => {
//   const {
//     domainName,
//     categoryName,
//     type,
//     subType,
//     apiEndpoint,
//     method,
//     payload,
//     applicationType,
//     dbName,
//     country,
//   } = req.body;
//   const apiName =
//     req.body.domainName?.toUpperCase() +
//     "_" +
//     req.body.applicationType +
//     "_" +
//     req.body.type +
//     "_" +
//     req.body.subType +
//     "_" +
//     req.body.country;
//   console.log("Request Body:", req.body);

//   const conn = await connectDynamicDB(dbName);
//   // Use generic schema
//   const genericSchema = new mongoose.Schema({}, { strict: false });

//   // Dynamically reference both collections
//   const KeyModel = conn.model("key_tables", genericSchema, key_tables);
//   const LogModel = conn.model("logs_table", genericSchema, logs_table);

//   // Validate key schema
//   for (const doc of keyData) {
//     const plain = doc.toObject();
//     const error = validateSchema(plain, expectedkeySchema);
//     if (error) {
//       return res.status(400).json({
//         error: "Schema mismatch in key_table",
//         details: error,
//         document: plain,
//       });
//     }
//   }

//   // Validate logs schema
//   for (const doc of logData) {
//     const plain = doc.toObject();
//     const error = validateSchema(plain, expectedLogSchema);
//     if (error) {
//       return res.status(400).json({
//         error: "Schema mismatch in logs_Tables",
//         details: error,
//         document: plain,
//       });
//     }
//   }

//   // If schema valid, save to config
//   try {
//     const newConfig = new API_Config({
//       apiName,
//       domainName,
//       categoryName,
//       type,
//       subType,
//       apiEndpoint,
//       method,
//       payload,
//       applicationType,
//       dbName,
//       country,
//     });

//     console.log("this is new config", newConfig);
//     await newConfig.save();

//     res.status(200).json({
//       message: "✅ API config saved",
//     });
//   } catch (err) {
//     console.error("Mongo Error:", err.message);
//     res.status(500).json({
//       error: "MongoDB connection or query failed",
//       details: err.message,
//     });
//   }
// };

// module.exports = { apiconfigration };
const mongoose = require("mongoose");
const API_Config = require("../models/APIConfigrationModel");
const connectDynamicDB = require("../config/GetdbConnection");

// 1. Define expected schemas
// const expectedKeySchema = {
//   key: "string",
//   usage: "number",
//   limit: "number",
//   status: "boolean",
//   name: "string",
// };

// const expectedLogSchema = {
//   ip: "string",
//   params: "object",
//   request_time: "string",
//   response_time: "null",
//   request_id: "string",
//   status_code: "number",
//   key: "string",
//   vendor_name: "string",
//   execution_time:"number",
//   success: "boolean",
//   message: "null",
//   data: "object",
//   response: "object",
// };

// 2. Utility for checking types
// const getType = (value) => {
//   if (value === null) return "null";
//   if (Array.isArray(value)) return "array";
//   return typeof value;
// };

// 3. Generic schema validator
// const validateSchema = (doc, expected) => {
//   for (const key in expected) {
//     if (!(key in doc)) {
//       return `Missing field: "${key}"`;
//     }
//     const actualType = getType(doc[key]);
//     if (actualType !== expected[key]) {
//       return `Field "${key}" should be "${expected[key]}", but got "${actualType}"`;
//     }
//   }
//   return null;
// };

const apiconfigration = async (req, res) => {
  const {
    domainName,
    categoryName,
    type,
    subType,
    apiEndpoint,
    method,
    payload,
    applicationType,
    dbName,
    country,
    github_link ,
    header
  } = req.body;
console.log("req.body", req.body)
  if (
    !domainName ||
    !categoryName ||
    !type ||
    !subType ||
    !apiEndpoint ||
    !method ||
    !payload ||
    !applicationType ||
    !dbName ||
    !country ||
    !header
  ) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  const apiName = `${domainName?.toUpperCase()} | ${applicationType} | ${type} | ${subType} | ${country}`;

  try {
    const conn = await connectDynamicDB(dbName);
    const genericSchema = new mongoose.Schema({}, { strict: false });
 const logs_table = `logs_table_${new Date().getFullYear()}_${String(new Date().getMonth()+1).padStart(2,"0")}`;
    console.log("logs_table" , logs_table)
    const KeyModel = conn.model("key_tables", genericSchema, "key_tables");
    const LogModel = conn.model(`${logs_table}`, genericSchema, logs_table);

    // const keyData = await KeyModel.find({}).lean();
    // const logData = await LogModel.find({}).lean();
    // console.log("keyData.length", keyData.length);
    // console.log("logData.length", logData.length);

    // ✅ Validate key documents
    // for (const doc of keyData) {
    //   const error = validateSchema(doc, expectedKeySchema);
    //   if (error) {
    //     return res.status(400).json({
    //       message: "Schema mismatch in key_tables",
    //       // details: error,
    //       // document: doc,
    //     });
    //   }
    // }

    // ✅ Validate log documents (with rename logic)
    // for (const doc of logData) {
    //   if (
    //     doc.response &&
    //     doc.response.hasOwnProperty("excution_time") &&
    //     !doc.response.hasOwnProperty("execution_time")
    //   ) {
    //     // Optional auto-rename (remove if not needed)
    //     doc.response.execution_time = doc.response.excution_time;
    //     delete doc.response.excution_time;
    //   }

    //   const error = validateSchema(doc, expectedLogSchema);
    //   if (error) {
    //     console.log("Schema error in logs_table:", error);
    //     return res.status(400).json({
    //       message: "Schema mismatch in logs_table",
    //     });
    //   }
    // }

    // ✅ Save API configuration
    const newConfig = new API_Config({
      apiName,
      domainName,
      categoryName,
      type,
      subType,
      apiEndpoint,
      method,
      payload,
      header,
      applicationType,
      dbName,
      country,
      github_link
    });

    await newConfig.save();

    return res.status(200).json({ message: "API configration successfully" });
  } catch (err) {
    // console.log("Mongo Error:", err.message);
    // console.log(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = { apiconfigration };
