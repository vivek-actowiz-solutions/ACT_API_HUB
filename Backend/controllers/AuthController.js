const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const generatePassword = require("generate-password");
const sendMail = require("../utils/mailer");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
// import dns from 'dns';
// import geoip from 'geoip-lite';
// const dns = require("dns");
// const geoip = require("geoip-lite");
// import fetch from "node-fetch";
// const fetch = require("node-fetch");
const userRegister = async (req, res) => {
  const { email, roleId, designation } = req.body;
  console.log("req.body", req.body);

  try {
    // Check if user already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    // Generate random strong password
    const password = generatePassword.generate({
      length: 8,
      numbers: true,
      uppercase: true,
      lowercase: true,
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Convert roleId string to ObjectId before saving
    const newUser = new User({
      email,
      password: hashedPassword,
      roleId: new mongoose.Types.ObjectId(roleId),
      designation,
    });

    await newUser.save();

    // Email template (HTML)
    const emailHtml = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#f5f7fa; color:#333;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.08); overflow:hidden;">

    <!-- Header -->
    <div style="padding:25px; text-align:center; ">
      <h2 style="margin:0; font-size:22px; color:#3d01b2; font-weight:600;">Welcome to Actowiz Solutions</h2>
    </div>

    <!-- Body -->
    <div style="padding:30px; background:#ffffff;">
      <p style="font-size:15px; margin:0 0 16px;">
        Hello <strong>Dear User</strong>,
      </p>

      <p style="font-size:15px; line-height:1.6; margin:0 0 20px; color:#444;">
        We’re excited to let you know that your account has been created successfully 🎉  
        You can now log in and start using <strong>Actowiz Solutions API Management</strong>.  
        Here are your login details:
      </p>

      <!-- Card Design -->
<div style="background:linear-gradient(135deg, #f3e8ff, #e0f2ff); border-radius:12px; padding:20px; margin-bottom:25px; box-shadow:0 3px 10px rgba(0,0,0,0.06);">
  <p style="margin:0 0 10px; font-size:15px; color:#111; font-weight:600;">
    📧 Email: <span style="color:#3d01b2; font-weight:500;">${email}</span>
  </p>
  <p style="margin:0; font-size:15px; color:#111; font-weight:600;">
    🔑 Temporary Password: 
    <span style="color:#3d01b2; font-weight:bold;">${password}</span>
  </p>
</div>

      <p style="font-size:14px; line-height:1.6; color:#555; margin:0 0 25px;">
        ⚠️ <strong>Important:</strong> Please change your password immediately after logging in for your account’s security.  
        If you didn’t request this account, kindly ignore this email or contact our support team.
      </p>

      <!-- CTA Button -->
<div style="text-align:center; margin:25px 0;">
  <a href="http://172.28.148.176:3000/API-management/login" 
     target="_blank"
     style="
            color:#3d01b2;  
            text-decoration:none;
            font-size:16px; 
            font-weight:600; 
            font-family: Arial, sans-serif; 
            display:inline-block;">
    Login to Your Account
  </a>
</div>
    </div>

    
    <div style="background:#f5f7fa; text-align:center; padding:15px; font-size:13px; color:#dbd3d3ff; border-top:1px solid #dbd3d3ff;">
      © ${new Date().getFullYear()} <strong>Actowiz Solutions</strong>. All rights reserved.  
      <br/>
      <a href="https://www.actowizsolutions.com" style="color:#3d01b2; text-decoration:none; font-weight:600;">Visit Our Website</a>
    </div>

  </div>
</div>
    `;

    // Send email
    const emailSent = await sendMail(
      email,
      "Your Account Information",
      emailHtml
    );

    if (emailSent) {
      res.status(200).json({ msg: "User registered and email sent" });
    } else {
      res.status(500).json({ msg: "User registered but email failed" });
    }
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  // Clean if multiple IPs are present
  if (ip && ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }

  console.log("User IP:", ip);

  // Reverse DNS lookup
  // dns.reverse(ip, (err, hostnames) => {
  //   if (err) {
  //     console.error("DNS reverse lookup failed:", err);
  //   }

  //   // Geo lookup
  //   const geo = geoip.lookup(ip);

  //   const loginInfo = {
  //     ipAddress: ip,
  //     hostname: hostnames && hostnames.length > 0 ? hostnames[0] : "Unknown",
  //     location: geo
  //       ? `${geo.city || "Unknown"}, ${geo.country || "Unknown"}`
  //       : "Unknown",
  //     userAgent: req.headers["user-agent"] || "Unknown",
  //     loginTime: new Date(),
  //   };

  //   console.log("Login Info:", loginInfo);

  //   // Send the info back in response (optional)
  // });

  try {
    const user = await User.findOne({ email });
    console.log("user", user);
    if (!user) return res.status(404).json({ Message: "User not found" });
    if (!user.status) {
  return res
    .status(403)
    .json({ Message: "Your account is not active. Please contact support team." });
}
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ Message: "Invalid credentials" });

    const permission = await mongoose.connection.db
      .collection("roles")
      .findOne(
        { _id: new ObjectId(user.roleId) },
        { projection: { permissions: 1 } }
      );
    console.log("permission", permission);

    const token = jwt.sign(
      { id: user._id, role: user.roleId, name: user.name, email: user.email },
      process.env.JWT_SECRET
    );
    res.cookie("token", token, {
      httpOnly: false,
      secure: false, // you're using HTTP + IPs => must be false
      sameSite: "Lax", // Lax allows cookie in normal browser POSTs
      maxAge: 24 * 60 * 60 * 1000,
    });
    // console.log("permission", permission);
    res.status(200).json({ Message: "Login successful", token, permission });
  } catch (err) {
    console.log(err);
    res.status(500).json({ Message: "Server error" });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { id } = req.user;
  try {
    const user = await User.findOne({ _id: id });
    if (!user) return res.status(404).json({ msg: "User not found" });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Invalid current password" });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ msg: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

const getRoleBasePermission = async (req, res) => {
  console.log("req.user", req.user);
  const id = req.user.role;
  console.log("id", id);
  try {
    const permissions = await mongoose.connection.db
      .collection("roles")
      .findOne({ _id: new ObjectId(id) }, { projection: { permissions: 1 } });
    console.log("permissions", permissions);
    const moduleNames = permissions.permissions.map(
      (permission) => permission.moduleName
    );
    console.log("moduleNames", moduleNames);
    res.status(200).json(moduleNames);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};



const sendotp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save OTP with expiry (optional: 5 mins)
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    // Email template
    const emailHtml = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#f5f7fa; color:#333; padding:20px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.08); overflow:hidden;">

    <!-- Header -->
    <div style="padding:25px; text-align:center; background:#f3e8ff;">
      <h2 style="margin:0; font-size:22px; color:#3d01b2; font-weight:600;">Actowiz Solutions</h2>
      <p style="margin:5px 0 0; font-size:14px; color:#555;">Secure OTP Verification</p>
    </div>

    <!-- Body -->
    <div style="padding:30px;">
      <p style="font-size:15px; margin:0 0 16px;">
        Hello <strong>${user.name || "User"}</strong>,
      </p>

      <p style="font-size:15px; line-height:1.6; margin:0 0 20px; color:#444;">
        To complete your login, please use the following One-Time Password (OTP).  
        This OTP is valid for <strong>5 minutes</strong>.
      </p>

      <!-- OTP Card -->
      <div style="background:linear-gradient(135deg, #f3e8ff, #e0f2ff); border-radius:12px; padding:25px; margin-bottom:25px; text-align:center; box-shadow:0 3px 10px rgba(0,0,0,0.06);">
        <p style="margin:0; font-size:28px; letter-spacing:6px; color:#3d01b2; font-weight:bold;">
          ${otp}
        </p>
      </div>

      <p style="font-size:14px; line-height:1.6; color:#555; margin:0 0 25px;">
        ⚠️ <strong>Do not share this OTP</strong> with anyone. Our team will never ask for your OTP.  
        If you didn’t request this, please ignore this email.
      </p>

      <!-- CTA Button -->
      <div style="text-align:center; margin:25px 0;">
        <a href="http://172.28.148.176:3000/API-management/login" 
           target="_blank"
           style="color:#ffffff; background:#3d01b2; padding:12px 25px; border-radius:6px; text-decoration:none; font-size:16px; font-weight:600;">
          Verify & Login
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f5f7fa; text-align:center; padding:15px; font-size:13px; color:#777; border-top:1px solid #eee;">
      © ${new Date().getFullYear()} <strong>Actowiz Solutions</strong>. All rights reserved.  
      <br/>
      <a href="https://www.actowizsolutions.com" style="color:#3d01b2; text-decoration:none; font-weight:600;">Visit Our Website</a>
    </div>

  </div>
</div>
    `;

    // Send email
    const emailSent = await sendMail(
      email,
      "Your OTP Code - Actowiz Solutions",
      emailHtml
    );

    if (emailSent) {
      return res.status(200).json({ msg: "OTP sent successfully" });
    } else {
      return res.status(500).json({ msg: "Email sending failed" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = { userRegister, login, changePassword, getRoleBasePermission  ,sendotp};
