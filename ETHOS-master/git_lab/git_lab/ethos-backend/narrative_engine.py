import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=GEMINI_API_KEY)


def generate_role_reversal_narrative(scenario: str) -> str:
    if not scenario.strip():
        return "Please enter a scenario."

    prompt = f"""
You are an AI system designed for ethical self-reflection and empathy development.

TASK:
Transform the following scenario into a brief, emotionally powerful first-person narrative from the victim's perspective.

REQUIREMENTS:
- First-person voice ("I", "me", "my")
- 120-180 words maximum (be concise and impactful)
- Include psychological impact and mention effects on close ones (family, friends, loved ones) when relevant
- Vary your storytelling style - don't follow a formula. Sometimes focus on:
  * Internal thoughts and feelings
  * A specific moment of realization
  * The aftermath and ripple effects
  * Conversation with a loved one about it
  * Physical and emotional responses intertwined
- Make it feel like a genuine human story, not a template
- Focus on deep emotional truth over dramatic details
- Do NOT justify the perpetrator
- Do NOT include legal advice

SCENARIO:
{scenario}

Write a short, meaningful narrative from the victim's perspective:
"""

    try:
        response = client.models.generate_content(
            model="models/gemini-2.5-flash",
            contents=prompt
        )

        return response.text.strip()

    except Exception as e:
        return f"AI narrative engine unavailable.\n{str(e)}"