const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        image: {
            type: String,
            required: true,
        },
        rawText: {
            type: String,
            default: "",
        },

        merchant: {
            type: String,
            trim: true,
            default: "",
        },

        date: {
            type: Date,
        },

        subtotal: {
            type: Number,
            default: 0,
        },

        tax: {
            type: Number,
            default: 0,
        },

        total: {
            type: Number,
            required: true,
        },

        extractedItems: [
            {
                name: {
                    type: String,
                    trim: true,
                },

                quantity: {
                    type: Number,
                    default: 1,
                },

                price: {
                    type: Number,
                    default: 0,
                },
            },
        ],

        createdAt: {
            type: Date,
            default: Date.now,
        },
    }
);

module.exports = mongoose.model("Bill", billSchema);