import os
import requests
from transformers import pipeline
from dotenv import load_dotenv
from explain_engine import generate_explanation

load_dotenv()

# -----------------------------
# CONFIG
# -----------------------------
LOCAL_MODEL_PATH = "data/model_training/moral_model"
HF_API_TOKEN = os.getenv("HF_API_TOKEN")

HF_API_URL = (
    "https://api-inference.huggingface.co/models/"
    "cardiffnlp/twitter-roberta-base-sentiment"
)

HF_HEADERS = {
    "Authorization": f"Bearer {HF_API_TOKEN}"
}

# -----------------------------
# LOADING MODELS
# -----------------------------
# Specific fine-tuned model
local_classifier = None
try:
    if os.path.exists(LOCAL_MODEL_PATH):
        local_classifier = pipeline(
            "text-classification",
            model=LOCAL_MODEL_PATH,
            tokenizer="distilbert-base-uncased"
        )
        print("✅ Local fine-tuned model loaded")
    else:
        print(f"ℹ️ Local fine-tuned model not found at {LOCAL_MODEL_PATH}")
except Exception as e:
    print(f"⚠️ Error loading local model: {e}")

# Generic fallback model (will be loaded on demand to save memory/startup time)
generic_classifier = None

def get_generic_classifier():
    global generic_classifier
    if generic_classifier is None:
        try:
            print("⏳ Loading generic sentiment classifier...")
            generic_classifier = pipeline("sentiment-analysis")
            print("✅ Generic sentiment classifier loaded")
        except Exception as e:
            print(f"⚠️ Error loading generic classifier: {e}")
    return generic_classifier

# -----------------------------
# RULE-BASED OVERRIDE
# -----------------------------
def apply_rules(text, label, model_score):
    text_lower = text.lower()

    # -----------------------------
    # KEYWORD GROUPS
    # -----------------------------
    defensive_phrases = [
        "they deserved", "not my fault", "did nothing wrong",
        "no regret", "it was their mistake", "their fault",
        "not my problem", "i would do it again"
    ]

    remorseful_phrases = [
        "i am sorry", "i regret", "i feel bad",
        "my mistake", "shouldn't have done",
        "i apologize", "deeply regret",
        "i understand now", "i realize"
    ]

    growth_phrases = [
        "next time", "i will improve",
        "i will handle it differently",
        "i learned", "take responsibility"
    ]

    # -----------------------------
    # SCORING SYSTEM (Weighted)
    # -----------------------------
    empathy_score = 50  # neutral baseline

    # Penalize defensive indicators
    for phrase in defensive_phrases:
        if phrase in text_lower:
            empathy_score -= 20

    # Reward remorse indicators
    for phrase in remorseful_phrases:
        if phrase in text_lower:
            empathy_score += 15

    # Reward growth mindset
    for phrase in growth_phrases:
        if phrase in text_lower:
            empathy_score += 10

    # -----------------------------
    # GENERIC MODEL ADJUSTMENT
    # -----------------------------
    label_lower = str(label).lower()

    # If generic model says NEGATIVE, slight penalty
    if "neg" in label_lower:
        empathy_score -= 5

    # If POSITIVE, slight reward
    if "pos" in label_lower:
        empathy_score += 5

    # Clamp score between 0 and 100
    empathy_score = max(0, min(empathy_score, 100))

    # -----------------------------
    # FINAL EMOTION CLASSIFICATION
    # -----------------------------
    if empathy_score >= 70:
        emotion = "Remorseful"
    elif empathy_score >= 40:
        emotion = "Neutral"
    else:
        emotion = "Defensive"

    return emotion, empathy_score


# -----------------------------
# HF API FALLBACK
# -----------------------------
def hf_api_predict(text):
    if not HF_API_TOKEN or "placeholder" in HF_API_TOKEN:
        raise ValueError("No valid HF API token provided")

    response = requests.post(
        HF_API_URL,
        headers=HF_HEADERS,
        json={"inputs": text},
        timeout=15
    )
    
    if response.status_code != 200:
        result = response.json()
        print(f"HF API Error: {result}")
        raise ValueError(f"HF API returned status {response.status_code}: {result}")
    
    result = response.json()
    try:
        # Expected format: [[{'label': 'LABEL_X', 'score': 0.9}]]
        if isinstance(result, list) and len(result) > 0:
            if isinstance(result[0], list) and len(result[0]) > 0:
                return result[0][0]["label"], result[0][0]["score"]
            elif isinstance(result[0], dict):
                return result[0]["label"], result[0]["score"]
        raise ValueError(f"Unexpected response format: {result}")
    except (KeyError, IndexError) as e:
        print(f"Error parsing HF response: {e}, result: {result}")
        raise


# -----------------------------
# MAIN FUNCTION
# -----------------------------
def analyze_reflection_sentiment(text):
    """
    Tries multiple methods for sentiment analysis:
    1. Basic rule-based overrides (fastest)
    2. Local fine-tuned model
    3. Generic transformers pipeline
    4. Hugging Face Inference API
    """
    explanation = []
    
    # 1. Rule-based first (covers clear cases quickly)
    emotion, empathy_score = apply_rules(text, "Neutral", 50)
    if emotion != "Neutral":
        explanation = generate_explanation(text, emotion)
        return emotion, empathy_score, "Rule-based (Override)", explanation

    # Default values if rules don't catch anything specific
    label = "Neutral"
    score = 0.5
    source = "Rule-based (Default)"

    try:
        # 2. Local Fine-tuned
        if local_classifier:
            result = local_classifier(text)[0]
            label = result["label"]
            score = result["score"]
            source = "Local Fine-Tuned Model"
        else:
            # 3. Try generic local model (optional fallback)
            classifier = get_generic_classifier()
            if classifier:
                result = classifier(text)[0]
                label = result["label"]
                score = result["score"]
                source = "Local Generic Model"
            else:
                # 4. Try API as last resort
                print("🔁 Falling back to HF API")
                label, score = hf_api_predict(text)
                source = "HF API"

        # Apply mapping based on model result if rules didn't override
        emotion, empathy_score = apply_rules(text, label, score)
        
        explanation = generate_explanation(text, emotion)

    except Exception as e:
        print(f"⚠️ Sentiment analysis pipeline failed: {e}")
        # Final fallback is already set to Neutral
        emotion = "Neutral"
        empathy_score = 50
        source = "System Fallback"
        explanation = generate_explanation(text, emotion)

    return emotion, empathy_score, source, explanation