import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import expenseService from "../services/expenseService";

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    

    useEffect(() => {
    const loadExpenses = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await expenseService.getExpenses();
            setExpenses(data.expenses);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load expenses."
            );
        } finally {
            setLoading(false);
        }
    };

    loadExpenses();
}, []);

    if (loading) {
        return <p>Loading expenses...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }
const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
        "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        await expenseService.deleteExpense(id);

        setExpenses((currentExpenses) =>
            currentExpenses.filter((expense) => expense._id !== id)
        );
    } catch (error) {
        setError(
            error.response?.data?.message ||
            "Failed to delete expense."
        );
    }
};

    return (
        <div>
            <h1>My Expenses</h1>

            <Link to="/expenses/add">
                Add Expense
            </Link>

            {expenses.length === 0 ? (
                <p>No expenses found.</p>
            ) : (
                <div>
                    {expenses.map((expense) => (
                        <div key={expense._id}>

                            <h3>{expense.title}</h3>

                            <p>
                                Amount: ₹{expense.amount}
                            </p>

                            <p>
                                Category: {expense.category}
                            </p>

                            <p>
                                Payment: {expense.paymentMethod}
                            </p>

                            <p>
                                Date:{" "}
                                {new Date(
                                    expense.date
                                ).toLocaleDateString()}
                            </p>
                            <button onClick={() => handleDelete(expense._id)}>
                                Delete
                            </button>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Expenses;