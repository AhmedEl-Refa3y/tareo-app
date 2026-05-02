
# -*- coding: utf-8 -*-
import tkinter as tk
from tkinter import scrolledtext
from conversation_engine import ConversationEngine
from knowledge_base import opening_name_prompt

class TareoDoctor:
    def __init__(self):
        self.window = tk.Tk()
        self.window.title("TAREO - الطبيب الرقمي")
        self.window.geometry("980x720")
        self.window.configure(bg="#2c3e50")
        self.engine = ConversationEngine()
        self.setup_ui()

    def setup_ui(self):
        self.window.grid_rowconfigure(1, weight=1)
        self.window.grid_columnconfigure(0, weight=1)

        title_frame = tk.Frame(self.window, bg="#16a085", height=70)
        title_frame.grid(row=0, column=0, sticky="ew")
        tk.Label(title_frame, text="TAREO - الطبيب الرقمي", font=("Arial", 18, "bold"), bg="#16a085", fg="white").pack(expand=True, pady=15)

        chat_frame = tk.Frame(self.window, bg="#2c3e50")
        chat_frame.grid(row=1, column=0, sticky="nsew", padx=15, pady=10)
        chat_frame.grid_rowconfigure(0, weight=1)
        chat_frame.grid_columnconfigure(0, weight=1)

        self.chat_area = scrolledtext.ScrolledText(chat_frame, wrap=tk.WORD, font=("Arial", 13), bg="#ecf0f1", fg="#2c3e50", padx=14, pady=14)
        self.chat_area.grid(row=0, column=0, sticky="nsew")
        self.chat_area.tag_configure("user", foreground="#1f2d3d", font=("Arial", 13, "bold"))
        self.chat_area.tag_configure("doctor", foreground="#2c3e50", font=("Arial", 13))
        self.chat_area.tag_configure("system", foreground="#16a085", font=("Arial", 13, "bold"))

        input_frame = tk.Frame(self.window, bg="#34495e", height=80)
        input_frame.grid(row=2, column=0, sticky="ew", padx=15, pady=10)
        input_frame.grid_columnconfigure(0, weight=1)

        self.input_field = tk.Entry(input_frame, font=("Arial", 14), bg="white", fg="#2c3e50", bd=2, relief=tk.GROOVE)
        self.input_field.grid(row=0, column=0, sticky="ew", padx=(10,10), pady=10)
        self.input_field.bind("<Return>", self.send_message)
        self.input_field.focus_set()

        self.send_button = tk.Button(input_frame, text="إرسال", font=("Arial", 12, "bold"), bg="#16a085", fg="white", bd=0, padx=20, pady=8, cursor="hand2", command=self.send_message)
        self.send_button.grid(row=0, column=1, padx=(0,10), pady=10)

    def add_message(self, text: str, tag: str):
        self.chat_area.insert(tk.END, f"{text}\n\n", tag)
        self.chat_area.see(tk.END)
        self.window.update()

    def send_message(self, event=None):
        user_input = self.input_field.get().strip()
        if not user_input:
            return
        self.input_field.delete(0, tk.END)
        self.add_message(f"حضرتك: {user_input}", "user")
        response = self.engine.process_message(user_input)
        self.add_message(response, "doctor")
        if self.engine.state == "ENDED":
            self.input_field.config(state="disabled")
            self.send_button.config(state="disabled")

    def run(self):
        self.add_message(opening_name_prompt, "system")
        self.window.mainloop()

if __name__ == "__main__":
    TareoDoctor().run()
