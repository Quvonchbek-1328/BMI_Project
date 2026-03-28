# RiskWatch AI

AI-based Early Detection Model for Project Risk Factors and Schedule Delay Probability.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | .NET 9, Entity Framework Core, PostgreSQL |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Recharts |
| **AI Service** | Python 3.12, FastAPI, scikit-learn (RandomForest) |
| **Infrastructure** | Docker Compose, Nginx |

## Architecture

```
[Nginx :8080] --> [React Frontend]
              --> [.NET API :5000] --> [PostgreSQL :5432]
              --> [Python AI :8000]
```

## Quick Start (Docker)

### Prerequisites
- Docker Desktop
- PostgreSQL (local or Docker)

### 1. Clone the repository
```bash
git clone https://github.com/Quvonchbek-1328/BMI_Project.git
cd BMI_Project
```

### 2. Configure environment
```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:
```env
POSTGRES_DB=riskwatch
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
JWT_KEY=your_secret_key_min_32_characters
```

### 3. Create the database
```bash
psql -U postgres -c "CREATE DATABASE riskwatch;"
```

### 4. Build and run
```bash
docker compose build
docker compose up -d
```

### 5. Access the application
| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Swagger API Docs | http://localhost:8080/swagger |
| AI Service Health | http://localhost:8080/ai/health |
| API Direct | http://localhost:5000 |
| AI Direct | http://localhost:8000 |

## Local Development (without Docker)

### Backend
```bash
cd backend/src/RiskWatch.Api
dotnet run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### AI Service
```bash
cd ai-service
pip install -r requirements.txt
python -m app.model.train
uvicorn app.main:app --reload --port 8000
```

## Testing

### All tests (101 total)
```bash
# Backend (36 tests)
cd backend && dotnet test

# Frontend (47 tests)
cd frontend && npm test

# AI Service (18 tests)
cd ai-service && python -m pytest tests/ -v
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Tasks
- `GET /api/projects/{id}/tasks` - List tasks
- `POST /api/projects/{id}/tasks` - Create task

### Risk Predictions
- `POST /api/predictions/run` - Run prediction
- `GET /api/predictions/latest` - Latest predictions

### Alerts
- `GET /api/alerts` - List alerts
- `PUT /api/alerts/{id}/read` - Mark as read

### Admin
- `GET /api/admin/users` - List users
- `GET /api/admin/stats` - System statistics
