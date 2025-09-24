const API_Config = require("../models/APIConfigrationModel");
const connectDynamicDB = require("../config/GetdbConnection");

const getAPIbysearch = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const query = {
      $or: [
        { apiName: { $regex: search, $options: "i" } },
        { domainName: { $regex: search, $options: "i" } },
        { categoryName: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { applicationType: { $regex: search, $options: "i" } },
      ],
    };
    const data = await API_Config.find(query).sort({ _id: -1 });

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getDashboardData = async (req, res) => {
  console.log("req.query", req.query);
  const { ids, startDate, endDate } = req.query;
  console.log("req.query", req.query);
  const idArray = ids ? ids.split(",") : [];

  try {
    // 1️⃣ Fetch all configs
    const query = ids && idArray.length > 0 ? { _id: { $in: idArray } } : {};
    const configs = await API_Config.find(query, {
      _id: 1,
      dbName: 1,
      apiName: 1,
      domainName: 1,
    }).sort({ _id: -1 });

    const TotalApi = configs.length;
    let TotalLogs = 0;
    let TotalSuccessLog = 0;
    let TotalFailureLog = 0;

    // 2️⃣ Run all DB queries in parallel
    const results = await Promise.all(
      configs.map(async (config) => {
        try {
          // Dynamic DB connection
          const db = await connectDynamicDB(config.dbName);

          const logs_table = `logs_table_${new Date().getFullYear()}_${String(
            new Date().getMonth() + 1
          ).padStart(2, "0")}`;

          const logsCollection = db.collection(logs_table);
          console.log("logsCollection", logsCollection.collectionName);

          const baseQuery = {
            vendor_name: { $regex: new RegExp(config.domainName, "i") },
            key: {
              $nin: [
                "87p6t2X5S33SsqQXbYIx64ENGGpdtj1g8ZwppQWK",
                "ISF2IYKT",
                "act_internal_test",
              ],
            },
          };

          if (startDate && endDate) {
            baseQuery.request_time = {
              $gte: startDate,
              $lte: endDate,
            };
          }
          console.log("baseQuery", baseQuery);
          const statusGroups = {
            success: [200, 404],
            fail: [504, 408, 502, 500, 422, 429, 401, 400, 201, 410, 500],
          };

          // 3️⃣ Run aggregation (Mongoose returns array directly)
          const stats = await logsCollection.aggregate([
            { $match: baseQuery },
            {
              $group: {
                _id: null,
                totalCount: { $sum: 1 },
                successCount: {
                  $sum: {
                    $cond: [
                      { $in: ["$status_code", statusGroups.success] },
                      1,
                      0,
                    ],
                  },
                },
                failureCount: {
                  $sum: {
                    $cond: [{ $in: ["$status_code", statusGroups.fail] }, 1, 0],
                  },
                },
                 avgExecutionTime: { $avg: "$execution_time" }
              },
            },
          ]);
          const statsArray = await stats.toArray();
          console.log("statsArray", statsArray);
          // ✅ Ensure we handle empty result
          const {
            totalCount = 0,
            successCount = 0,
            failureCount = 0,
            avgExecutionTime=0
          } = statsArray && statsArray.length > 0 ? statsArray[0] : {};

          // update totals
          TotalLogs += totalCount;
          TotalSuccessLog += successCount;
          TotalFailureLog += failureCount;

          return {
            _id: config._id,
            dbName: config.dbName,
            apiName: config.apiName,
            totalCount,
            successCount,
            successPercentage:
              totalCount === 0
                ? 0
                : ((successCount / totalCount) * 100).toFixed(2),
            failureCount,
            failurePercentage:
              totalCount === 0
                ? 0
                : ((failureCount / totalCount) * 100).toFixed(2),
                avgExecutionTime
          };
        } catch (dbError) {
          console.error(
            `Error fetching logs for DB: ${config.dbName}`,
            dbError
          );
          return {
            _id: config._id,
            dbName: config.dbName,
            apiName: config.apiName,
            successCount: 0,
            totalCount: 0,
            successPercentage: 0,
            error: `Failed to fetch logs for ${config.dbName}`,
          };
        }
      })
    );

    // 4️⃣ Send response
    res.status(200).json({
      data: results,
      TotalApi,
      successCount: TotalSuccessLog,
      failureCount: TotalFailureLog,
      totalCount: TotalLogs,
    });
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    res.status(500).json({ message: error.message });
  }
};

const getAPIList = async (req, res) => {
  console.log("req.query", req.query);
  const { ids } = req.query;
  const idArray = ids ? ids.split(",") : [];
  try {
    const query = ids && idArray.length > 0 ? { _id: { $in: idArray } } : {};
    const configs = await API_Config.find(query, {
      _id: 1,
      dbName: 1,
      apiName: 1,
      domainName: 1,
    }).sort({ _id: -1 });
    console.log("configs", configs);
    res.status(200).json({ data: configs });
  } catch (error) {
    console.log("Error in getAPIList:", error);
    console.error("Error in getAPIList:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAPIbysearch,
  getDashboardData,
  getAPIList,
};
