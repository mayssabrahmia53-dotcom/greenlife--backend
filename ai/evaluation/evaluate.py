from sklearn.metrics import mean_squared_error
import numpy as np
from tensorflow.keras.models import load_model

# Load trained model
model = load_model("model.keras")

# Load test data
X_test = np.load("X_test.npy")
y_test = np.load("y_test.npy")

# Reshape for LSTM (3D input)
X_test = X_test.reshape((X_test.shape[0], X_test.shape[1], 1))

# Prediction
pred = model.predict(X_test)

# Evaluation
mse = mean_squared_error(y_test, pred)
rmse = np.sqrt(mse)

# Print results
print("MSE:", mse)
print("RMSE:", rmse)