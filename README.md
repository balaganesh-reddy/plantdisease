# Plant Disease Detection

A lightweight Flask web application for detecting common plant diseases from uploaded leaf images.

## Features
- Upload a plant or leaf image
- Run a simple demonstration classifier
- View disease prediction and recommendation
- Clean, responsive UI

## Tech Stack
- Python
- Flask
- Pillow
- NumPy

## Run Locally

1. Clone the repository
2. Create and activate a virtual environment
3. Install requirements:

```bash
pip install -r requirements.txt
```

4. Start the application:

```bash
python app.py
```

5. Open your browser at `http://localhost:5000`

## Notes
This project is a prototype disease detection app. The classifier uses a simple rule-based image analysis approach to simulate prediction logic. For real-world use, you can replace `plant_model.py` with a trained ML model and dataset.
