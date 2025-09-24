// // config/dynamicDB.js
// const mongoose = require("mongoose");

// // const connectionCache = new Map();

// const connectDynamicDB = async (dbName) => {
//   const baseURI = process.env.MONGO_URI;
//   // Same server
//   const fullURI = `${baseURI}/${dbName}?authSource=admin`;

//   console.log(`📥 Connecting to dynamic DB: ${fullURI}`);

//   // if (connectionCache.has(fullURI)) {
//   //   return connectionCache.get(fullURI);
//   // }

//   const connection = await mongoose.createConnection(fullURI, {});

//   // connectionCache.set(fullURI, connection);
//   console.log(`✅ Connected to dynamic DB: ${dbName}`);
//   return connection;
// };

// module.exports = connectDynamicDB;
// const mongoose = require("mongoose");

// const connectDynamicDB = async (dbName) => {
//   const baseURI = process.env.MONGO_URI;
//   const fullURI = `${baseURI}/${dbName}?authSource=admin`;

//   console.log(`📥 Connecting to dynamic DB: ${fullURI}`);

//   try {
//     const connection = await mongoose.createConnection(fullURI, {
//       // useNewUrlParser: true,
//       // useUnifiedTopology: true,
//       // serverSelectionTimeoutMS: 10000, // 10 seconds timeout
//       // socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
//     });

//     connection.on("error", (err) => {
//       console.error(
//         `❌ Mongoose connection error on DB [${dbName}]:`,
//         err.message
//       );
//     });

//     connection.once("open", () => {
//       console.log(`✅ Connected to dynamic DB: ${dbName}`);
//     });

//     return connection;
//   } catch (error) {
//     console.error(`🚨 Failed to connect to DB [${dbName}]:`, error.message);
//     throw new Error(`Unable to connect to database [${dbName}]`);
//   }
// };

// module.exports = connectDynamicDB;

// config/dynamicDB.js

const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");

const connectDynamicDB = async (dbName) => {
  const baseURI = process.env.MONGO_URI;
  const fullURI = `${baseURI}/${dbName}?authSource=admin`;

  // console.log(`📥 Checking if database [${dbName}] exists...`);

  try {
    // Step 1: Check if database exists using MongoClient
    const client = await MongoClient.connect(`${baseURI}/admin`, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    const admin = client.db().admin();
    const dbList = await admin.listDatabases();

    const dbExists = dbList.databases.some((db) => db.name === dbName);
    await client.close();

    if (!dbExists) {
      console.error(
        `❌ Database [${dbName}] does not exist. Please create it first.`
      );
      throw new Error(
        `Database [${dbName}] does not exist. Please create it first.`
      );
    }

    // console.log(`✅ Database [${dbName}] found. Connecting to: ${fullURI}`);

    // Step 2: Connect using Mongoose
    const connection = await mongoose.createConnection(fullURI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // serverSelectionTimeoutMS: 10000,
      // socketTimeoutMS: 45000,
    });

    connection.on("error", (err) => {
      console.error(
        `❌ Mongoose connection error on DB [${dbName}]:`,
        err.message
      );
    });

    connection.once("open", () => {
      // console.log(`✅ Connected to dynamic DB: ${dbName}`);
    });

    return connection;
  } catch (error) {
    console.error(error.message);
    throw new Error(`${error.message}`);
  }
};

module.exports = connectDynamicDB;
