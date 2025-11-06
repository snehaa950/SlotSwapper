# 🕒 SlotSwapper

SlotSwapper is a **full-stack MERN web application** that allows users to **swap scheduled events** (like meetings, study sessions, or appointments) with other users who have made their slots “swappable.”  
This helps people manage time conflicts easily by trading their event times in a controlled, transparent way.

---

## 🚀 Features

- 🔐 **JWT Authentication** – Secure signup/login  
- 📅 **Event Management** – Add, view, and mark events as “swappable”  
- 🔁 **Swap Requests** – Request to swap your event with another user’s  
- ✅ **Accept / Reject Requests** – Respond to incoming swap offers  
- ⚡ **Real-time State Update** – UI updates automatically after swap actions  
- 💾 **MongoDB Integration** – Persistent user and event data storage

---

## 🧠 Design Choices

- **MERN Stack:** React + Node + Express + MongoDB for full-stack consistency  
- **JWT Auth:** Protect all private routes using token-based authentication  
- **REST API:** Clean separation between frontend and backend  
- **Reusable Components:** Modular React design for dashboard, slots, and requests  
- **Scalable Models:** Separate collections for Users, Events, and SwapRequests  

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React (Vite) |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Authentication | JWT |
| Styling | Tailwind CSS |
| State Management | React Hooks |
| API Testing | Postman |

---

## 🧩 Project Structure

SlotSwapper/
├── backend/
│ ├── server.js
│ ├── .env
│ ├── models/
│ │ ├── user.js
│ │ ├── event.js
│ │ └── swapRequest.js
│ ├── routes/
│ │ ├── userRoutes.js
│ │ ├── eventRoutes.js
│ │ └── swapRoutes.js
│ └── middleware/
│ └── auth.js
│
└── frontend/
├── src/
│ ├── pages/
│ │ ├── Dashboard.js
│ │ ├── SwappableSlots.js
│ │ └── SwapRequests.js
│ ├── components/
│ └── App.js
└── package.json

---

## 🧰 Setup Instructions

### 1️⃣ Clone the repository

git clone https://github.com/snehaa950/SlotSwapper.git
cd SlotSwapper
