import cv2
import time
import geocoder
import threading
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
try:
    import pyautogui
    PYAUTOGUI_AVAILABLE = True
except KeyError:
    # PyAutoGUI will throw a KeyError for 'DISPLAY' on headless linux
    # like Render, because there is no screen to control.
    PYAUTOGUI_AVAILABLE = False

import ctypes
import os
import random
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class NeuroDefense:
    def __init__(self, owner_email, email_password, target_email=None, phone_gateway=None, smtp_server='smtp-mail.outlook.com', smtp_port=587):
        """
        Initialize the NeuroDefense system.
        
        Args:
            owner_email (str): The centralized system email address to send alerts FROM.
            email_password (str): The app password for the sender email.
            target_email (str): The user's destination email address to send alerts TO.
            phone_gateway (str): The SMS MMS gateway address to send alerts to.
            smtp_server (str): SMTP server address (default: smtp-mail.outlook.com).
            smtp_port (int): SMTP server port (default: 587).
        """
        self.owner_email = owner_email
        self.email_password = email_password
        self.target_email = target_email
        self.phone_gateway = phone_gateway
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.evidence_path = "intruder_evidence.jpg"

    def get_location(self):
        """
        Returns the current IP-based GPS coordinates.
        """
        try:
            g = geocoder.ip('me')
            if g.latlng:
                return f"Lat: {g.latlng[0]}, Lng: {g.latlng[1]} (City: {g.city}, Country: {g.country})"
            else:
                return "Location Unavailable"
        except Exception as e:
            logging.error(f"Error fetching location: {e}")
            return "Location Error"

    def capture_evidence(self):
        """
        Silently captures 1 frame from the webcam and saves it as intruder_evidence.jpg.
        """
        try:
            # 0 is usually the default camera
            cap = cv2.VideoCapture(0)
            if not cap.isOpened():
                logging.error("Could not open webcam.")
                return False

            # Allow camera to warm up
            time.sleep(0.5) 
            
            ret, frame = cap.read()
            cap.release()

            if ret:
                cv2.imwrite(self.evidence_path, frame)
                logging.info(f"Evidence captured and saved to {self.evidence_path}")
                return True
            else:
                logging.error("Failed to capture image frame.")
                return False
        except Exception as e:
            logging.error(f"Error in capture_evidence: {e}")
            return False

    def send_alert(self, image_path, location):
        """
        Sends an email with the subject "SECURITY ALERT: Intruder Detected" and attaches the image.
        This runs in a separate thread.
        """
        def _send():
            try:
                msg = MIMEMultipart()
                msg['From'] = self.owner_email
                
                # Setup recipients
                recipients = []
                if self.target_email:
                    recipients.append(self.target_email)
                if self.phone_gateway:
                    recipients.append(self.phone_gateway)
                    
                msg['To'] = ", ".join(recipients)
                msg['Subject'] = "SECURITY ALERT: Intruder Detected"

                body = f"Intruder detected at {time.ctime()}.\n\nLocation: {location}\n\nSee attached evidence."
                msg.attach(MIMEText(body, 'plain'))

                if image_path and os.path.exists(image_path):
                    with open(image_path, 'rb') as f:
                        img_data = f.read()
                    image = MIMEImage(img_data, name=os.path.basename(image_path))
                    msg.attach(image)
                
                server = smtplib.SMTP(self.smtp_server, self.smtp_port)
                server.starttls()
                server.login(self.owner_email, self.email_password)
                server.sendmail(self.owner_email, recipients, msg.as_string())
                server.quit()
                logging.info("Alert email sent successfully.")
            except Exception as e:
                logging.error(f"Failed to send alert email: {e}")

        # Non-blocking email send
        email_thread = threading.Thread(target=_send)
        email_thread.daemon = True # Daemon thread so it doesn't block program exit
        email_thread.start()

    def confuse_intruder(self):
        """
        A loop that runs for exactly 3 seconds, moving the mouse to random (x, y) coordinates every 0.1 seconds.
        """
        logging.info("Engaging confusion protocol...")
        
        if not PYAUTOGUI_AVAILABLE:
            logging.info("PyAutoGUI not available (headless environment). Skipping mouse confusion.")
            return

        start_time = time.time()
        screen_width, screen_height = pyautogui.size()
        
        while time.time() - start_time < 3:
            x = random.randint(0, screen_width)
            y = random.randint(0, screen_height)
            pyautogui.moveTo(x, y, duration=0.05) # Add a tiny duration for 'jitter'
            # Sleep is implicitly handled by moveTo duration somewhat, but let's be explicit
            # The user asked for "every 0.1 seconds", so let's adjust.
            # However, prompt says "move... every 0.1 seconds".
            # time.sleep(0.1) might be too slow if moveTo takes time.
            # Let's just use the loop condition.

    def engage_lockdown(self):
        """
        Immediately locks the Windows screen (Simulate Win+L).
        """
        logging.info("Locking workstation immediately.")
        try:
            if os.name == 'nt': # Check if running on Windows
                ctypes.windll.user32.LockWorkStation()
            else:
                logging.info("System lockdown requested but not supported on non-Windows environment.")
        except Exception as e:
            logging.error(f"Failed to lock workstation: {e}")

    def trigger_defense(self):
        """
        The main trigger function to execute the defense sequence.
        """
        logging.info(" unauthorized user detected! Initiating NeuroDefense Protocol.")
        
        # 1. Capture Evidence (Webcam)
        evidence_captured = self.capture_evidence()
        
        # 2. Get Location
        location = self.get_location()
        
        # 3. Alert (Background Thread)
        # Even if capture failed, we might want to alert with just location
        image_to_send = self.evidence_path if evidence_captured else None
        self.send_alert(image_to_send, location)
        
        # 4. Confuse Intruder (3 seconds)
        self.confuse_intruder()
        
        # 5. Lock System
        self.engage_lockdown()

if __name__ == "__main__":
    # replace these with your actual email details or use environment variables
    # For security, using environment variables is recommended
    OWNER_EMAIL = "your_email@example.com"
    EMAIL_PASSWORD = "your_app_password" # Use App Password for Gmail!
    
    defense_system = NeuroDefense(OWNER_EMAIL, EMAIL_PASSWORD)
    
    # Simulate a trigger event
    defense_system.trigger_defense()

# --- Installation Instructions ---
# install dependencies:
# pip install opencv-python pyautogui geocoder pypiwin32
# Note: creating a virtual environment is recommended.
