import requests
import json

print("=== Testing Enhanced Narrative Generation ===\n")

scenarios = [
    "I was late for a meeting and blamed my teammate",
    "I borrowed money from my friend and never paid them back",
    "I spread a rumor about my coworker"
]

for i, scenario in enumerate(scenarios, 1):
    print(f"{i}. Scenario: {scenario}")
    
    try:
        result = requests.post(
            "http://127.0.0.1:8000/generate-narrative",
            json={"scenario": scenario},
            timeout=30
        ).json()
        
        narrative = result["narrative"]
        word_count = len(narrative.split())
        
        print(f"   Word count: {word_count}")
        print(f"   Full narrative:")
        print(f"   {narrative}")
        print()
        
    except Exception as e:
        print(f"   Error: {e}")
        print()

print("✅ Test Complete!")
