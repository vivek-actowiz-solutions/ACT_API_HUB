const connectDynamicDB = require("../config/GetdbConnection");

const parseDate = (dtStr) => {
  const date = new Date(dtStr);
  if (isNaN(date.getTime())) throw new Error("Invalid date format");
  return date;
};

// ✅ /api/stats/live
 const getLiveStats = async (req, res) => {
  try {
    const {startDate, endDate, Endpoints } = req.query;
    console.log("req.query" , req.query )
    const fromTime = parseDate(startDate);
    const toTime = parseDate(endDate);
    console.log( "start and ned date " , fromTime ,toTime)
    const endpoint = Endpoints
    const db = await connectDynamicDB(process.env.NAVER_DB_NAME);
    const collection = db.collection(process.env.NAVER_COLLECTION_NAME);
    let matchStage = {
      request_time: { $gte: fromTime, $lte: toTime },
      "params.key": "N123A45ERTT",
    };

    // endpoint filtering
    if (endpoint === "PDP") {
      Object.assign(matchStage, {
        "params.channel_uid": { $exists: true },
        "params.product_id": { $exists: true },
      });
    } else if (endpoint === "Search") {
      matchStage["params.url"] = { $exists: true };
    } else if (endpoint === "SearchAll (web)") {
      matchStage["params.searchall_url"] = { $exists: true };
    } else if (endpoint === "SearchAll (mweb)") {
      matchStage["params.msearchall_url"] = { $exists: true };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $addFields: {
          coupon_flags: {
            $cond: [
              {
                $and: [
                  { $eq: ["$response.coupon_data.basic_benefits_count", true] },
                  { $eq: ["$response.coupon_data.sorted_home_benefits_count", true] },
                ],
              },
              1,
              0,
            ],
          },
          benefits_flags: {
            $cond: [{ $eq: ["$response.benefits_data", true] }, 1, 0],
          },
          coupon_basic: {
            $cond: [{ $eq: ["$response.coupon_data.basic_benefits_count", true] }, 1, 0],
          },
          coupon_sorted: {
            $cond: [{ $eq: ["$response.coupon_data.sorted_home_benefits_count", true] }, 1, 0],
          },
        },
      },
      {
        $group: {
          _id: "$status_code",
          count: { $sum: 1 },
          coupon_match_count: { $sum: "$coupon_flags" },
          benefits_match_count: { $sum: "$benefits_flags" },
          basic_benefits_count: { $sum: "$coupon_basic" },
          sorted_benefits_count: { $sum: "$coupon_sorted" },
        },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    const result = {
      status_200: 0,
      status_502: 0,
      status_404: 0,
      status_400: 0,
      status_401: 0,
      status_403: 0,
      status_500: 0,
      coupon_match_count: 0,
      benefits_match_count: 0,
      basic_benefits_count: 0,
      sorted_benefits_count: 0,
      successfull: 0,
      unsuccessfull: 0,
      total: 0,
      success_rate: 0,
    };

    const successStatuses = [200, 404];

    for (const r of results) {
      const code = r._id;
      const count = r.count;
      result[`status_${code}`] = count;
      result.coupon_match_count += r.coupon_match_count;
      result.benefits_match_count += r.benefits_match_count;
      result.basic_benefits_count += r.basic_benefits_count;
      result.sorted_benefits_count += r.sorted_benefits_count;

      if (successStatuses.includes(code)) result.successfull += count;
      else result.unsuccessfull += count;
    }

    result.total = result.successfull + result.unsuccessfull;
    result.success_rate =
      result.total > 0 ? ((result.successfull / result.total) * 100).toFixed(2) : 0;

    result.coupon_rate =
      result.status_200 > 0
        ? ((result.coupon_match_count / result.status_200) * 100).toFixed(2)
        : 0;
    result.benefits_rate =
      result.status_200 > 0
        ? ((result.benefits_match_count / result.status_200) * 100).toFixed(2)
        : 0;

    result.actual_request = result.successfull * 2 + result.benefits_match_count;

    res.json(result);
  } catch (err) {
    console.error("❌ Error in getLiveStats:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ /api/stats/latency
 const getLatencyStats = async (req, res) => {
  try {
    const { startDate, endDate, endpoint } = req.query;
    const fromTime = parseDate(startDate);
    const toTime = parseDate(endDate);
    const db = await connectDynamicDB(process.env.NAVER_DB_NAME);
    const collection = db.collection(process.env.NAVER_COLLECTION_NAME);

    let matchStage = {
      request_time: { $gte: fromTime, $lte: toTime },
      "params.key": "N123A45ERTT",
      latency: { $exists: true, $ne: 0.0 },
    };

    if (endpoint === "PDP") {
      matchStage["params.channel_uid"] = { $exists: true };
      matchStage["params.product_id"] = { $exists: true };
    } else if (endpoint === "Search") {
      matchStage["params.url"] = { $exists: true };
    } else if (endpoint === "SearchAll (web)") {
      matchStage["params.searchall_url"] = { $exists: true };
    } else if (endpoint === "SearchAll (mweb)") {
      matchStage["params.msearchall_url"] = { $exists: true };
    }

    const pipeline = [
      { $match: matchStage },
      { $group: { _id: null, avg_latency_sec: { $avg: "$latency" } } },
      {
        $project: {
          _id: 0,
          avg_latency_sec: { $round: ["$avg_latency_sec", 2] },
        },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();
    res.json(results[0] || {});
  } catch (err) {
    console.error("❌ Error in getLatencyStats:", err);
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  getLiveStats,
  getLatencyStats,
};