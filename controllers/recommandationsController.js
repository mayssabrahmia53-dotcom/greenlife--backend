const { analyzeEnergy } = require("../services/aiService");

const generateRecommendation = async (req, res) => {

    try {

        const values = req.body.values;

        if (!values || values.length === 0) {
            return res.status(400).json({
                error: "No values provided"
            });
        }

        const result = await analyzeEnergy(values);

        return res.json({
            success: true,
            data: result
        });

    } catch (error) {

        console.log("🔥 ERROR:", error.message);

        return res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    generateRecommendation
};