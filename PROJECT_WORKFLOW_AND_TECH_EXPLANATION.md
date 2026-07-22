# 📚 DevFlow — Complete Architecture, Workflow & Tech Stack Explanation

This document explains the **complete end-to-end workflow**, **technologies used**, and **microservice responsibilities** of the **DevFlow Platform**.

---

## 🔄 1. End-to-End Application Workflow

```text
  [ User Browser / React 19 SPA (Port 4000) ]
                      │
                      ▼ REST API Requests / JWT Tokens
           [ API Gateway Ingress (Port 9080) ]
                      │
   ┌──────────────────┼──────────────────┬──────────────────┐
   ▼                  ▼                  ▼                  ▼
[Auth Service]   [Project Service]  [Task Service]     [AI Engine]
(Port 9081)        (Port 9082)        (Port 9083)        (Port 9084)
   │                  │                  │                  │
   ▼                  ▼                  ▼                  ▼
[H2 / Postgres]  [H2 / Postgres]   [H2 / Postgres]    [Task Heuristics]
   │                                     │
   └───────────────┬─────────────────────┘
                   ▼ Event Stream
            [ Apache Kafka (Port 9092) ] ──► [ Notification & Analytics Svc ]
                   │
                   ▼ Presence & Activity
            [ Realtime WebSocket Svc (Port 9088) ] ──► STOMP push to Frontend
```

### Step-by-Step Flow:
1. **User Authentication & Session Isolation**:
   - The user opens the frontend at `http://localhost:4000` and registers/logs in.
   - `auth-service` (:9081) validates credentials, generates a JWT token, and assigns a unique user ID (`usr_<email_hash>`).
   - The user's workspace state is dynamically loaded and saved under isolated storage (`devflow_workspace_${userId}`), ensuring total privacy across logins.

2. **Project & Kanban Task Operations**:
   - Creating/updating projects routes to `project-service` (:9082).
   - Moving tasks across `TODO` ➔ `IN_PROGRESS` ➔ `IN_REVIEW` ➔ `DONE` routes to `task-service` (:9083).
   - Tasks store metadata including priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), story points, due dates, and comments.

3. **⚡ Dynamic AI Insights & Automation**:
   - The user requests an AI update or opens **AI Insights**.
   - `ai-engine` (:9084) analyzes active workspace tasks, story points, and sprint metrics to generate:
     - **3-Part Daily Standup Update** (Yesterday, Today, Blockers).
     - **Sprint Risk Audit** (High-priority bottlenecks & overdue risks).
     - **Sprint Capacity Optimizer** (Backlog point allocation).

4. **Real-time Synchronization & Notifications**:
   - Changes broadcast through `realtime-service` (:9088) via WebSockets (STOMP protocol) and Kafka event topics, updating all active dashboard screens live.

---

## 🛠️ 2. Technologies Used & What Task Each Technology Performs

| Technology | Role / Task Performed in DevFlow |
| :--- | :--- |
| **Java 21** | Core backend language using modern Java Features (Records for immutable DTOs, Pattern Matching for Switch, Sealed Interfaces). |
| **Spring Boot 3.3** | Core backend framework managing dependency injection, REST controllers, JPA data repositories, and auto-configuration. |
| **Spring Cloud Gateway** | API Gateway running on port `9080` / `8080`. Routes incoming requests to downstream microservices, handles reverse proxying, and validates JWT tokens. |
| **Spring AI** | Framework integration in `ai-engine` for executing prompt structures, task heuristic analysis, and AI standup/risk generation. |
| **React 19** | Modern frontend library rendering the single-page web application (SPA) with concurrent rendering and instant component updates. |
| **TypeScript** | Type-safe JavaScript language used in the React frontend to prevent runtime errors and ensure strict API contract interfaces. |
| **Redux Toolkit (RTK)** | State management store keeping client-side projects, tasks, sprints, user profile, and notifications synchronized in real time. |
| **Tailwind CSS** | Styling framework used for premium dark-mode UI design, glassmorphism card layouts, responsive grids, and micro-animations. |
| **PostgreSQL & H2 DB** | Primary relational database storage. H2 is used for local native persistence (`./data/`), and PostgreSQL is used in Docker production profile. |
| **Redis 7** | High-performance in-memory cache used for JWT refresh tokens, rate limiting, and real-time user session state. |
| **Apache Kafka 3.7** | Asynchronous event streaming broker propagating task status events (`task-created`, `task-updated`, `sprint-completed`) between microservices. |
| **Docker & Docker Compose** | Containerization system bundling microservices, databases, and Nginx frontend into reproducible containers (`docker-compose up -d`). |
| **Nginx** | High-performance web server serving built static React assets (`dist/`) and forwarding `/api` REST requests to the gateway in Docker mode. |

---

## 🏗️ 3. Microservice Task Explanation (All 9 Services)

| Service Name | Port | Specific Task Executed in DevFlow |
| :--- | :---: | :--- |
| 🛡️ **`api-gateway`** | `9080` | Single entry point for all client requests; handles URL routing (`/api/v1/auth`, `/api/v1/tasks`, `/api/v1/ai`), CORS headers, and JWT verification. |
| 🔐 **`auth-service`** | `9081` | Manages user registration, login authentication, password hashing, JWT token generation, and user profile metadata. |
| 📊 **`project-service`** | `9082` | Handles creation, updating, and deletion of Projects (`DEVF`, `MOBI`, `AIENG`), Sprints, Epics, and Project Member assignments. |
| 📋 **`task-service`** | `9083` | Manages the full Kanban task lifecycle (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`), story points, task comments, priority tags, and time logs. |
| 🤖 **`ai-engine`** | `9084` | Executes dynamic AI standup generation (`/api/v1/ai/standup`), predictive risk analysis (`/api/v1/ai/risk-analysis`), and sprint capacity planning. |
| 🔔 **`notification-service`** | `9085` | Listens to Kafka events and formats omnichannel user notifications for task assignments and deadline alerts. |
| 📈 **`analytics-service`** | `9086` | Computes team velocity metrics, sprint burn-down charts, completed task counts, and historical performance trends. |
| 🔗 **`integration-service`** | `9087` | Manages external webhook connections (GitHub commits, PR linkage, CI/CD pipeline updates). |
| ⚡ **`realtime-service`** | `9088` | Manages WebSocket connections via STOMP/SockJS protocol to stream live activity updates and user online presence directly to frontend clients. |
