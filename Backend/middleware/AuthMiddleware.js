const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.cookies.token;
  // console.log("token++++", token);
  if (!token) {
    return res.status(401).json({ Message: "Unauthorized. Token missing." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user { id, role, email }
    console.log(" this is login user", req.user);
    next();
  } catch (err) {
    return res.status(401).json({ Message: "Token invalid or expired." });
  }
};

module.exports = protect;
