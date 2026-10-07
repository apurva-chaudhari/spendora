import api from "./api";

const getExpenses = async () => {
    const token = localStorage.getItem("token");

    const response = await api.get("/expenses", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

const getExpenseById = async (id) => {
    const token = localStorage.getItem("token");

    const response = await api.get(`/expenses/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

const createExpense = async (expenseData) => {
    const token = localStorage.getItem("token");

    const response = await api.post(
        "/expenses",
        expenseData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

const updateExpense = async (id, expenseData) => {
    const token = localStorage.getItem("token");

    const response = await api.put(
        `/expenses/${id}`,
        expenseData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

const deleteExpense = async (id) => {
    const token = localStorage.getItem("token");

    const response = await api.delete(
        `/expenses/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export default {
    getExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense
};