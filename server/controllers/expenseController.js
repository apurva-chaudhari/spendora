const Expense = require("../models/Expense");

const createExpense = async (req, res) => {
    try {
        const {
            title,
            amount,
            category,
            date,
            paymentMethod,
            description
        } = req.body;

        if (!title || amount === undefined || !category || !date) {
            return res.status(400).json({
                message: "Title, amount, category and date are required"
            });
        }

        const expense = await Expense.create({
            userId: req.user.userId,
            title,
            amount,
            category,
            date,
            paymentMethod,
            description,
            source: "manual"
        });

        res.status(201).json({
            message: "Expense created successfully",
            expense
        });

    } catch (error) {
        console.error("Create expense error:", error.message);

        res.status(500).json({
            message: "Server error while creating expense"
        });
    }
};

const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({
            userId: req.user.userId
        }).sort({ date: -1 });

        res.status(200).json({
            expenses
        });

    } catch (error) {
        console.error("Get expenses error:", error.message);

        res.status(500).json({
            message: "Server error while fetching expenses"
        });
    }
};

module.exports = {
    createExpense,
    getExpenses
};