# Mission Control Dashboard (MVP Spec)

## Goal
One screen to see: tasks, agent status, decisions, metrics, and outputs.

## Core Views
1. **Task Board** (kanban)
   - Columns: Queue → Active → Review → Done
   - Each task: owner, ETA, tags, priority

2. **Agent Status**
   - Agent name, current task, last output time
   - Busy/Idle/Blocked

3. **Decision Log**
   - Title, date, owner, link to memory note

4. **Metrics**
   - Tasks/day, avg turnaround time, review pass rate
   - Top bottlenecks

5. **Activity Feed**
   - Latest outputs + review comments

6. **Command Bar**
   - Spawn agent
   - Assign task
   - Summarize week

## Data Model (minimal)
### Task
```json
{ "id": "t-001", "title": "Draft landing copy", "status": "active", "owner": "Writer", "priority": "high", "tags": ["marketing"], "createdAt": 0, "updatedAt": 0 }
```

### Agent
```json
{ "id": "writer", "name": "Writer", "status": "busy", "taskId": "t-001", "lastOutputAt": 0 }
```

### Decision
```json
{ "id": "d-001", "title": "Entertainment‑only positioning", "owner": "Jarvis", "date": "2026-01-31", "link": "memory/2026-01-31.md" }
```

### Metric
```json
{ "name": "avg_turnaround_minutes", "value": 42 }
```

## Implementation Sketch
- Backend: simple JSON/SQLite store
- Agents: `sessions_spawn` + `sessions_history`
- UI: Next.js or Svelte
- Polling: 5–10s for activity feed

## Events (for analytics)
- `task_created`, `task_started`, `task_reviewed`, `task_completed`
- `agent_spawned`, `agent_idle`
