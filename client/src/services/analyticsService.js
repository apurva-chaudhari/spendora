import api from "./api";

const getSummary = async () => {
    const token = localStorage.getItem("token");

    const response = await api.get("/analytics/summary", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};

const getMonthlySpending = async () => {
    const token = localStorage.getItem("token");

    const response = await api.get("/analytics/monthly", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};
const getCategorySpending = async () => {
    const token = localStorage.getItem("token");

    const response = await api.get("/analytics/categories", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};

export default {
    getSummary,
    getMonthlySpending,
    getCategorySpending,
};