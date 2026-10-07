const express = require("express");
const {
    getSpendingInsights,
    askSpendoraController,
} = require("../controllers/aiController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/insights", protect, getSpendingInsights);
router.post("/ask", protect, askSpendoraController);

module.exports = router;