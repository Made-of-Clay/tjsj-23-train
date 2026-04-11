# AGENT-AGNOSTIC/

> **This is the single source of truth for all AI agents on this project.**
> All agents (Claude, Gemini, Copilot, Grok, Cursor, or any other) must operate
> exclusively from this folder. See [AGENT-RULES.md](./AGENT-RULES.md) for the law.

---

## 📋 Table of Contents

| File / Folder | Purpose |
|---------------|---------|
| [AGENT-RULES.md](./AGENT-RULES.md) | **START HERE** — Non-negotiable rules for all agents |
| [PROJECT.md](./PROJECT.md) | Project overview, goals, and tech stack |
| [AGENTS.md](./AGENTS.md) | Agent-specific notes, preferences, and known behaviors |
| [SKILLS/](./SKILLS/) | Reusable techniques and patterns discovered on this project |
| [MEMORIES/](./MEMORIES/) | Persistent context: decisions, lessons, user preferences |
| [TASKS/](./TASKS/) | Active backlog and tracked work items |
| [WORKFLOWS/](./WORKFLOWS/) | Step-by-step repeatable processes |
| [DOCS/](./DOCS/) | Project documentation, specs, and references |

---

## ⚡ Quick Start for Agents

1. Read `AGENT-RULES.md` first — mandatory.
2. Read `PROJECT.md` for context.
3. Read `AGENTS.md` for any preferences or known gotchas.
4. Check `TASKS/backlog.md` for active work.
5. Check `MEMORIES/` for relevant past context before starting.
6. Write all outputs (skills, memories, tasks, workflows) back into this folder.

**Never create vendor-specific folders. Never write structured knowledge outside `AGENT-AGNOSTIC/`.**
