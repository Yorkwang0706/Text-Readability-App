from pathlib import Path

import joblib
import nltk
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from nltk.tokenize import word_tokenize
from readability import Readability

BASE_DIR = Path(__file__).resolve().parent

WORD2CLUSTER_PATH = BASE_DIR / "word2cluster.pkl"
SVR_PATH = BASE_DIR / "readability_svr.pkl"

print("Loading production models...")

word2cluster = joblib.load(WORD2CLUSTER_PATH)
svr_model = joblib.load(SVR_PATH)

K = max(word2cluster.values()) + 1

print("Models loaded successfully!")
print("Vocabulary size:", len(word2cluster))
print("Number of clusters:", K)

nltk.download("punkt", quiet=True)
nltk.download("punkt_tab", quiet=True)


def calculate_cluster_features(text):
    tokens = word_tokenize(text.lower())

    cluster_vector = np.zeros(K)
    matched_words = 0

    for word in tokens:
        if word in word2cluster:
            cluster_id = word2cluster[word]
            cluster_vector[cluster_id] += 1
            matched_words += 1

    if matched_words > 0:
        cluster_vector = cluster_vector / matched_words

    return cluster_vector


def calculate_readability(text):
    r = Readability(text)

    return np.array([
        r.flesch().score,
        r.dale_chall().score,
        r.ari().score
    ])


def create_features(text):
    cluster_features = calculate_cluster_features(text)
    readability_features = calculate_readability(text)

    features = np.concatenate([
        cluster_features,
        readability_features
    ])

    return features.reshape(1, -1)


app = FastAPI(
    title="Text Readability API"
)

# Allow the public Vercel web frontends to call this API from a browser.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://[a-zA-Z0-9-]+\.vercel\.app",
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


class TextRequest(BaseModel):
    text: str


@app.get("/")
def home():
    return {
        "message": "Text Readability API is running!"
    }


@app.post("/predict")
def predict(request: TextRequest):
    text = request.text.strip()

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Text cannot be empty."
        )

    word_count = len(text.split())

    if word_count < 100:
        raise HTTPException(
            status_code=400,
            detail="Please provide at least 100 words."
        )

    try:
        features = create_features(text)
        prediction = svr_model.predict(features)[0]

        return {
            "bt_easiness": float(prediction)
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}"
        )