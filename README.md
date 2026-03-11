# Backend Engineering Assessment Solutions

This repository contains my solutions for the backend engineering take-home assessment.
It contains two independent services in a shared mono-repo:

- `python-service/` (InsightOps): FastAPI + SQLAlchemy + manual SQL migrations
- `ts-service/` (TalentFlow): NestJS + TypeORM + Google Gemini LLM integration.

## Prerequisites
- **Docker** (for PostgreSQL)
- **Python 3.12+**
- **Node.js 22+**
- **npm**
- **Google Gemini API Key**: [Get one here](https://aistudio.google.com/) (Required for TalentFlow).


## Global Setup

### 1.  Start Postgres

From the repository root:

```bash
docker compose up -d postgres
```

This starts PostgreSQL on `localhost:5432` with:

- database: `assessment_db`
- user: `assessment_user`
- password: `assessment_pass`


## Part A: Python Service (InsightOps)

### Setup & Migrations
1. Navigate to the service directory:
```
cd python-service
```
2. Create and activate a virtual environment:
```
python3.12 -m venv .venv
source .venv/bin/activate
```
3. Install dependencies:
```
pip install -r requirements.txt
```
4. Create the environment configuration:
```
cp .env.example .env
```
5. Run database migrations:
```
python -m app.db.run_migrations
```
Run the Service
uvicorn app.main:app --reload --port 8000

   ```
5. **Run Migrations**:
   ```bash
   python -m app.db.run_migrations
   ```
### Running the Service
```bash
uvicorn app.main:app --reload --port 8000
```
Service endpoint:

```
http://localhost:8000
```
---

## Part B: TypeScript Service (TalentFlow)
The TypeScript service implements a **candidate document ingestion and AI-powered evaluation workflow**.


### Setup & Migrations
1. Navigate to the service directory: `cd ts-service`
2. Install dependencies: `npm install`
3. Create a `.env` file:
   ```env
   DATABASE_URL=postgresql://assessment_user:assessment_pass@localhost:5432/assessment_db
   GEMINI_API_KEY=your_key_here
   ```
4. **Run Migrations**:
   ```bash
   npm run migration:run
   ```
### Running the Service
```bash
npm run start:dev
```

Service endpoint:

```
http://localhost:3000
```

---

# Authentication Behavior

The TypeScript service uses the starter project's **FakeAuthGuard**.

API requests must include the following headers:

```
x-workspace-id: 1
x-user-id: 2
```

These simulate recruiter authentication and enforce **workspace-level access control**.

---

## Notes
### 1. Design Decisions
- **Service/Worker Separation**: In the TypeScript service, the Controller returns a `202 Accepted` immediately. The logic is handed off to the `CandidateWorkerService` which processes the LLM call asynchronously. This ensures the API remains responsive during long AI generations.
- **Provider Abstraction**: The `SummarizationProvider` is implemented as an interface. This allows us to swap Gemini for OpenAI or a Mock provider in tests without touching business logic.
- **View Model Transformation**: In the Python service, the `ReportFormatter` transforms raw database records into a "View Model" dictionary. This ensures the Jinja2 templates are decoupled from the database schema.
- **In-Memory Job Tracking**: We utilized the starter's `QueueService` to log background jobs. While this is in-memory for the assessment, the architecture is prepared to swap in Bull/Redis for production.

### 2. Schema Decisions
  - **Python**: Key Points and Risks are stored in separate tables (`briefing_key_points` and `briefing_risks`). This allows for explicit `display_order` tracking and better data integrity.
  - **TypeScript**: Documents and Summaries are linked via Foreign Keys with `ON DELETE CASCADE` to ensure no "orphan" data remains if a candidate is deleted.

### 3. Assumptions & Tradeoffs
- **Text Extraction**: I assumed file content is sent as `rawText` in the request body for Part B, as suggested by the "practical and testable" hint in the assessment.
- **LLM Selection**: Used  `gemini-3-flash` as the llm provider.
- **Auth**: I relied on the starter's `FakeAuthGuard` pattern but added a `validateAccess` layer in the service to ensure `workspace_id` boundaries are strictly enforced (Multi-tenancy).

### 4. Future Improvements (With More Time)
- **Redis Caching**: Cache the rendered HTML briefings in Python to avoid re-rendering on every request.
- **Retry Mechanism**: Implement a retry strategy for the Background Worker if the LLM API hits a rate limit or a temporary network error.
