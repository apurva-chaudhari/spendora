import api from "./api";

const uploadBill = async (billFile) => {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("bill", billFile);

    const response = await api.post("/bills/upload", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};
const saveBillAsExpense = async (billId, billData) => {
    const token = localStorage.getItem("token");

    const response = await api.post(
        `/bills/${billId}/save-expense`,
        billData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export default {
    uploadBill,
    saveBillAsExpense,
};