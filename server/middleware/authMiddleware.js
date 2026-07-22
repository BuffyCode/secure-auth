const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/appError");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError(401, "Authorization token is missing"));
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new AppError(401, "User not found"));
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError(401, "Token expired"));
    }

    if (error.name === "JsonWebTokenError") {
      return next(new AppError(401, "Invalid token"));
    }

    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, "Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(403, "You do not have permission to access this resource")
      );
    }

    next();
  };
};

const isAdmin = authorize("admin");
const isUser = authorize("user", "admin");

module.exports = {
  protect,
  authorize,
  isAdmin,
  isUser,
};
