import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

# =========================
# PATHS
# =========================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = BASE_DIR / "data/data.csv"

MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)

MODEL_PATH = str(MODEL_DIR / "model.keras")
SCALER_PATH = str(MODEL_DIR / "scaler.pkl")

# =========================
# LOAD DATA
# =========================

df = pd.read_csv(DATA_PATH)

# keep numeric only (IMPORTANT SAME AS PREDICT)
df = df.select_dtypes(include=[np.number]).dropna()

data = df.values  # 🔥 ALL FEATURES

print("Features:", data.shape[1])

# =========================
# SCALE
# =========================

scaler = MinMaxScaler()
scaled = scaler.fit_transform(data)

joblib.dump(scaler, SCALER_PATH)

# =========================
# CREATE SEQUENCES
# =========================

SEQ = 7

X, y = [], []

for i in range(len(scaled) - SEQ):
    X.append(scaled[i:i+SEQ])
    y.append(scaled[i+SEQ][0])  # predict first column

X = np.array(X)
y = np.array(y)

print("X shape:", X.shape)
print("y shape:", y.shape)

# =========================
# MODEL
# =========================

model = Sequential([
    LSTM(64, return_sequences=True, input_shape=(SEQ, X.shape[2])),
    Dropout(0.2),

    LSTM(32),
    Dropout(0.2),

    Dense(16, activation="relu"),
    Dense(1)
])

model.compile(optimizer="adam", loss="mse", metrics=["mae"])

# =========================
# CALLBACKS
# =========================

early_stop = EarlyStopping(patience=10, restore_best_weights=True)

checkpoint = ModelCheckpoint(
    filepath=MODEL_PATH,
    save_best_only=True,
    monitor="val_loss"
)

# =========================
# TRAIN
# =========================

model.fit(
    X, y,
    epochs=50,
    batch_size=8,
    validation_split=0.2,
    callbacks=[early_stop, checkpoint]
)

model.save(MODEL_PATH)

print("✅ TRAINING DONE")