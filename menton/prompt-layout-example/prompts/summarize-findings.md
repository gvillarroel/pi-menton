---
required_variables:
  - file_path
  - goal
---
Read the file at `{{file_path}}`.

Goal: {{goal}}

Return at most three short bullets:
- what the file does,
- which inputs or tools matter,
- how a human can verify it.
