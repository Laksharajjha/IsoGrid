# IsoGrid - Healthcare Isolation Ward Allocation System 🏥💠

IsoGrid is a high-concurrency, real-time visual bed booking system designed for infectious disease wards. It prioritizes patient safety through **Adjacency Logic**, preventing appointments in risk zones (direct neighbors of infectious patients) while recommending optimal isolation slots.

![IsoGrid Banner](https://placeholder-banner-link-optional)

## 🌟 Key Features

### 🧠 **Intelligent Bed Allocation**
*   **Safety-First**: The system automatically blocks beds adjacent (Top, Bottom, Left, Right) to infectious patients.
*   **Smart Recommendation**: A "Brain" button analyzes the ward layout and suggests the optimal bed to maximize isolation distance.

### ⚡ **Real-Time Synchronization**
*   **Ghost Locking**: See which beds other users are hovering over in real-time (preventing double-booking conflicts).
*   **Instant Updates**: Bed status changes (Booked, Discharged, Maintenance) are instantly reflected across all connected clients via Socket.io.

### 🦠 **Contagion Simulation**
*   **Ripple Effect**: Marking a patient as "Infectious" triggers a visual ripple effect, instantly locking neighboring beds to prevent cross-contamination.
*   **Vital Signs Monitor**: View live (simulated) telemetry for Heart Rate, SpO2, and BP for each patient.

### 🏥 **Ward Management**
*   **Patient Transfer**: Seamlessly move patients between beds or wards.
*   **Discharge & Maintenance**: Efficiently manage patient outflow and bed sanitization cycles (with 20-minute countdown timers).
*   **Auto-Admit**: One-click admission for rapid processing during high-load scenarios.

### 🛡️ **Security & Logging**
*   **Role-Based Access**: Secure login system (e.g., Doctors, Admins).
*   **Audit Trail**: Comprehensive activity logs track every action (Admission, Transfer, Discharge) with user attribution.

---

## 🎨 Visual Identity: Medical Glassmorphism
The UI is built with a sophisticated "Medical Glassmorphism" aesthetic:
*   **Safe/Available**: Soft Emerald Green
*   **Occupied (Infectious)**: Pulsing Red Hazard
*   **Blocked (Risk Zone)**: Amber striped pattern
*   **Glass Panels**: Translucent, frosted glass elements for a modern, clean healthcare interface.

---

## 🛠️ Tech Stack

### **Frontend**
*   **Framework**: React (Vite)
*   **Language**: TypeScript
*   **Styling**: TailwindCSS + Custom CSS Variables
*   **Animations**: Framer Motion
*   **Notifications**: Sonner

### **Backend**
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Real-Time**: Socket.io
*   **Database**: PostgreSQL (Production) / SQLite (Development)
*   **ORM**: Sequelize

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm

### Local Development Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Laksharajjha/IsoGrid.git
    cd IsoGrid
    ```

2.  **Install Dependencies**
    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

3.  **Start the Server**
    ```bash
    cd server
    npm run dev
    # Server runs on http://localhost:5001
    ```

4.  **Start the Client**
    ```bash
    cd client
    npm run dev
    # Client runs on http://localhost:5173
    ```

5.  **Access the App**
    Open `http://localhost:5173` in your browser. Login with any username (e.g., "Dr. House").

---

## 🌍 Deployment

### **Backend (Railway)**
The backend is configured to automatically switch to PostgreSQL when a `DATABASE_URL` is present.
1.  Connect repository to Railway.
2.  Add a PostgreSQL database service.
3.  Set Root Directory to `/server`.

### **Frontend (Vercel)**
The frontend is configured with a `vercel.json` for SPA routing.
1.  Connect repository to Vercel.
2.  Set Root Directory to `/client`.
3.  Add Environment Variable `VITE_API_URL` pointing to your Railway backend (e.g., `https://your-app.railway.app/api`).

> **Detailed Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions.

---

## 📜 License
This project is open-source and available under the ISC License.
