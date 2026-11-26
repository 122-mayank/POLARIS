import axios from "axios";

const API_URL = "http://localhost:5000/api/expeditions";

export const getExpeditions = async () => {
    const response = await axios.get(API_URL);

    return response.data;
};

export const createExpedition = async (expeditionData) => {

    const response = await axios.post(
        API_URL,
        expeditionData
    );

    return response.data;
};

