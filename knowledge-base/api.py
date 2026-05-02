# -*- coding: utf-8 -*-

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from conversation_engine import ConversationEngine
from knowledge_base import opening_name_prompt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = ConversationEngine()

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def home():
    return {"status": "TAREO Knowledge Base API is running"}

@app.post("/kb/start")
def start_chat():
    global engine
    engine = ConversationEngine()
    return {"response": opening_name_prompt, "state": engine.state}

@app.post("/kb/chat")
def chat(request: ChatRequest):
    response = engine.process_message(request.message)
    return {"response": response, "state": engine.state}

@app.post("/kb/reset")
def reset_chat():
    global engine
    engine = ConversationEngine()
    return {"response": opening_name_prompt, "state": engine.state}