# Usafi-Mtaani 🧹

Usafi-Mtaani is a full-stack web application designed to manage waste collection, loyalty rewards, and community engagement.  
It provides a backend API powered by Node.js and PostgreSQL, and a frontend client for user interaction.

---

## 🚀 Setup

### 1. Clone the repository
```bash
git clone https://github.com/JSIMBA11/Usafi-Mtaani.git
cd Usafi-Mtaani

---

## 🚀 Features
- **User Management**: Register, login, and manage user profiles.
- **Loyalty Program**: Earn and redeem points through waste collection activities.
- **Notifications**: Email, SMS, and push notifications for reminders and updates.
- **Rate Limiting**: Protects API endpoints from abuse.
- **Environment Config**: Secure `.env` setup for secrets and credentials.
- **Deployment Ready**: Configured for Render hosting with `render.yaml`.

---

## 🛠️ Tech Stack
- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: React (or your chosen framework in `/frontend`)
- **Database**: PostgreSQL (production), SQLite (legacy/local dev)
- **Authentication**: JWT with bcrypt password hashing
- **Messaging**: Twilio (SMS), SendGrid (Email)

---

## 📂 Project Structure
Usafi-Mtaani/ ├── backend/ │ ├── scripts/ │ │ ├── init-db.js # Initialize PostgreSQL schema │ │ ├── seed-db.js # Seed test data │ ├── .env # Environment variables (ignored in Git) │ ├── package.json │ └── ... # Backend source files ├── frontend/ # Client-side application ├── render.yaml # Render deployment config ├── start-app.bat # Windows startup script └── README.md

Code

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/JSIMBA11/Usafi-Mtaani.git
cd Usafi-Mtaani
2. Backend setup
bash
cd backend
npm install
Create a .env file in backend/:

env
PORT=4000
NODE_ENV=development
JWT_SECRET=replace_with_a_strong_secret
SALT_ROUNDS=12

PGUSER=waste_user
PGPASSWORD=your_password_here
PGHOST=localhost
PGPORT=5432
PGDATABASE=waste_manager

CLIENT_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM="Usafi-Mtaani <noreply@yourdomain.com>"

SCHEDULE_REMINDERS=false
3. Initialize the database
bash
node scripts/init-db.js
node scripts/seed-db.js
4. Run the backend
bash
npm start
5. Frontend setup
bash
cd ../frontend
npm install
npm start
📬 API Endpoints (examples)
POST /api/users/register → Register a new user

POST /api/users/login → Authenticate user

GET /api/users/:id → Fetch user profile

POST /api/loyalty/earn → Add loyalty points

GET /api/notifications → Fetch notifications

🛡️ Security
JWT authentication for API requests

Rate limiting to prevent abuse

Environment variables hidden via .gitignore

🌍 Deployment
Configured for Render using render.yaml

PostgreSQL database hosted on Render or external provider

Environment variables set via Render dashboard



📜 License
This project is licensed under the MIT License — feel free to use and adapt it.

👨‍💻 Author
Developed by Jerald Hindia Simba Founder & Operations Lead at Magnold Limited Active PLP Academy student, focused on building scalable full-stack web applications.
