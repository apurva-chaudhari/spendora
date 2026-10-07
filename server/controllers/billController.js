const multer = require("multer");
const path = require("path");
const Bill = require("../models/Bill");
const Expense = require("../models/Expense");
const { categorizeExpenseSmart } = require("../services/aiService");
const { extractBillData } = require("../services/ocrService");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}` +
            path.extname(file.originalname);

        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed."));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

const uploadBill = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Bill image is required.",
            });
        }

        console.log("Starting OCR...");

        const ocrData = await extractBillData(req.file.path);

        console.log("OCR completed.");

        const bill = await Bill.create({
            userId: req.user.userId,
            image: req.file.path,
            rawText: ocrData.rawText,
            merchant: ocrData.merchant,
            date: ocrData.date,
            subtotal: ocrData.subtotal,
            tax: ocrData.tax,
            total: ocrData.total,
            extractedItems: ocrData.extractedItems,
        });

        res.status(201).json({
            message: "Bill uploaded and scanned successfully.",
            bill,
            rawText: ocrData.rawText,
        });
    } catch (error) {
        console.error("Bill upload/OCR error:", error.message);

        res.status(500).json({
            message: "Server error while processing bill.",
        });
    }
};
const saveBillAsExpense = async (req, res) => {
    try {
        const { billId } = req.params;

        const {
            merchant,
            date,
            subtotal,
            tax,
            total,
            extractedItems,
        } = req.body;

        if (!merchant || !date || total === undefined) {
            return res.status(400).json({
                message: "Merchant, date and total are required.",
            });
        }

        const bill = await Bill.findOne({
            _id: billId,
            userId: req.user.userId,
        });

        if (!bill) {
            return res.status(404).json({
                message: "Bill not found.",
            });
        }

        // Update the bill with the user's corrections
        bill.merchant = merchant;
        bill.date = date;
        bill.subtotal = Number(subtotal) || 0;
        bill.tax = Number(tax) || 0;
        bill.total = Number(total);
        bill.extractedItems = extractedItems || [];

        await bill.save();

        // Create expense
        const aiCategory = await categorizeExpenseSmart(
            merchant,
            "Expense created from scanned bill."
        );

        const expense = await Expense.create({
            userId: req.user.userId,
            title: merchant,
            amount: Number(total),
            category: aiCategory,
            date: date,
            paymentMethod: "Other",
            description: "Expense created from scanned bill.",
            source: "bill_scan",
        });

        res.status(201).json({
            message: "Bill saved as expense successfully.",
            expense,
        });
    } catch (error) {
        console.error("Save bill as expense error:", error.message);

        res.status(500).json({
            message: "Server error while saving bill as expense.",
        });
    }
};

module.exports = {
    upload,
    uploadBill,
    saveBillAsExpense,
};