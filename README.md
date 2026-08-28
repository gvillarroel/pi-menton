# Pi Menton

Inspectable runbooks that combine Pi and ZX to help constrained models complete practical tasks in small, explicit stages. Prompts live beside their scripts as separate Markdown files, with repeatable validation and clear run artifacts.

Experiments live in `spike/`; reusable runbooks live in `menton/`. The prompt-layout example runs without model inference, while the original spike may invoke Pi.

## Get started

Requires Node.js 20 or later; install the pinned local tooling with npm.

```sh
npm ci
npm run doctor
npm test
```

## Documentation

- [Documentation index](docs/README.md)
- [Usage and operations](docs/getting-started.md)
- [Repository layout and validation](docs/repository-guide.md)
- [Architecture decisions](.specs/adr/README.md)
- [Mentor skill](skills/pi-mentor/SKILL.md)
- [AGENTS.md](AGENTS.md)
