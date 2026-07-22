const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const authRoutes = require("./routes/authRoutes");

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());


// Test Route
app.get("/", (req, res) => {
    res.json({
        message: "Server Running..."
    });
});

app.use("/api/auth", authRoutes);

module.exports = app;