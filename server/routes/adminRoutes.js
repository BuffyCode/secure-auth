const express = require("express");
const { protect, isAdmin } = require("../middleware/authMiddleware");
const { getAdminDashboard } = require("../controllers/authController");

const router = express.Router();

router.get("/dashboard", protect, isAdmin, getAdminDashboard);

module.exports = router;
