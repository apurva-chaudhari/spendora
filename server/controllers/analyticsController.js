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

module.exports = {
    getSummary,
};