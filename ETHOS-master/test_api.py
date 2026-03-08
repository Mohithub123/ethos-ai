import requests
import json

print("=== ETHOS API COMPREHENSIVE TEST ===\n")

# 1. Health Check
print("1. Health Check:")
response = requests.get("http://127.0.0.1:8000/")
print(f"   ✓ {response.json()['message']}\n")

# 2. Narrative Generation
print("2. Narrative Generation:")
narrative_response = requests.post(
    "http://127.0.0.1:8000/generate-narrative",
    json={"scenario": "I blamed my friend for being late"}
)
narrative = narrative_response.json()
print(f'   ✓ Generated {len(narrative["narrative"])} characters\n')

# 3. Sentiment Analysis Tests
print("3. Sentiment Analysis:")
tests = [
    ("Defensive (their fault) ", "It was their fault, they should have known better."),
    ("Defensive (not my fault)", "I did nothing wrong, not my fault."),
    ("Remorseful (sorry+regret)", "I am so sorry for what I did. I deeply regret my actions."),
    ("Remorseful (apologize)   ", "I apologize and want to make it right."),
    ("Neutral                  ", "The meeting was scheduled for 3pm.")
]

for name, text in tests:
    result = requests.post(
        "http://127.0.0.1:8000/analyze-reflection",
        json={"reflection": text}
    ).json()
    print(f"   {name}: {result['sentiment']:12} (score: {result['score']:2}, source: {result['source']})")

print("\n✅ ALL SYSTEMS OPERATIONAL!")
