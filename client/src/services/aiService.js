import api from "./api";

const getSpendingInsights = async () => {
    const token = localStorage.getItem("token");

    const response = await api.get("/ai/insights", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};
const askSpendora = async (question) => {
    const token = localStorage.getItem("token");

    const response = await api.post(
        "/ai/ask",
        { question },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export default {
    getSpendingInsights,
    askSpendora,
};