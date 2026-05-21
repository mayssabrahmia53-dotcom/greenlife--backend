import numpy as np
from tensorflow.keras.models import load_model
import joblib
import requests

model = load_model("model.keras")
scaler = joblib.load("scaler.pkl")

# 🔮 LSTM Prediction
def predict_energy(data):
    data = np.array(data).reshape(1, len(data), 1)
    pred = model.predict(data)
    return float(pred[0][0])


# 🤖 Ollama Recommendation
def get_recommendation(prediction):
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3.2",
            "prompt": f"Energy consumption is {prediction}. Give eco-friendly advice.",
            "stream": False
        }
    )
    return response.json()["response"]