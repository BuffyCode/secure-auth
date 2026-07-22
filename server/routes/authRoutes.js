const express = require("express");
const {
  registerUser,
  loginUser,
  setupMfa,
  verifyMfa,
  getProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/mfa/setup", protect, setupMfa);
router.post("/mfa/verify", protect, verifyMfa);
router.get("/profile", protect, getProfile);

module.exports = router;