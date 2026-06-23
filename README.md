# 🤖 AI Blog Agent Platform

A multi-agent, automated blog generation and management system. The application features a React-based frontend SPA, a FastAPI backend orchestrating a multi-agent LangGraph workflow, and a PostgreSQL database for persistent user accounts and blog storage.

> **Note on Project Name**: The root folder is named `blog_agent_flask` (a legacy artifact from a previous Flask prototype), but the backend has been fully migrated to **FastAPI** to support asynchronous operations, auto-generated documentation, and clean Pydantic integration.

---

## 📐 System Architecture

Below is a high-level view of how components in this platform interact:

```text
React Frontend SPA (Nginx on Port 80, exposed at host 5173)
            │
            ▼
      FastAPI Backend (Port 5000)
            │
            ▼
  LangGraph Orchestrator
            │
      ┌─────┼─────┐
      ▼     ▼     ▼
   Gemini Firecrawl Tavily
            │
            ▼
 PostgreSQL Database (Port 5432 - holds User and Blog records)
```

---

## 🌟 Key Features

- **Multi-Agent AI Content Generator**: Built on **LangGraph** and powered by **Google Gemini**, the workflow coordinates research synthesis, outline drafting, section writing, and image generation.
- **Web Research Integration**: Leverages Firecrawl and Tavily for web research and evidence gathering to output news and tutorial content.
- **Image Generation**: Uses the `gemini-2.5-flash-image` model to create diagrams, flowcharts, or descriptive visuals directly embedded into generated posts.
- **User Authentication**: Secure JWT-based registration, login, and profile authorization endpoints.
- **Rich Markdown Blog Viewer**: React rendering of complete blog posts with options to download content as raw Markdown.
- **Fully Dockerized Stack**: Multi-container Docker Compose configuration targeting Postgres, FastAPI, and Nginx.

---

## 📂 Project Structure

```text
blog_agent_flask/
├── backend/                         # FastAPI Backend
│   ├── ai_engine/                   # LangGraph Orchestration & Nodes
│   │   ├── graphs/                  # Graph architecture (main, reducer)
│   │   ├── nodes/                   # Execution nodes (research, worker, images)
│   │   ├── prompts/                 # System and agent prompts
│   │   ├── services/                # LLM client initialization (Gemini)
│   │   └── states/                  # LangGraph schema states
│   ├── api/                         # FastAPI Routing
│   │   └── routes/                  # auth, blogs, generate endpoints
│   ├── db/                          # Database connection and Models
│   │   ├── database.py              # SQLAlchemy engine & async sessionmaker
│   │   └── models.py                # SQL models (User, Blog)
│   ├── schemas/                     # Pydantic schemas
│   ├── main.py                      # FastAPI App Entrypoint
│   ├── requirements.txt             # Python Backend Dependencies
│   └── Dockerfile                   # Multi-stage Python 3.11 build
│
├── frontend/                        # React Frontend (Vite)
│   ├── src/                         # React components, pages, hooks, state
│   ├── public/                      # Static assets
│   ├── nginx.conf                   # Custom Nginx config supporting SPA routing
│   ├── package.json                 # Node package configuration
│   └── Dockerfile                   # Nginx alpine production image build
│
├── docker-compose.yml               # PostgreSQL + Backend + Nginx Compose config
├── .env                             # Environment Variables file (git ignored)
└── README.md                        # Documentation
```

---

## 🔧 Environment Configuration

Create a `.env` file in the root directory. This file is shared with the FastAPI backend container via Docker Compose.

```env
# Google Gemini API Key (Required for LLM and image generation)
GOOGLE_API_KEY="your-google-api-key"

# Firecrawl API Key (Required if web research node is activated)
FIRECRAWL_API_KEY="fc-your-firecrawl-key"

# Tavily API Key (Optional additional search client)
TAVILY_API_KEY="tvly-your-tavily-key"

# Database connection URL (Default configuration for Docker Compose)
DATABASE_URL="postgresql+asyncpg://postgres:Admin@db:5432/BlogDB"

# Frontend Allowed Origin (for CORS configuration)
FRONTEND_ORIGIN="http://localhost:5173"

# JWT Token Security (Optional custom values; falls back to hardcoded defaults in dev if unset)
SECRET_KEY="jwtSecret"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## 🐳 Quick Start: Running with Docker Compose

Ensure Docker Desktop is open and running on your host system.

1. **Clone the Repository** and navigate to the project directory:
   ```bash
   cd blog_agent_flask
   ```
2. **Set up `.env`** as described in the configuration section above.
3. **Launch the stack**:
   ```bash
   docker compose up --build -d
   ```
4. **Verify container status**:
   ```bash
   docker compose ps
   ```
   All containers should display `Up` or `healthy` status.

Access the services at:
- **Frontend App**: [http://localhost:5173](http://localhost:5173) 
  *(Inside Docker, Nginx serves static files on port `80`. The port mapping `5173:80` exposes it to your host machine's port `5173`.)*
- **Backend API Docs**: [http://localhost:5000/docs](http://localhost:5000/docs) (Swagger UI)

To tear down the containers and preserve database volumes:
```bash
docker compose down
```
To fully clean and reset database storage:
```bash
docker compose down -v
```

---

## 💻 Local Development Setup (Manual)

If you prefer to run services locally without Docker:

### 1. Database
Install and start a local **PostgreSQL** instance. Create a database named `BlogDB` with access credentials matching your `.env`'s `DATABASE_URL`.

### 2. Backend Setup
1. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Set your `.env` file to point `DATABASE_URL` to `localhost:5432` instead of `db:5432` (e.g. `postgresql+asyncpg://postgres:Admin@localhost:5432/BlogDB`).
4. Run the development server:
   ```bash
   uvicorn backend.main:app --reload --port 5000
   ```

### 3. Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env.local` to point to the backend URL:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

---

## 🔌 API Documentation

For full details, visit the Swagger UI at `http://localhost:5000/docs`. Routes are defined exactly as shown below:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a new user | No |
| **POST** | `/api/auth/login` | Login user, returns JWT Access Token | No |
| **GET** | `/api/auth/me` | Fetch currently logged-in user profile | Yes |
| **GET** | `/api/blogs/` | Retrieve all blogs generated by active user (note trailing slash) | Yes |
| **GET** | `/api/blogs/{id}` | Retrieve specific blog post markdown | Yes |
| **PATCH** | `/api/blogs/{id}` | Update blog title or content | Yes |
| **DELETE** | `/api/blogs/{id}` | Delete a blog post | Yes |
| **POST** | `/api/generate` | Generate a complete blog using the LangGraph multi-agent workflow | Yes |
| **POST** | `/api/stream` | Stream realtime agent generation events (SSE) | Yes |

---

## 🛠️ Troubleshooting

### 1. Database Initialization
FastAPI uses SQLAlchemy database session events. During container startup in `backend/main.py`, the `@app.on_event("startup")` handler invokes `Base.metadata.create_all` which automatically creates the `users` and `blogs` tables in PostgreSQL if they do not already exist.

### 2. ModuleNotFoundError: No module named 'argon2' / 'firecrawl'
- Double-check that your dependencies are fully installed. If developing locally, reactivate your virtual environment and run `pip install -r backend/requirements.txt`. If running via Docker, make sure to execute with the `--build` flag to force rebuilds with updated configurations.

### 3. SPA Frontend Reloads return 404 in Nginx
- We have pre-configured a custom Nginx template in `frontend/nginx.conf` matching the build. Make sure the frontend image is compiled via the current Dockerfile copying this configuration into `/etc/nginx/conf.d/default.conf`.
