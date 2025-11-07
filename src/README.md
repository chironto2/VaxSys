# VaxSys — Vaccination Management System

VaxSys is a web platform that streamlines vaccination operations: citizen registration, appointment booking, vaccine inventory & wastage tracking, and secure vaccination record management for both users and vaccination centers.
## 1. Problem Addressed

Many vaccination centers rely on manual or fragmented systems, resulting in:

- Difficulty for citizens to view vaccination history and total doses,
- Appointment scheduling conflicts,
- No unified system for managing multiple vaccine types and wastage,
- No secure control over which staff can view citizen records.

**VaxSys** solves these issues by providing:

- A citizen portal for appointments & dose history,
- A vaccination center dashboard for vaccine inventory & administration tracking,
- Role-based access control ensuring data privacy and correctness.

---

## 2. System Architecture & Technologies

### **High-Level Architecture**
Client (Next.js + Tailwind + TypeScript)
↕ API Routes (Next.js serverless / Node.js)
↕ MongoDB (Atlas or local instance)

Authentication: Firebase Authentication for user login + role-based access

### **Tech Stack**
| Layer | Technology |
|------|------------|
| Frontend | Next.js (TypeScript), Tailwind CSS |
| Backend | Next.js API Routes (Node.js) |
| Database | MongoDB |
| Authentication | Firebase Authentication / NextAuth |
| Tooling | Git, GitHub, ESLint, Prettier |

---

## 3. Key Features

### For Citizens
- Register / Login (authenticated only)
- Search and book appointments (date/time conflict-free)
- View vaccination history & total doses
- Download or print vaccination certificate/card

### For Vaccination Centers / Admins
- CRUD multiple vaccine types (COVID-19, TT, Typhoid, BCG, etc.)
- Track **total stock → used → remaining → wasted doses**
- Assign staff & set daily center capacity
- View user vaccination records only during verification/administering doses

### System Operations
- Real-time dashboard refresh after updates
- Automatic validation to prevent double-booking appointments
- Strict role-based access control enforcing data privacy

---

## 4. Use of AI / Automation
VaxSys integrates **automated decision support** to optimize operations:

| Feature | Description |
|--------|-------------|
| Appointment slot suggestion | Suggests nearest available time slots intelligently |
| Stock level alerts | Warns centers when remaining stock is low or doses are about to expire |
| Automated reminders | Email/SMS reminders before scheduled appointments |
| Weekly center summary generator | Auto-generated usage and wastage analytics |

*Note: No medical diagnosis or clinical AI is used — only workflow automation.*

---

## 5. Future Improvements
- Two-way SMS notifications for reminders (Twilio / SendGrid)
- Mobile-ready PWA for offline usage in rural centers
- Integration with national EPI vaccination systems
- AI-based predictive stock restocking dashboard
- IoT-based cold chain (temperature monitoring) alerts

---

## 6. Step-by-Step Documentation (Setup & Usage)

### ✅ Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas or Local MongoDB
- Firebase Project & API Key (if using Firebase Auth)
- Git installed

---
## NOW how to RUN:

1) Clone the Repository
```bash
git clone https://github.com/yourusername/VaxSys.git
cd VaxSys

2) Install Dependencies
npm install
# or
yarn

3) Create .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/vaxsys
NEXTAUTH_SECRET=your_random_secret_string

4) Initialize MongoDB Collections

Run manually in Mongo Shell or MongoDB Compass:

use vaxsys
db.createCollection("users")
db.createCollection("vaccines")
db.createCollection("appointments")
db.createCollection("vaccination_records")

5) Start Development Server
npm run dev
# or
yarn dev
