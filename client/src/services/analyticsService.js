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

export default {
    getSummary,
};