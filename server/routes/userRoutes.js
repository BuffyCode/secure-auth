const express = require("express");
const { protect, isUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", protect, isUser, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome User",
    user: req.user,
  });
});

module.exports = router;
