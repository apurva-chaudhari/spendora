const Expense = require("../models/Expense");

const getSummary = async (req, res) => {
    try {
        const userId = req.user.userId;

        const expenses = await Expense.find({ userId });

        const totalSpending = expenses.reduce(
            (total, expense) => total + expense.amount,
            0
        );
        const recentExpenses = await Expense.find({ userId })
            .sort({ date: -1 })
            .limit(5);

        const now = new Date();

        const startOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        const startOfTomorrow = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1
        );

        const startOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        const thisMonthExpenses = expenses.filter(
            (expense) => new Date(expense.date) >= startOfMonth
        );

        const todayExpenses = expenses.filter(
            (expense) => {
                const expenseDate = new Date(expense.date);

                return (
                    expenseDate >= startOfToday &&
                    expenseDate < startOfTomorrow
                );
            }
        );

        const monthlySpending = thisMonthExpenses.reduce(
            (total, expense) => total + expense.amount,
            0
        );

        const todaySpending = todayExpenses.reduce(
            (total, expense) => total + expense.amount,
            0
        );

        res.status(200).json({
            totalSpending,
            monthlySpending,
            todaySpending,
            recentExpenses,
        });
    } catch (error) {
        console.error("Analytics summary error:", error.message);

        res.status(500).json({
            message: "Server error while calculating analytics.",
        });
    }
};
const getMonthlySpending = async (req, res) => {
    try {
        const userId = req.user.userId;

        const expenses = await Expense.find({ userId });

        const monthlyData = {};

        expenses.forEach((expense) => {
            const date = new Date(expense.date);

            const month = date.toLocaleString("default", {
                month: "short",
            });

            const year = date.getFullYear();

            const key = `${month} ${year}`;

            if (!monthlyData[key]) {
                monthlyData[key] = 0;
            }

            monthlyData[key] += expense.amount;
        });

        const monthlySpending = Object.entries(monthlyData).map(
            ([month, amount]) => ({
                month,
                amount,
            })
        );

        res.status(200).json({
            monthlySpending,
        });
    } catch (error) {
        console.error(
            "Monthly analytics error:",
            error.message
        );

        res.status(500).json({
            message: "Server error while calculating monthly spending.",
        });
    }
};
const getCategorySpending = async (req, res) => {
    try {
        const userId = req.user.userId;

        const expenses = await Expense.find({ userId });

        const categoryData = {};

        expenses.forEach((expense) => {
            const category = expense.category;

            if (!categoryData[category]) {
                categoryData[category] = 0;
            }

            categoryData[category] += expense.amount;
        });

        const categorySpending = Object.entries(categoryData).map(
            ([category, amount]) => ({
                category,
                amount,
            })
        );

        res.status(200).json({
            categorySpending,
        });
    } catch (error) {
        console.error(
            "Category analytics error:",
            error.message
        );

        res.status(500).json({
            message: "Server error while calculating category spending.",
        });
    }
};

module.exports = {
    getSummary,
    getMonthlySpending,
    getCategorySpending,
};