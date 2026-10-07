import { useState } from "react";
import { useNavigate } from "react-router-dom";
import expenseService from "../services/expenseService";

const AddExpense = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        category: "",
        date: "",
        paymentMethod: "Other",
        description: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await expenseService.createExpense({
                ...formData,
                amount: Number(formData.amount),
            });

            navigate("/expenses");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to add expense."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Add Expense</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Grocery Shopping"
                        required
                    />
                </div>

                <div>
                    <label>Amount</label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="Enter amount"
                        min="0"
                        required
                    />
                </div>

                <div>
                    <label>Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select category</option>
                        <option value="Food">Food</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Travel">Travel</option>
                        <option value="Bills">Bills</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Health">Health</option>
                        <option value="Education">Education</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label>Date</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Payment Method</label>
                    <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                    >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                        <option value="Net Banking">Net Banking</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Optional description"
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Add Expense"}
                </button>

            </form>
        </div>
    );
};

export default AddExpense;