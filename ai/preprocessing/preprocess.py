import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import joblib

# =========================================================
# 1. LOAD DATA
# =========================================================

df = pd.read_csv("../data/data.csv")
df.columns = df.columns.str.strip()

# keep only numeric columns
df = df.select_dtypes(include=[np.number])
df = df.dropna()

print("Data shape:", df.shape)

# =========================================================
# 2. CHOOSE TARGET (IMPORTANT FIX)
# =========================================================

target_col = "Total Energy Consumption (in Metric Tons)"

if target_col not in df.columns:
    target_col = df.columns[0]  # fallback safe

y = df[[target_col]]
X = df.copy()

# =========================================================
# 3. SCALE X AND Y SEPARATELY (🔥 IMPORTANT FIX)
# =========================================================

x_scaler = MinMaxScaler()
X_scaled = x_scaler.fit_transform(X)

y_scaler = MinMaxScaler()
y_scaled = y_scaler.fit_transform(y)

joblib.dump(x_scaler, "x_scaler.pkl")
joblib.dump(y_scaler, "y_scaler.pkl")

print("Scaling done ✔")

# =========================================================
# 4. SEQUENCE CREATION (FIXED)
# =========================================================

SEQ_LENGTH = 7

def create_sequences(X_data, y_data, seq_length):
    X_seq, y_seq = [], []

    for i in range(len(X_data) - seq_length):
        X_seq.append(X_data[i:i+seq_length])
        y_seq.append(y_data[i+seq_length])

    return np.array(X_seq), np.array(y_seq)

X, y = create_sequences(X_scaled, y_scaled, SEQ_LENGTH)

print("X shape:", X.shape)
print("y shape:", y.shape)

# =========================================================
# 5. TRAIN / TEST SPLIT (TIME SERIES SAFE)
# =========================================================

split = int(len(X) * 0.8)

X_train, X_test = X[:split], X[split:]
y_train, y_test = y[:split], y[split:]

# =========================================================
# 6. VALIDATION (SAFE)
# =========================================================

assert not np.isnan(X_train).any()
assert not np.isnan(y_train).any()

print("Validation OK ✔")

# =========================================================
# 7. SAVE FILES
# =========================================================

np.save("X_train.npy", X_train)
np.save("X_test.npy", X_test)
np.save("y_train.npy", y_train)
np.save("y_test.npy", y_test)

print("Saved successfully ✔")

# =========================================================
# 8. SUMMARY
# =========================================================

print("\n========================================")
print("✅ PREPROCESSING CLEAN VERSION COMPLETE")
print("========================================")

print(f"""
✔ X features: {X.shape[1]}
✔ Sequence length: {SEQ_LENGTH}
✔ Train samples: {len(X_train)}
✔ Test samples: {len(X_test)}

🚀 Ready for LSTM training (NO scaling bugs)
""")