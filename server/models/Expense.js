const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        date: {
            type: Date,
            required: true,
        },

        paymentMethod: {
            type: String,
            enum: ["Cash", "UPI", "Card", "Net Banking", "Other"],
            default: "Other",
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        source: {
            type: String,
            enum: ["manual", "bill_scan"],
            default: "manual",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Expense", expenseSchema);