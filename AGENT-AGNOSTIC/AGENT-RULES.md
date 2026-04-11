# AGENT-RULES.md
## The Single Source of Truth for All AI Agents

This file governs the behavior of **every AI coding agent** that works on this project —
Claude, Gemini/Antigravity, GitHub Copilot, Grok, Cursor, or any future agent.

---

## ⚠️ 6 NON-NEGOTIABLE RULES

### RULE 1 — AGENT-AGNOSTIC/ is the ONLY source of truth
All skills, memories, tasks, workflows, documentation, and structured knowledge
**MUST** live inside `AGENT-AGNOSTIC/`. No exceptions.

Do not create or reference:
- `.agent/`, `.claude/`, `.gemini/`, `.copilot/`, `.cursor/`, or any other vendor-specific hidden folder
- Shadow copies of instructions in your vendor config directory
- Any agent-specific memory or task files outside this folder

### RULE 2 — Never duplicate this content into vendor-specific locations
If you are an agent that normally writes to `.claude/`, `.gemini/`, or similar:
**Stop. Do not do that here.**
Your vendor pointer file (`CLAUDE.md`, `GEMINI.md`, etc.) is your only entry point.
Everything else flows through `AGENT-AGNOSTIC/`.

### RULE 3 — Read AGENT-AGNOSTIC/ fully before beginning any task
Before taking any action, you MUST read:
1. `AGENT-AGNOSTIC/AGENT-RULES.md` ← (this file)
2. `AGENT-AGNOSTIC/PROJECT.md` ← project context and goals
3. `AGENT-AGNOSTIC/AGENTS.md` ← agent-specific notes and preferences
4. Any relevant files in `SKILLS/`, `MEMORIES/`, `TASKS/`, and `WORKFLOWS/`

### RULE 4 — All writes go into AGENT-AGNOSTIC/ only
When you produce output that should persist (new skill, a memory, a task, a workflow):
- Write it to the correct subfolder inside `AGENT-AGNOSTIC/`
- Update the relevant `README.md` index if adding a new file
- Do NOT create files outside `AGENT-AGNOSTIC/` unless they are source code changes to the actual project

### RULE 5 — Keep vendor pointer files minimal and unchanged
`CLAUDE.md`, `GEMINI.md`, `COPILOT.md`, `GROK.md` at the project root are **pointer-only** files.
Do not add content to them. Do not expand them. They exist solely to redirect you here.

### RULE 6 — When in doubt, ask — don't invent structure
If you are unsure where something goes or whether a new subfolder is needed:
- Default to the most logical existing folder
- Raise a question to the user rather than silently creating new structure

---

## Folder Map

| Folder | Purpose |
|--------|---------|
| `SKILLS/` | Reusable techniques, patterns, and how-tos discovered during this project |
| `MEMORIES/` | Persistent context: decisions made, lessons learned, user preferences |
| `TASKS/` | Active backlog, in-progress work, and completed items |
| `WORKFLOWS/` | Step-by-step repeatable processes for common operations |
| `DOCS/` | Project documentation, references, and specs |

---

## Enforcement

Any agent that violates these rules is operating incorrectly on this project.
If you discover a violation, flag it to the user and propose corrective action.

**This folder is the law. Follow it.**
