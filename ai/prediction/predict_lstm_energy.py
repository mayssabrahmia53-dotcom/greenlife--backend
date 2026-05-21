import numpy as np
import pandas as pd
import joblib
from tensorflow.keras.models import load_model
from pathlib import Path

# =========================
# PATHS
# =========================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models/model.keras"
SCALER_PATH = BASE_DIR / "models/scaler.pkl"
DATA_PATH = BASE_DIR / "data/data.csv"

# =========================
# LOAD MODEL + SCALER
# =========================

model = load_model(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

# =========================
# LOAD DATA (SAME AS TRAINING)
# =========================

df = pd.read_csv(DATA_PATH)
df = df.select_dtypes(include=[np.number]).dropna()

data = df.values

print("Features:", data.shape[1])

# =========================
# SCALE
# =========================

scaled = scaler.transform(data)

# =========================
# SEQUENCE
# =========================

SEQ = 7

X = scaled[-SEQ:]                     # (7, features)
X = X.reshape(1, SEQ, X.shape[1])     # (1, 7, features)

# =========================
# PREDICT
# =========================

pred = model.predict(X)

print("\n🔥 RESULT")
print("=========")
print("Prediction:", float(pred[0][0]))