# Issue Backlog Notes

Use this folder for durable issue notes when GitHub issue text needs a repo-local companion spec.

## Suggested frontmatter

```yaml
---
issue: 12
title: Short issue title
status: candidate
related_adrs:
  - .specs/adr/0001-prompt-files-for-zx-and-pi.md
---
```

## Suggested sections

- Context / evidence
- Proposed implementation
- Acceptance criteria
- Verification plan
- Risks / blockers

Keep GitHub issues as the source of truth for current status. Repo-local issue files are for structured notes that future agents should inspect with the code.
