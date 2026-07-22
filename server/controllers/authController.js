const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const { sendOtpEmail } = require("../utils/emailService");

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return next(new AppError(400, "Name, email and password are required"));
    }

    if (password.length < 6) {
      return next(new AppError(400, "Password must be at least 6 characters long"));
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new AppError(409, "User already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    const token = createToken(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password, otp } = req.body;

    if (!email) {
      return next(new AppError(400, "Email is required"));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError(401, "Invalid email or password"));
    }

    if (otp) {
      if (!user.otp || !user.otpExpiresAt || new Date() > user.otpExpiresAt) {
        return next(new AppError(401, "OTP expired or invalid"));
      }

      if (user.otp !== otp) {
        return next(new AppError(401, "Invalid OTP"));
      }

      user.otp = null;
      user.otpExpiresAt = null;
      await user.save();

      const token = createToken(user);

      return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
        token,
        user: sanitizeUser(user),
      });
    }

    if (!password) {
      return next(new AppError(400, "Password is required"));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new AppError(401, "Invalid email or password"));
    }

    const token = createToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const requestOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError(400, "Email is required"));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError(404, "User not found"));
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOtpEmail(email, otp);
    } catch (error) {
      console.error("OTP email delivery failed", error.message);
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

const getAdminDashboard = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Welcome Admin",
      user: req.user,
      users: users.map(sanitizeUser),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  requestOtp,
  getProfile,
  getAdminDashboard,
};