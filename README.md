<div align="center">
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Java-Dark.svg" width="60" alt="Java" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Spring-Dark.svg" width="60" alt="Spring" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/React-Dark.svg" width="60" alt="React" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Kafka.svg" width="60" alt="Kafka" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/PostgreSQL-Dark.svg" width="60" alt="PostgreSQL" />

  <h1 align="center">🚀 DevFlow Platform</h1>
  <p align="center"><strong>Next-Generation AI-Powered Developer Workflow & Project Management Platform</strong></p>
  
  <p align="center">
    <a href="https://openjdk.org/projects/jdk/21/"><img src="https://img.shields.io/badge/Java-21-E67E22?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" /></a>
    <a href="https://spring.io/projects/spring-boot"><img src="https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="Spring Boot 3.3" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" /></a>
    <br/>
    <em>Enterprise Microservices · Isolated User Sessions · Real-time AI Automation</em>
  </p>

  <br/>

  <h3>⚡ SINGLE-CLICK LIVE ACCESS LINKS</h3>
  <p>
    <a href="http://localhost:4000"><strong>🌐 Click Here to Open DevFlow Live App (http://localhost:4000)</strong></a>
    <br/>
    <a href="http://localhost:9080"><strong>🛡️ Click Here to Open API Gateway (http://localhost:9080)</strong></a>
    <br/>
    <a href="http://localhost:9081/swagger-ui.html"><strong>📖 Click Here to Open Swagger API Documentation</strong></a>
  </p>
</div>

---

## ⚡ Single-Click Live Launcher (`start-devflow.bat`)

To boot all 9 microservices, launch the React frontend, and automatically open the application in your browser with **a single click**:

1. Open the project folder `d:\Java Project\devflow`.
2. Double-click **`start-devflow.bat`**.

```cmd
:: Single-Click Batch Launcher
start-devflow.bat
```

> **Note**: `start-devflow.bat` automatically initializes JDK 21, launches all microservices in background mode, and launches `http://localhost:4000` in your default browser.

---

## 🎯 Application Workflow & Core Features

DevFlow optimizes the software development lifecycle by integrating domain-driven microservices with dynamic AI automation.

```text
[User Login / Registration]
          │
          ▼
 [User-Isolated Session (usr_<email_hash>)]
          │
          ├──► Command Center & Dashboard ─────► Real-time Workspace KPIs & Progress
          ├──► Projects & Kanban Board ────────► Task Lifecycle (TODO ➔ IN_PROGRESS ➔ IN_REVIEW ➔ DONE)
          ├──► ⚡ Live AI Engine ──────────────► Automated Standups, Risk Audits & Sprint Optimizer
          ├──► Analytics & Team ──────────────► Velocity Charts & Resource Distribution
          └──► Realtime Feed ──────────────────► Live WebSocket / STOMP Activity Stream
```

### 🔑 1. Identity & User-Isolated Workspace Workflow
- **Authentication**: Secure registration and login processed through `auth-service` (:9081) with JWT token issuance.
- **Data Isolation**: Every logged-in user maintains an isolated workspace dataset (`devflow_workspace_${userId}`). Tasks, projects, and custom changes created by one user are permanently saved under their specific user ID and backend storage without cross-user data leakage.

### 📋 2. Project & Task Lifecycle Workflow
- **Kanban Board**: Drag-and-drop or state-driven workflow moving tasks across `TODO`, `IN_PROGRESS`, `IN_REVIEW`, and `DONE`.
- **Task Metadata**: Tracks story points, priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), due dates, and task comments.
- **Project Scope**: Filter tasks by active project (`DEVF`, `MOBI`, `AIENG`) or view cross-project command center metrics.

### ⚡ 3. Live AI Automation Workflow
- **Daily Standup Generator**: Computes recent task completions and generates formatted 3-part daily updates (Yesterday, Today, Blockers).
- **Sprint Risk Audit**: Dynamically analyzes story points, overdue items, and high-priority items to identify bottlenecks.
- **Sprint Optimizer**: Recommends optimal backlog allocations based on historical velocity and capacity buffers.

---

## 🔗 Live Access Points & Endpoints

Click any link below for direct live access once the platform is running:

| Component | Live Access Link | Description |
| :--- | :--- | :--- |
| 💻 **Frontend Web App** | [**http://localhost:4000**](http://localhost:4000) | Primary React 19 Client SPA Interface |
| 🛡️ **API Gateway Ingress** | [**http://localhost:9080**](http://localhost:9080) | Base URL for REST routing & reverse proxy |
| 🔐 **Auth Service** | [**http://localhost:9081**](http://localhost:9081) | Identity Management & JWT Service |
| 📊 **Project Service** | [**http://localhost:9082**](http://localhost:9082) | Projects & Sprints REST API |
| 📋 **Task Service** | [**http://localhost:9083**](http://localhost:9083) | Tasks & Kanban Board REST API |
| 🤖 **AI Engine** | [**http://localhost:9084**](http://localhost:9084) | AI Automation & Analytics API |
| 🔔 **Notification Service** | [**http://localhost:9085**](http://localhost:9085) | Alerts & Notifications API |
| 📈 **Analytics Service** | [**http://localhost:9086**](http://localhost:9086) | Metrics & Velocity Reports API |
| 🔗 **Integration Service** | [**http://localhost:9087**](http://localhost:9087) | External Connectors API |
| ⚡ **Realtime Service** | [**http://localhost:9088**](http://localhost:9088) | WebSocket / STOMP Live Endpoint |
| 📖 **Interactive Swagger UI** | [**http://localhost:9081/swagger-ui.html**](http://localhost:9081/swagger-ui.html) | OpenAPI / Swagger API Documentation |

---

## 🏗️ System Architecture & Microservices Ecosystem

| Service Name | Port | Primary Responsibility | Key Technologies |
| :--- | :---: | :--- | :--- |
| 🛡️ `api-gateway` | `9080` | Reverse proxy, ingress routing, JWT validation | Spring Cloud Gateway, Netty |
| 🔐 `auth-service` | `9081` | User registration, login authentication, JWT tokens | Spring Security, JWT, JPA, H2/PostgreSQL |
| 📊 `project-service` | `9082` | Projects, Sprint cycles, Epic management | Spring Data JPA, PostgreSQL / H2 |
| 📋 `task-service` | `9083` | Task tracking, status updates, comments | Spring Data JPA, PostgreSQL / H2 |
| 🤖 `ai-engine` | `9084` | AI standups, risk analysis, sprint planning | Spring AI, Java 21, Algorithmic Heuristics |
| 🔔 `notification-service` | `9085` | Alerts and push notifications | Spring Boot Microservice |
| 📈 `analytics-service` | `9086` | Metrics, velocity reports, analytics | Spring Boot Microservice |
| 🔗 `integration-service` | `9087` | Webhooks and third-party integrations | Spring Boot Microservice |
| ⚡ `realtime-service` | `9088` | Collaborative presence, WS messaging | WebSocket, STOMP |
| 💻 `frontend` | `4000` | User interface & interactive dashboard | React 19, TypeScript, Redux Toolkit, Tailwind |

---

## 🌐 Deployment Modes

### 💻 1. Local Native Access Mode (PowerShell)

```powershell
# Option A: Single-Click Batch Launcher
.\start-devflow.bat

# Option B: Headless Background Runner
.\start-dev-headless.ps1

# Option C: Interactive Terminal Runner
.\start-dev.ps1
```

---

### 🐳 2. Production Live Deployment Mode (Docker Compose)

```bash
# 1. Build and start containers in detached mode
docker-compose up --build -d

# 2. Check running container status
docker-compose ps

# 3. View live microservice logs
docker-compose logs -f
```

---

## 📁 Repository Structure

```text
devflow/
├── 📜 start-devflow.bat     # Single-Click Live Launcher Batch Script
├── 🗄️ api-gateway/          # Ingress routing (:9080)
├── 🔐 auth-service/         # User identity & JWT (:9081)
├── 📊 project-service/      # Projects & Sprints (:9082)
├── 📋 task-service/         # Tasks domain (:9083)
├── 🤖 ai-engine/            # AI standups & risk analysis (:9084)
├── 🔔 notification-service/ # Alert endpoints (:9085)
├── 📈 analytics-service/    # Reports & velocity (:9086)
├── 🔗 integration-service/  # Connectors (:9087)
├── ⚡ realtime-service/     # WebSocket STOMP (:9088)
├── 💻 frontend/             # React 19 SPA Client (:4000)
├── 🏗️ infrastructure/       # Docker compose & SQL schemas
├── 📁 logs/                  # Microservice log output directory
├── 📜 start-dev.ps1         # Windows interactive launcher
└── 📜 start-dev-headless.ps1# Windows background launcher
```

<br/>

<div align="center">
  <p>Engineered with Madan C S for peak developer productivity.</p>
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0b1120&height=100&section=footer" />
</div>
