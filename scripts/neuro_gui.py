# requirements.txt
# pip install customtkinter opencv-python pyautogui geocoder matplotlib pillow

import customtkinter as ctk
import cv2
import threading
import time
import random
import sys
import os
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure
import tkinter as tk
from tkinter import messagebox
from PIL import Image
import active_defense  # Import the backend logic

# --- Configuration ---
ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("dark-blue")

# --- Colors & Styles ---
COLOR_BG = "#050505"
COLOR_CYAN = "#00E5FF"
COLOR_RED = "#FF2A2A"
COLOR_ORANGE = "#FFA500"
FONT_MONO = ("Roboto Mono", 12)
FONT_HEADER = ("Roboto Mono", 20, "bold")

class NeuroApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        # Window Setup
        self.title("NEURO-MIMESIS // IDENTITY VERIFICATION")
        self.geometry("1000x700")
        self.configure(fg_color=COLOR_BG)
        self.attributes('-topmost', True)  # Always on top
        
        self.running = True
        
        # Initialize Backend
        # NOTE: Using dummy credentials for the GUI demo. 
        # In a real scenario, these should be loaded securely.
        self.defense_system = active_defense.NeuroDefense(
            owner_email="admin@neuromimesis.com", 
            email_password="dummy_password"
        )

        # Layout Configuration
        self.grid_columnconfigure(0, weight=1)
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=3) # Trust Monitor
        self.grid_rowconfigure(1, weight=1) # Controls

        # Component Containers
        self.frame_monitor = ctk.CTkFrame(self, fg_color="transparent", corner_radius=0)
        self.frame_monitor.grid(row=0, column=0, columnspan=2, sticky="nsew", padx=20, pady=20)
        
        self.frame_controls = ctk.CTkFrame(self, fg_color="transparent", corner_radius=0)
        self.frame_controls.grid(row=1, column=0, columnspan=2, sticky="nsew", padx=20, pady=20)

        # Build Modules
        self.build_trust_monitor()
        self.build_controls()

        # Start Background Threads
        self.thread_logs = threading.Thread(target=self.update_logs, daemon=True)
        self.thread_logs.start()

        self.protocol("WM_DELETE_WINDOW", self.on_close)

    def build_trust_monitor(self):
        # 1. Trust Score Gauge (Simulated with ProgressBar)
        self.lbl_trust = ctk.CTkLabel(self.frame_monitor, text="TRUST SCORE: 98%", text_color=COLOR_CYAN, font=FONT_HEADER)
        self.lbl_trust.pack(pady=(10, 5))
        
        self.progress_trust = ctk.CTkProgressBar(self.frame_monitor, width=400, height=20, progress_color=COLOR_CYAN)
        self.progress_trust.set(0.98)
        self.progress_trust.pack(pady=10)

        # 2. Entropy Graph (Matplotlib)
        self.fig = Figure(figsize=(8, 3), dpi=80, facecolor=COLOR_BG)
        self.ax = self.fig.add_subplot(111)
        self.ax.set_facecolor(COLOR_BG)
        self.ax.tick_params(colors=COLOR_CYAN, labelsize=8)
        self.ax.spines['bottom'].set_color(COLOR_CYAN)
        self.ax.spines['top'].set_color(COLOR_BG)
        self.ax.spines['left'].set_color(COLOR_CYAN)
        self.ax.spines['right'].set_color(COLOR_BG)
        
        self.x_data = list(range(50))
        self.y_data = [random.randint(40, 60) for _ in range(50)]
        self.line, = self.ax.plot(self.x_data, self.y_data, color=COLOR_CYAN, linewidth=1.5)
        
        self.canvas = FigureCanvasTkAgg(self.fig, master=self.frame_monitor)
        self.canvas.draw()
        self.canvas.get_tk_widget().pack(fill="both", expand=True, pady=10)
        
        # Start Graph Animation
        self.animate_graph()

        # 3. System Logs
        self.log_box = ctk.CTkTextbox(self.frame_monitor, height=150, fg_color="#101010", text_color=COLOR_CYAN, font=FONT_MONO)
        self.log_box.pack(fill="x", pady=10)
        self.log("SYSTEM INITIALIZED... NEURO-LINK ESTABLISHED 📡")

    def build_controls(self):
        # Module 2: Active Defense
        self.btn_attack = ctk.CTkButton(
            self.frame_controls, 
            text="⚠️ SIMULATE ATTACK", 
            fg_color=COLOR_BG, 
            border_color=COLOR_RED, 
            border_width=2,
            text_color=COLOR_RED,
            font=FONT_HEADER,
            hover_color="#330000",
            command=self.trigger_attack_mode
        )
        self.btn_attack.pack(side="left", fill="both", expand=True, padx=20)

        # Module 3: Safety Protocol
        self.btn_panic = ctk.CTkButton(
            self.frame_controls, 
            text="🛡️ SOS / PANIC", 
            fg_color=COLOR_BG, 
            border_color=COLOR_ORANGE, 
            border_width=2,
            text_color=COLOR_ORANGE,
            font=FONT_HEADER,
            hover_color="#331800",
            command=self.trigger_safety_protocol
        )
        self.btn_panic.pack(side="right", fill="both", expand=True, padx=20)

    # --- Feature Logic ---

    def animate_graph(self):
        if not self.running: return
        
        # Shift data
        self.y_data.pop(0)
        new_val = random.randint(30, 70)
        if "ATTACK" in self.lbl_trust.cget("text"):
            new_val = random.randint(80, 100) # High entropy during attack
        self.y_data.append(new_val)
        
        self.line.set_ydata(self.y_data)
        self.canvas.draw()
        self.after(100, self.animate_graph)

    def update_logs(self):
        logs = [
            "analyzing keystroke latency...",
            "verifying biometric signature...",
            "scanning for unauthorized processes...",
            "network traffic: normal",
            "checking pupil dilation...",
            "encrypting data stream..."
        ]
        while self.running:
            time.sleep(random.uniform(0.5, 2.0))
            msg = f"[{random.choice(['INFO', 'SCAN', 'OK'])}] {random.choice(logs)}"
            self.log(msg)

    def log(self, message):
        timestamp = time.strftime("%H:%M:%S")
        full_msg = f"[{timestamp}] {message}\n"
        self.log_box.insert("end", full_msg)
        self.log_box.see("end")

    def trigger_attack_mode(self):
        self.log("[CRITICAL] THREAT DETECTED! INITIATING ACTIVE DEFENSE 🔒")
        
        # Visual Changes
        self.configure(fg_color="#200000")
        self.lbl_trust.configure(text="THREAT DETECTED", text_color=COLOR_RED)
        self.progress_trust.configure(progress_color=COLOR_RED)
        self.ax.spines['bottom'].set_color(COLOR_RED)
        self.ax.spines['left'].set_color(COLOR_RED)
        self.line.set_color(COLOR_RED)
        
        # Execute Defense Logic (Threaded)
        def defense_sequence():
            # 1. Capture Intruder Selfie
            self.log("CAPTURING EVIDENCE...")
            success = self.defense_system.capture_evidence()
            if success:
                self.log("EVIDENCE CAPTURED: intruder_evidence.jpg 📸")
            else:
                self.log("CAMERA ERROR - PROCEEDING WITH LOCKDOWN")
            
            # 2. Simulate Lockdown
            self.log("LOCKING INTERFACE FOR 5 SECONDS...")
            self.btn_attack.configure(state="disabled")
            self.btn_panic.configure(state="disabled")
            
            # Show "LOCKED" Overlay
            lbl_locked = ctk.CTkLabel(self, text="SYSTEM LOCKED", font=("Impact", 60), text_color=COLOR_RED, fg_color="black")
            lbl_locked.place(relx=0.5, rely=0.5, anchor="center")
            
            # Wait 5 seconds
            time.sleep(5)
            
            # Reset
            lbl_locked.destroy()
            self.reset_ui()
            self.log("SYSTEM REBOOTED. THREAT NEUTRALIZED.")
            
        threading.Thread(target=defense_sequence, daemon=True).start()

    def trigger_safety_protocol(self):
        self.log("[SILENT ALARM] SOS PROTOCOL INITIATED 👮")
        
        # Visual Changes
        self.configure(fg_color="#201000")
        self.lbl_trust.configure(text="SAFE MODE ENABLED", text_color=COLOR_ORANGE)
        self.progress_trust.configure(progress_color=COLOR_ORANGE)
        self.ax.spines['bottom'].set_color(COLOR_ORANGE)
        self.ax.spines['left'].set_color(COLOR_ORANGE)
        self.line.set_color(COLOR_ORANGE)
        
        # Logic
        def safety_sequence():
            # 1. Get Location
            loc = self.defense_system.get_location()
            self.log(f"GPS SENT TO CONTACTS: {loc} 📡")
            
            # 2. Fake OS Popup
            time.sleep(1)
            try:
                # Use a standard messagebox for the popup
                messagebox.showinfo("Safe Mode", "Safe Mode Activated.\nWindows Loading...\nPlease Wait.")
            except:
                pass
            
            self.reset_ui()
            
        threading.Thread(target=safety_sequence, daemon=True).start()

    def reset_ui(self):
        self.configure(fg_color=COLOR_BG)
        self.lbl_trust.configure(text="TRUST SCORE: 98%", text_color=COLOR_CYAN)
        self.progress_trust.configure(progress_color=COLOR_CYAN)
        self.ax.spines['bottom'].set_color(COLOR_CYAN)
        self.ax.spines['left'].set_color(COLOR_CYAN)
        self.line.set_color(COLOR_CYAN)
        self.btn_attack.configure(state="normal")
        self.btn_panic.configure(state="normal")

    def on_close(self):
        self.running = False
        self.destroy()

if __name__ == "__main__":
    app = NeuroApp()
    app.mainloop()
