const Expense = require("../models/Expense");
const {
    generateSpendingInsights,
    askSpendora,
} = require("../services/aiService");

const getSpendingInsights = async (req, res) => {
    try {
        const expenses = await Expense.find({
            userId: req.user.userId,
        }).sort({ date: -1 });

        const now = new Date();

        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const previousMonthDate = new Date(
            currentYear,
            currentMonth - 1,
            1
        );

        const previousMonth = previousMonthDate.getMonth();
        const previousMonthYear = previousMonthDate.getFullYear();

        const currentMonthExpenses = expenses.filter((expense) => {
            const expenseDate = new Date(expense.date);

            return (
                expenseDate.getMonth() === currentMonth &&
                expenseDate.getFullYear() === currentYear
            );
        });

        const previousMonthExpenses = expenses.filter((expense) => {
            const expenseDate = new Date(expense.date);

            return (
                expenseDate.getMonth() === previousMonth &&
                expenseDate.getFullYear() === previousMonthYear
            );
        });

        const calculateTotal = (expenseList) => {
            return expenseList.reduce(
                (total, expense) => total + expense.amount,
                0
            );
        };

        const calculateCategoryTotals = (expenseList) => {
            return expenseList.reduce((result, expense) => {
                const category = expense.category || "Other";

                result[category] =
                    (result[category] || 0) + expense.amount;

                return result;
            }, {});
        };

        const currentMonthTotal = calculateTotal(
            currentMonthExpenses
        );

        const previousMonthTotal = calculateTotal(
            previousMonthExpenses
        );

        const currentCategoryTotals =
            calculateCategoryTotals(currentMonthExpenses);

        const previousCategoryTotals =
            calculateCategoryTotals(previousMonthExpenses);

        const spendingData = {
            currentMonth: {
                total: currentMonthTotal,
                categories: currentCategoryTotals,
            },
            previousMonth: {
                total: previousMonthTotal,
                categories: previousCategoryTotals,
            },
        };

        const aiInsights =
            await generateSpendingInsights(spendingData);

        res.status(200).json({
            spendingData,
            aiInsights,
        });
    } catch (error) {
        console.error(
            "AI spending insights error:",
            error.message
        );

        res.status(500).json({
            message: "Failed to generate spending insights.",
        });
    }
};
const askSpendoraController = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({
                message: "Question is required.",
            });
        }

        const expenses = await Expense.find({
            userId: req.user.userId,
        })
            .select("title amount category date paymentMethod description")
            .sort({ date: -1 });

        const answer = await askSpendora(question, expenses);

        res.status(200).json({
            question,
            answer,
        });
    } catch (error) {
        console.error("Ask Spendora error:", error.message);

        res.status(500).json({
            message: "Failed to process your question.",
        });
    }
};

module.exports = {
    getSpendingInsights,
    askSpendoraController,
};