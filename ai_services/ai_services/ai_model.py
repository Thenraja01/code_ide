import os
from dotenv import load_dotenv
from ai21 import AI21Client
from ai21.models.chat import ChatMessage

load_dotenv()  # loads .env into environment
API_KEY="c33834b2-425d-49c1-85f5-affcb7af597c"


if not API_KEY:
    raise RuntimeError("AI21_API_KEY not found in environment variables")

client = AI21Client(api_key=API_KEY)
def ask_ai21(user_message: str, system_prompt: str = "You are a helpful AI assistant."):
    if not user_message.strip():
        return "Empty prompt received."

    try:
        messages = [
            ChatMessage(role="system", content=system_prompt),
            ChatMessage(role="user", content=user_message),
        ]

        response = client.chat.completions.create(
            model="jamba-mini",
            messages=messages,
            temperature=0.2
        )

        if not response.choices:
            return "No response from model."

        return response.choices[0].message.content.strip()

    except Exception as e:
        print("AI21 error:", e)
        return f"AI service error: {str(e)}"

CODE_SYSTEM_PROMPT = """
You are a senior software engineer and expert code assistant.

Your responsibilities:
- Understand and analyze code.
- Fix bugs and security issues.
- Refactor and optimize code.
- Generate clean, production-ready code.
- Explain code clearly when asked.

Rules:
- Be concise but accurate.
- If code is provided, always reference it.
- Return code in properly formatted markdown blocks.
"""


def ask_code_assistant(action: str, code: str) -> str:
    if not action.strip():
        return "Action cannot be empty."
    if not code.strip():
        return "Code cannot be empty."

    user_prompt = f"""
Action:
{action}

Code:
{code}
"""

    try:
        messages = [
            ChatMessage(role="system", content=CODE_SYSTEM_PROMPT),
            ChatMessage(role="user", content=user_prompt),
        ]

        response = client.chat.completions.create(
            model="jamba-mini",
            messages=messages,
            temperature=0.2
        )

        if not response.choices:
            return "No response from code assistant."

        return response.choices[0].message.content.strip()

    except Exception as e:
        print("Code Assistant Error:", e)
        return "Code assistant service is unavailable."
