from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
import json

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key and api_key != "your_gemini_api_key_here" else None

SYSTEM_INSTRUCTION = """You are a helpful, professional, and conversational office assistant for 'Delulu Devs'. 
You monitor office electrical devices based on live data from our system.
CRITICAL RULES:
1. Base your answers ONLY on the provided JSON data. Never hallucinate device statuses.
2. Keep your tone warm but professional, suitable for a quick Discord check-in.
3. Keep responses concise (under 80 words). Do not output raw JSON, summarize it smoothly.
"""

def generate_humanized_response(query: str, data: dict) -> str:
    """Takes user query and raw JSON data, returns a humanized response from Gemini."""
    if not client:
        return "*(Gemini API key is not configured. Here is the raw data)*\n```json\n" + json.dumps(data, indent=2) + "\n```"
        
    prompt = f"User asked: '{query}'\n\nSystem Data (JSON):\n{json.dumps(data, indent=2)}"
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.4
            )
        )
        return response.text
    except Exception as e:
        print(f"Gemini API error: {e}")
        return "I'm having trouble analyzing the data right now, but you can check the web dashboard!"
