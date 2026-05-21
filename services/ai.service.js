const axios = require("axios");

const analyzeEnergy = async (values) => {

    try {

        if (!values || values.length === 0) {
            throw new Error("No values");
        }

        const current =
            values[values.length - 1];

        const response = await axios.post(
            "http://localhost:5001/analyze",
            {
                data: values,
                current: current
            }
        );

        return response.data;

    } catch (error) {

        console.log(
            "AI SERVICE ERROR:",
            error.message
        );

        throw new Error(
            "Erreur communication IA"
        );
    }
};

module.exports = {
    analyzeEnergy
};