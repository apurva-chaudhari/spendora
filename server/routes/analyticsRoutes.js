const express = require("express");

const {
    getSummary,
    getMonthlySpending,
    getCategorySpending,
} = require("../controllers/analyticsController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/summary", protect, getSummary);

router.get("/monthly", protect, getMonthlySpending);

router.get("/categories", protect, getCategorySpending);

module.exports = router;