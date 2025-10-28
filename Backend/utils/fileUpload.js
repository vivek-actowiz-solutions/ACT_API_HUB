// utils/fileUpload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");

// ✅ Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const domain = req.body.domainName || "UnknownDomain";
    const now = new Date();

    // Format date/time: YYYY_MM_DD_HH_MM
    const formattedDate = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, "0")}_${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}_${String(now.getMinutes()).padStart(2, "0")}`;

    const ext = path.extname(file.originalname);
    const safeDomain = domain.replace(/\s+/g, "_");

    // ✅ File name format: Domain_sample_YYYY_MM_DD_HH_MM.ext
    const filename = `${safeDomain}_sample_${formattedDate}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

module.exports = upload;
