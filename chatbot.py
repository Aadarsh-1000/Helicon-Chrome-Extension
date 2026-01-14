import os
from openai import OpenAI

# Option 1 (recommended): get API key from environment variable
# Make sure you set it before running this script:
# Windows CMD: setx OPENAI_API_KEY "sk-yourkeyhere"
# macOS/Linux: export OPENAI_API_KEY="sk-yourkeyhere"

# Option 2: pass API key directly (for testing only)
api_key = "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"

# Create OpenAI client
client = OpenAI(api_key=api_key)

def chat_with_gpt(prompt):
    """
    Sends a prompt to GPT-3.5-turbo using the new OpenAI Python SDK.
    """
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    # Access the assistant's message content
    return response.choices[0].message.content

if __name__ == "__main__":
    print("Chatbot running! Type 'exit' or 'quit' to stop.")
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Exiting chat.")
            break
        try:
            response = chat_with_gpt(user_input)
            print("Chatbot:", response)
        except Exception as e:
            print("Error:", e)
