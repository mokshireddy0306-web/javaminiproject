# ProjectHub AI — System Architecture & Technical Specifications

## 1. High-Level Architecture Overview

ProjectHub AI follows a decoupled, cloud-ready client-server architecture with an in-browser fallback engine for zero-configuration demonstrations.

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Single Page Architecture)"]
        UI["Modern UI / Design Tokens (Linear/Vercel)"]
        Router["Client App Router (app.js)"]
        API_Client["Dual-Mode API Service (api.js)"]
        MockEngine["In-Memory Mock Store (mockData.js)"]
    end

    subgraph Server["Backend REST API (Node.js / Express)"]
        MW["Auth & Cohort Middleware (auth.js)"]
        Controllers["Resource Controllers"]
        MatchService["AI Skill Matchmaker"]
        VisService["Cohort Isolation Service"]
        Analytics["KPI Aggregator"]
    end

    subgraph Data["Persistence Layer"]
        DB[(PostgreSQL / Relational Store)]
        Queries["Optimized SQL Queries"]
    end

    UI --> Router --> API_Client
    API_Client -.->|Server Offline| MockEngine
    API_Client -->|HTTP / REST| MW --> Controllers
    Controllers --> MatchService
    Controllers --> VisService
    Controllers --> Analytics
    Controllers --> DB
    DB --> Queries
```

---

## 2. Entity-Relationship (ER) Schema

```mermaid
erDiagram
    STUDENTS ||--o{ STUDENT_SKILLS : possesses
    SKILLS ||--o{ STUDENT_SKILLS : categorized
    STUDENTS ||--o{ TEAM_MEMBERS : joins
    STUDENTS ||--o{ REQUESTS : sends_or_receives
    STUDENTS ||--o{ QUERIES : raises
    ADMINS ||--o{ PROJECTS : publishes
    ADMINS ||--o{ QUERIES : resolves
    PROJECTS ||--o{ PROJECT_SKILLS : requires
    SKILLS ||--o{ PROJECT_SKILLS : defines
    PROJECTS ||--o{ TEAMS : assigns
    TEAMS ||--o{ TEAM_MEMBERS : contains
    TEAMS ||--|| PROJECT_PROGRESS : tracks
    TEAMS ||--o{ REQUESTS : targeted_by
```

---

## 3. Cohort Visibility Isolation Model

The multi-tenant isolation model guarantees that students can only view projects matching their precise enrollment coordinates:

$$\text{Visibility}(S, P) = \begin{cases} 
\text{True} & \text{if } \text{Role}(S) = \text{ADMIN} \\
\text{True} & \text{if } P.\text{dept} = S.\text{dept} \land P.\text{year} = S.\text{year} \land P.\text{sec} = S.\text{sec} \land P.\text{status} = \text{PUBLISHED} \\
\text{False} & \text{otherwise}
\end{cases}$$

---

## 4. Algorithmic Skill Matchmaking Formulation

The compatibility score between a candidate student's skill vector $S_{\text{skills}}$ and a project's required skill set $P_{\text{req}}$ is formulated using a weighted Jaccard intersection index:

$$\text{Compatibility}(S, P) = \left( \frac{|S_{\text{skills}} \cap P_{\text{req}}|}{|P_{\text{req}}|} \right) \times 100$$
