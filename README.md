MEDILINK – Healthcare Management System

Overview

MEDILINK is a web-based appointment management system that connects patients and doctors. It allows users to book, manage, and track appointments online with real-time availability and automated reminders.

Tech Stack

* Frontend: React.js, Bootstrap 5.3
* Backend: Node.js, Express.js
* Database: MongoDB Atlas
* Auth: JWT
* Testing: Postman

Features

* Patient & Doctor registration/login
* Search doctors by specialization/location
* Real-time appointment booking
* Automated confirmations & reminders
* Secure data handling with JWT & bcrypt

Setup

git clone https://github.com/keshav-rathi-0/Medilink.git
cd medilink/backend
npm install
npm start

Create `.env`:

PORT=5000
MONGO_URI=your_connection_string
JWT_SECRET=your_secret

Then start frontend:

cd ../frontend
npm install
npm run dev

API Endpoints

| Method | Endpoint            | Description      |
| ------ | ------------------- | ---------------- |
| POST   | /api/users/register | Register user    |
| POST   | /api/users/login    | User login       |
| GET    | /api/doctors        | List doctors     |
| POST   | /api/appointments   | Book appointment |

Security

* JWT Authentication
* Encrypted passwords
* Role-based access

Future Scope

Teleconsultation • Online payments • AI doctor suggestions • EHR integration

Author: Kanan Goenka , Kanishk Gandecha , Keshav Rathi
Year: 2025
