import axios from "axios";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export const getExpeditions = async () => {
    const response = await axios.get(`${API_URL}/api/expeditions`);

    return response.data;
};

export const createExpedition = async (expeditionData) => {

    const response = await axios.post(
        API_URL,
        expeditionData
    );

    return response.data;
};

