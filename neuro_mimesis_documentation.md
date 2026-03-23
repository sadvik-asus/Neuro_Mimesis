# Neuro-Mimesis: Cognitive Identity Verification Support System

## 1. Project Overview
**Neuro-Mimesis** is a cutting-edge security framework designed to move beyond traditional passwords and static biometrics. It implements **Cognitive Identity Verification** by analyzing the unique behavioral patterns of a user's interaction with their computer (specifically mouse movement dynamics). By creating a digital "fingerprint" of how a user thinks and moves, the system can detect unauthorized intruders in real-time and initiate automated countermeasures.

---

## 2. Problem Statement
Traditional security measures (passwords, 2FA) are vulnerable to social engineering, credential theft, and unauthorized physical access to an unlocked workstation. 
*   **Static Vulnerability**: Once an intruder is past the login screen, most systems are wide open.
*   **Response Lag**: Usually, the owner only discovers a breach after the damage is done.

---

## 3. Solution: Behavioral Defense
Neuro-Mimesis addresses these gaps by:
1.  **Continuous Authentication**: Verifying the user NOT just at login, but throughout the entire session.
2.  **Behavioral Biometrics**: Using AI-driven analysis of mouse velocity, acceleration, and precision to verify identity.
3.  **Active Defense**: Instead of just logging the breach, the system fights back with automated countermeasures.

---

## 4. System Architecture
The system is built as a hybrid application combining a modern web interface with a powerful OS-level background service.

### A. Frontend (React + Vite + Tailwind)
*   **Dashboard**: Real-time visualization of "Trust Scores" and system status.
*   **Enrollment Module**: Captures the user's "Behavioral Sequence" to train the local identity model.
*   **Mouse Heatmap**: Visualizes interaction patterns for transparency and debugging.
*   **Aesthetics**: Cyberpunk-inspired "High-Tech" design using Glassmorphism and Framer Motion for a premium user experience.

### B. Backend (Flask + SQLite)
*   **Identity Store**: Securely stores hashed behavioral patterns and user profiles.
*   **API Layer**: Bridges the web interface with the system-level defense modules.
*   **Auth Manager**: Handles registration and login using industry-standard hashing.

### C. Active Defense Module (Python + OpenCV + PyAutoGUI)
*   **The Guard**: Monitors interaction and executes the defense sequence when trust drops below threshold.

---

## 5. Key Features & Protocols

### Behavioral Enrollment
The system records high-frequency mouse data (X/Y coordinates, speed, jitter) to create a multi-dimensional "Cognitive Profile." No two users move the mouse in the exact same way.

### The "Active Defense" Protocol
When an unauthorized user is detected, the system triggers a 5-step response:
1.  **Evidence Capture**: Silently captures a high-resolution photo of the intruder using the webcam.
2.  **Geo-Location Stalking**: Extracts IP-based GPS coordinates (Lat/Lng, City, Country).
3.  **Emergency Broadcast**: Sends an automated alert via Email and SMS (MMS gateway) containing the location and photo-evidence.
4.  **Intruder Confusion**: Hijacks the mouse cursor with random jitter/movements for 3 seconds, making it impossible for the intruder to delete files or install malware.
5.  **Hard Lockdown**: Force-locks the Windows workstation, requiring the owner's physical credentials to re-enter.

---

## 6. Technology Stack
*   **UI/UX**: React 19, Vite, Tailwind CSS, Framer Motion (Animations), Lucide (Icons), Recharts (Data Viz).
*   **Language**: TypeScript (Frontend), Python 3.x (Backend & Security).
*   **Image Processing**: OpenCV (Webcam control).
*   **Automation**: PyAutoGUI (Mouse control), Pypiwin32 (Windows API integration).
*   **Database**: SQLite3.
*   **Deployment**: Ready for Electron (Desktop Wrapper).

---

## 7. Future Roadmap
*   **Multi-Model Analysis**: Adding keyboard typing dynamics and application usage patterns.
*   **Zero-Trust Integration**: Integration with enterprise Active Directory.
*   **Deep Learning**: Utilizing Graph Neural Networks to analyze complex interaction trajectories.

---

## 8. Presentation Tips
*   **Demo Sequence**: Show the "Enrollment" process first. Then, simulate an intruder (move the mouse erratically) and trigger the "Panic" or "Defense" mode to show the webcam capture and lockdown.
*   **Key Talking Point**: Focus on the **"MIMESIS"** concept—how the machine learns to mimic and recognize the user's specific cognitive-motor output.
*   **Impact**: Highlight that this is "Proactive" security, not just "Reactive" logging.

Cognitive Identity vs. Static Biometrics:

Explain that while a fingerprint or face can be spoofed or captured Once, Neuro-Mimesis analyzes how you think and move. It creates a continuous "Humanity Score" based on mouse entropy, velocity, and rhythm.
Point to make: "The way you move a cursor is as unique as your DNA."
Continuous Trust Model:

Most systems only verify you at the login screen. Neuro-Mimesis verifies you every second. If an intruder takes over an unlocked machine, the system detects the change in behavior immediately and drops the "Trust Score."
Proactive "Active Defense":

This is the "Wow" factor. Unlike traditional logs that just record a breach, this system fights back:
Visual Evidence: Silent webcam capture of the intruder.
Physical Lockdown: Force-locking the Windows workstation.
Intruder Confusion: Randomizing mouse movement (jitter) to prevent them from clicking "Delete" or "Shutdown."
The Tech Stack:

Frontend: React + Framer Motion for that "High-Tech/Cyberpunk" premium feel.
Analytics: Radar charts and heatmaps for visualizing behavioral data.
Security Core: Python handles the OS-level interactions (OpenCV for camera, PyAutoGUI for mouse, and Windows API for lockdown).
🚀 Recommended Demo Flow
Step 1: Enrollment: Show how the system "learns" your movement.
Step 2: Verification: Show the "Access Granted" screen with a high humanity score.
Step 3: The Breach: Mimic erratic, "unnatural" mouse movements or have someone else move the mouse.
Step 4: Execute Defense: Show the "Intruder Detected" overlay. If possible, show the 

intruder_evidence.jpg
 that gets generated in the project root.