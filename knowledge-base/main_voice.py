
# -*- coding: utf-8 -*-
import os
os.environ["PYGAME_HIDE_SUPPORT_PROMPT"] = "1"

import asyncio
import html
import os
import re
import tempfile
import time
import uuid

import edge_tts
import pygame
import speech_recognition as sr

from conversation_engine import ConversationEngine
from knowledge_base import opening_name_prompt

VOICE_AR = "ar-EG-ShakirNeural"
recognizer = sr.Recognizer()

PHRASE_MAP = {
    "ORS": "أو آر إس",
    "mg": " مليجرام",
    "MG": " مليجرام",
    "Paracetamol": "باراسيتامول",
    "Domperidone": "دومبيريدون",
    "Omeprazole": "أوميبرازول",
    "Gaviscon": "جافيسكون",
    "Loperamide": "لوبيراميد",
    "Buscopan": "بسكوبان",
}

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def simplify_for_tts(text: str) -> str:
    out = clean_text(text)
    for src, dst in sorted(PHRASE_MAP.items(), key=lambda x: len(x[0]), reverse=True):
        out = out.replace(src, dst)
    return out

async def edge_speak(text: str, file_path: str):
    communicate = edge_tts.Communicate(
        text=text,
        voice=VOICE_AR,
        rate="+5%",
        pitch="+0Hz",
        volume="+8%"
    )
    await communicate.save(file_path)

def speak(text: str):
    spoken_text = simplify_for_tts(text)
    if not spoken_text:
        return
    print("Assistant:", text)
    temp_name = os.path.join(tempfile.gettempdir(), f"tareo_{uuid.uuid4().hex}.mp3")
    try:
        asyncio.run(edge_speak(spoken_text, temp_name))
        pygame.mixer.init()
        pygame.mixer.music.load(temp_name)
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            time.sleep(0.05)
        pygame.mixer.music.stop()
        pygame.mixer.quit()
    finally:
        try:
            if os.path.exists(temp_name):
                os.remove(temp_name)
        except Exception:
            pass

def listen() -> str:
    with sr.Microphone() as source:
        recognizer.dynamic_energy_threshold = True
        recognizer.pause_threshold = 2.6
        recognizer.non_speaking_duration = 1.0
        recognizer.energy_threshold = 180
        print("Listening...")
        recognizer.adjust_for_ambient_noise(source, duration=1.0)
        try:
            audio = recognizer.listen(source, timeout=20, phrase_time_limit=45)
        except Exception:
            return ""
    try:
        text = recognizer.recognize_google(audio, language="ar-EG")
        text = clean_text(text)
        print("You:", text)
        return text
    except Exception:
        return ""

def main():
    engine = ConversationEngine()
    print("=== TAREO AI Doctor - Voice Mode ===")
    speak(opening_name_prompt)
    while True:
        user_input = listen()
        if not user_input:
            speak("لم أسمعك جيدًا. إتفضل أعد الجملة بهدوء.")
            continue
        response = engine.process_message(user_input)
        speak(response)
        if engine.state == "ENDED":
            break

if __name__ == "__main__":
    main()
