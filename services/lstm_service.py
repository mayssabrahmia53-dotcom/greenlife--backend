import sys
import json

def predict_energy(data):
    
    return sum(data) / len(data)


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "missing input file"}))
        return

    file_path = sys.argv[1]

    with open(file_path, "r") as f:
        payload = json.load(f)

    data = payload.get("data", [])

    prediction = predict_energy(data)

    print(json.dumps({
        "prediction": prediction
    }))


if __name__ == "__main__":
    main()