from fastapi import FastAPI
from pydantic import BaseModel
from ai_model import ask_ai21, CODE_SYSTEM_PROMPT
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv() 
app = FastAPI(title="AI_IDE_EDITOR")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str
    action: str

@app.post("/ai/code")
def ask_ai(request: CodeRequest):
    try:
        user_prompt = f"Action: {request.action}\n\nCode:\n{request.code}"
        result = ask_ai21(user_prompt, system_prompt=CODE_SYSTEM_PROMPT)
        return {"response": result}
    except Exception as e:
        return {"error": str(e)}
