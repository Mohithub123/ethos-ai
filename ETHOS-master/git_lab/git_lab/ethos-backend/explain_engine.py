# api/explain_engine.py

def generate_explanation(text: str, emotion: str):
    text_lower = text.lower()

    explanation_points = []

    # Regret indicators
    regret_words = ["regret", "sorry", "apologize", "apology"]
    if any(word in text_lower for word in regret_words):
        explanation_points.append("You expressed regret for your actions.")

    # Responsibility indicators
    responsibility_phrases = [
        "my fault",
        "i was wrong",
        "i overreacted",
        "i should not have",
        "i shouldn't have"
    ]
    if any(phrase in text_lower for phrase in responsibility_phrases):
        explanation_points.append("You accepted personal responsibility.")

    # Growth / future improvement
    growth_phrases = [
        "next time",
        "i will improve",
        "i will try",
        "i will handle",
        "in the future"
    ]
    if any(phrase in text_lower for phrase in growth_phrases):
        explanation_points.append("You committed to improving your behavior.")

    # Defensive language
    defensive_phrases = [
        "they deserved",
        "not my fault",
        "anyone would",
        "i had no choice"
    ]
    if any(phrase in text_lower for phrase in defensive_phrases):
        explanation_points.append("Your reflection includes defensive language.")

    if not explanation_points:
        explanation_points.append("The reflection shows limited emotional indicators.")

    return explanation_points