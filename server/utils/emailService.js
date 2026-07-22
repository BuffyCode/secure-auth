const nodemailer = require("nodemailer");

const sendOtpEmail = async (email, otp) => {
  const smtpService = process.env.SMTP_SERVICE;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpSecure = process.env.SMTP_SECURE === "true";

  if (!smtpUser || !smtpPass || (!smtpService && !smtpHost)) {
    console.log(`OTP for ${email}: ${otp}`);
    return;
  }

  const transporterConfig = {
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  };

  if (smtpService) {
    transporterConfig.service = smtpService;
  } else {
    transporterConfig.host = smtpHost;
    transporterConfig.port = Number(smtpPort || 587);
    transporterConfig.secure = smtpSecure;
  }

  transporterConfig.requireTLS = true;

  const transporter = nodemailer.createTransport(transporterConfig);

  await transporter.sendMail({
    from: process.env.SMTP_FROM || smtpUser,
    to: email,
    subject: "Your OTP code",
    text: `Your verification code is ${otp}. It expires in 10 minutes.`,
  });
};

module.exports = {
  sendOtpEmail,
};
