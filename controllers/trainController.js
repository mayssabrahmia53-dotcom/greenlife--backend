const Consumption = require("../models/Consumption");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");

const execAsync = util.promisify(exec);

exports.trainModel = async (req, res) => {
  try {
    // 📥 جلب البيانات
    const data = await Consumption.find().sort({ mois: 1 });

    if (!data || data.length < 5) {
      return res.status(400).json({ error: "Not enough data" });
    }

    // 🔄 تحويل format
    const historique = data.map(item => ({
      energie_kwh: item.energie_kwh
    }));

    // 📁 temp file
    const tempPath = path.join(__dirname, "../train_data.json");
    fs.writeFileSync(tempPath, JSON.stringify(historique));

    // 🧠 تشغيل Python
    const scriptPath = path.join(
      __dirname,
      "../models/lstm_train.py"
    );

    const { stdout, stderr } = await execAsync(
      `python "${scriptPath}" "${tempPath}"`
    );

    if (stderr) console.error(stderr);

    const result = JSON.parse(stdout);

    if (result.error) {
      return res.status(500).json(result);
    }

    res.json({
      message: "Model trained successfully 🚀",
      details: result
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};