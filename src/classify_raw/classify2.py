# classify.py
from sentence_transformers import SentenceTransformer
import joblib
import numpy as np
from htmlextract import extract_text_from_html
import re

EPS = 1e-12

# Load components
embedder = SentenceTransformer("model/embedding_model")
clf = joblib.load("model/classifier.pkl")
le = joblib.load("model/label_encoder.pkl")
centroids = joblib.load("model/centroids.pkl")               # normalized centroids (C, D)
cosine_thresholds = joblib.load("model/cosine_thresholds.pkl")  # raw cosine thresholds (C,)
temperature = float(joblib.load("model/temperature.pkl"))
iso = joblib.load("model/isolation_forest.pkl")

# Params (tune)
ALPHA = 0.6           # weight: 0..1 -> combined = alpha*prob + (1-alpha)*cos_mapped
COMBINED_THRESHOLD = 0.40   # require combined >= this
# Optional minimal cosine absolute threshold (raw cosine); if top_cos_raw < raw_min_cosine -> unknown
MIN_RAW_COSINE = None  # set None to use per-class threshold

def clean_text(text):
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\x00-\x7F]+", " ", text)
    return text.strip()

def softmax_batch(logits):
    e = np.exp(logits - np.max(logits, axis=1, keepdims=True))
    return e / e.sum(axis=1, keepdims=True)

def classify_html(path, return_debug=False):
    raw = extract_text_from_html(path)
    text = clean_text(raw)

    emb = embedder.encode([text])
    emb = np.asarray(emb, dtype=np.float32)  # shape (1, D)

    # calibrated softmax
    logits = clf.decision_function(emb)  # (1, C)
    logits_scaled = logits / (temperature + EPS)
    probs = softmax_batch(logits_scaled)[0]  # (C,)

    # cosine similarity (raw)
    emb_norm = emb / (np.linalg.norm(emb, axis=1, keepdims=True) + EPS)
    cos_sims = (centroids @ emb_norm.T).reshape(-1)  # raw cosine in [-1,1]
    cos_scores = (cos_sims + 1.0) / 2.0  # map to [0,1] for combining

    # combined score per class
    combined = ALPHA * probs + (1.0 - ALPHA) * cos_scores  # [0,1]

    # top predictions
    top_idx = int(np.argmax(combined))
    top_label = le.inverse_transform([top_idx])[0]
    top_combined = float(combined[top_idx])
    top_prob = float(probs[top_idx])
    top_cos_raw = float(cos_sims[top_idx])
    top_cos_mapped = float(cos_scores[top_idx])

    # IsolationForest check (-1 = anomaly)
    iso_pred = iso.predict(emb)[0]  # 1 -> inlier, -1 -> outlier
    is_anomaly = int(iso_pred) == -1

    # per-class cosine threshold check
    per_class_raw_thresh = float(cosine_thresholds[top_idx])  # raw cosine
    if MIN_RAW_COSINE is not None:
        raw_thresh = MIN_RAW_COSINE
    else:
        raw_thresh = per_class_raw_thresh

    reason = None
    if is_anomaly:
        reason = "anomaly"
    elif top_combined < COMBINED_THRESHOLD:
        reason = "low_combined"
    elif top_cos_raw < raw_thresh:
        reason = "low_cosine"
    else:
        reason = "accepted"

    # Build all_scores sorted descending
    sorted_idx = np.argsort(combined)[::-1]
    all_scores = [(le.inverse_transform([int(i)])[0], float(combined[int(i)] * 100.0)) for i in sorted_idx]

    # one-liner
    if reason == "accepted":
        one_line = f"Prediction: {top_label} ({top_combined*100:.1f}%)"
    else:
        one_line = f"Prediction: unknown ({top_combined*100:.1f}%)  <-- {reason}"

    if return_debug:
        debug = {
            "one_line": one_line,
            "top_label": top_label,
            "top_combined": top_combined,
            "top_prob": top_prob,
            "top_cos_raw": top_cos_raw,
            "top_cos_mapped": top_cos_mapped,
            "per_class_raw_threshold": raw_thresh,
            "is_anomaly": is_anomaly,
            "all_scores": all_scores
        }
        return debug

    return one_line, all_scores

if __name__ == "__main__":
    one_line, all_scores = classify_html("test.html")
    print(one_line)
    print("\nAll Class Scores:")
    for l, s in all_scores:
        print(f" - {l}: {s:.1f}%")
