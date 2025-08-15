# OneGovSL

## Government Service Appointment Portal

OneGovSL is a web application designed to streamline the process of booking appointments for government services in Sierra Leone. This project focuses on a mobile-first user interface and utilizes a local-only Docker Compose setup for easy development and deployment during a hackathon.

## Tech Stack

*   **Backend:** Node.js (NestJS), TypeScript
*   **Database:** PostgreSQL
*   **Frontend:** React.js, TypeScript
*   **Styling:** Tailwind CSS
*   **Containerization:** Docker, Docker Compose
*   **Other:** TypeORM, bcrypt, JWT, multer, qrcode, nodemailer (for email), Rule-based Mock AI Chat Assistant

## Setup and Run

### Prerequisites

*   Docker
*   Docker Compose

### Steps

1.  **Clone the repository:**

    
```
bash
    git clone <repository-url>
    cd onegovsl
    
```
2.  **Copy example environment files:**
```
bash
    cp .env.example .env
    cp backend/.env.example backend/.env
    cp frontend/.env.example frontend/.env
    
```
3.  **Fill in environment variables:** Edit the `.env`, `backend/.env`, and `frontend/.env` files with your specific configurations (database credentials, JWT secret, email settings, etc.).

4.  **Build and run the application:**
```
bash
    docker-compose up --build
    
```
5.  **Access the application:**

    *   **Frontend:** `http://localhost`
    *   **Backend API:** `http://localhost:3000`

### Notes

*   File uploads are stored locally within the `backend/uploads` directory mounted as a Docker volume.
*   SMS notifications are currently mocked.
*   The AI chat assistant is a rule-based mock implementation for hackathon purposes.