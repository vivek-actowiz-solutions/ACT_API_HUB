const mongoose = require("mongoose");

const getModules = async (req, res) => {
  try {
    // use native collection
    const modules = await mongoose.connection.db
      .collection("modules")
      .find({})
      .toArray();

    res.status(200).json({
      success: true,
      message: "Modules fetched successfully",
      data: modules,
    });
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getRoles = async (req, res) => {
    const permission = res.locals.permissions;
  console.log("permission in my api", permission);


  try {
    const {  search = "" } = req.query;

    const query = {
      $or: [
        { roleName: { $regex: search, $options: "i" } },
      ],
    };
    // use native collection
    const roles = await mongoose.connection.db
      .collection("roles")
      .find(query)
      .toArray();

    res.status(200).json({
      message: "Roles fetched successfully",
      data: roles,
      permission
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const updatePermissions = async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body;
  console.log("permissions", permissions);

  try {
    // use native collection
    await mongoose.connection.db
      .collection("roles")
      .updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { $set: { permissions } }
      );

    res.status(200).json({
      message: "Permissions updated successfully",
    });
  } catch (error) {
    console.error("Error updating permissions:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getusers = async (req, res) => {
  const permission = res.locals.permissions;
  console.log("permission in my api", permission);

  try {
    // query params with defaults
    const { page = 1, limit = 10, search = "" } = req.query;

    const pageNumber = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageLimit;

    // build search filter
    const searchFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { designation: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // aggregation pipeline
    const users = await mongoose.connection.db
      .collection("users")
      .aggregate([
        { $match: searchFilter }, // search filter
        {
          $lookup: {
            from: "roles", // roles collection
            localField: "roleId",
            foreignField: "_id",
            as: "roleInfo",
          },
        },
        { $unwind: { path: "$roleInfo", preserveNullAndEmptyArrays: true } }, // keep users even if no role
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            designation: 1,
            roleId: 1,
            status: 1,
            roleName: "$roleInfo.roleName",
          },
        },
        { $skip: skip },
        { $limit: pageLimit },
      ])
      .toArray();

    // get total count for pagination
    const total = await mongoose.connection.db
      .collection("users")
      .countDocuments(searchFilter);

    res.status(200).json({
      message: "Users fetched successfully",
      data: users,
  total,
      permission,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateuserstatus = async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
console.log("status", status);
  try {
    const User = await mongoose.connection.db
      .collection("users")
      .updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: { status } });
    if (!User) return res.status(404).json({ message: "user not found" });
    res.status(200).json({ message: "User status updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};
module.exports = { getModules, getRoles, updatePermissions ,  getusers , updateuserstatus };
