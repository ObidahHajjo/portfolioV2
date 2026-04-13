## Project rules

- PLAN.md is the authoritative roadmap.
- Work strictly phase by phase.
- Never implement work from a later phase in an earlier phase.
- For each phase, create a dedicated git branch before implementation.
- Use PostgreSQL for all persistent data.
- Use MinIO for all uploaded assets and portfolio media.
- Target VPS deployment with Docker Compose.
- Preserve production-grade standards suitable for a senior developer portfolio.

## Workflow rules

- Claude is used for Spec Kit planning only.
- OpenCode is used for implementation only.
- Do not start coding before /speckit.tasks and /speckit.analyze are complete.
- Each phase must have:
  - one spec
  - one clarified scope
  - one technical plan
  - one task list
  - one implementation branch
