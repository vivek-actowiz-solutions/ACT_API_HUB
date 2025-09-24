const nodemailer = require("nodemailer");

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "alerts.actowiz@gmail.com",
    pass: "celg xtne jgxo xafd", // App password, NOT your Gmail password
  },
});

// Send email function
const sendMail = async (to, subject, html) => {
  const mailOptions = {
    from: "alerts.actowiz@gmail.com",
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return true;
  } catch (err) {
    console.error("❌ Error sending email:", err);
    return false;
  }
};

module.exports = sendMail;
