const Expense = require("../models/Expense");
const { categorizeExpenseSmart } = require("../services/aiService");

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
        const aiCategory = await categorizeExpenseSmart(
            title,
            description
        );
        const expense = await Expense.create({
            userId: req.user.userId,
            title,
            amount,
            category: aiCategory,
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
const getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json({
            expense
        });

    } catch (error) {
        console.error("Get expense error:", error.message);

        res.status(500).json({
            message: "Server error while fetching expense"
        });
    }
};
const updateExpense = async (req, res) => {
    try {
        const {
            title,
            amount,
            category,
            date,
            paymentMethod,
            description
        } = req.body;

        const expense = await Expense.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        expense.title = title ?? expense.title;
        expense.amount = amount ?? expense.amount;
        expense.category = category ?? expense.category;
        expense.date = date ?? expense.date;
        expense.paymentMethod = paymentMethod ?? expense.paymentMethod;
        expense.description = description ?? expense.description;

        await expense.save();

        res.status(200).json({
            message: "Expense updated successfully",
            expense
        });

    } catch (error) {
        console.error("Update expense error:", error.message);

        res.status(500).json({
            message: "Server error while updating expense"
        });
    }
};
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json({
            message: "Expense deleted successfully"
        });

    } catch (error) {
        console.error("Delete expense error:", error.message);

        res.status(500).json({
            message: "Server error while deleting expense"
        });
    }
};

module.exports = {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense
};