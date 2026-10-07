const express = require("express");

const {
    upload,
    uploadBill,
    saveBillAsExpense,
} = require("../controllers/billController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/upload",
    protect,
    upload.single("bill"),
    uploadBill
);
router.post(
    "/:billId/save-expense",
    protect,
    saveBillAsExpense
);

module.exports = router;