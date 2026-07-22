const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const AppError = require("../utils/appError");

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

const generateMfaSecret = (email) => {
  return speakeasy.generateSecret({
    name: `Secure Auth (${email})`,
    length: 20,
  });
};

const verifyMfaToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  mfaEnabled: user.mfaEnabled || false,
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
    const { email, password, mfaToken } = req.body;

    if (!email) {
      return next(new AppError(400, "Email is required"));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError(401, "Invalid email or password"));
    }

    if (!password) {
      return next(new AppError(400, "Password is required"));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new AppError(401, "Invalid email or password"));
    }

    if (user.mfaEnabled) {
      if (!mfaToken) {
        return res.status(401).json({
          success: false,
          mfaRequired: true,
          message: "MFA token required",
        });
      }

      const isVerified = verifyMfaToken(user.mfaSecret, mfaToken);

      if (!isVerified) {
        return next(new AppError(401, "Invalid MFA token"));
      }
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

const setupMfa = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new AppError(401, "User not found"));
    }

    if (user.mfaEnabled) {
      return next(new AppError(400, "MFA is already enabled"));
    }

    const secret = generateMfaSecret(user.email);
    user.mfaTempSecret = secret.base32;
    await user.save();

    const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      success: true,
      qrCodeDataURL,
      message: "Scan this QR code with your authenticator app.",
    });
  } catch (error) {
    next(error);
  }
};

const verifyMfa = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return next(new AppError(400, "MFA token is required"));
    }

    const user = await User.findById(req.user.id);

    if (!user || !user.mfaTempSecret) {
      return next(new AppError(400, "MFA setup is not in progress"));
    }

    const isVerified = verifyMfaToken(user.mfaTempSecret, token);

    if (!isVerified) {
      return next(new AppError(401, "Invalid MFA token"));
    }

    user.mfaSecret = user.mfaTempSecret;
    user.mfaTempSecret = null;
    user.mfaEnabled = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "MFA enabled successfully",
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
  setupMfa,
  verifyMfa,
  getProfile,
  getAdminDashboard,
};