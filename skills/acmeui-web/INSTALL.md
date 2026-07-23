# Installation

Copy the complete `acmeui-web` skill directory into the skill location used by your agent.

Suggested layouts:

```text
<project>/.agents/skills/acmeui-web/
<project>/.codex/skills/acmeui-web/
<user-home>/.agents/skills/acmeui-web/
```

The installed directory must retain:

```text
acmeui-web/
├── SKILL.md
├── references/
├── examples/
└── scripts/
```

This repository keeps the canonical tracked skill at `skills/acmeui-web` and
its root `AGENTS.md` directs project agents to load it. For hosts that only
auto-discover `.agents/skills`, copy the complete directory there and restart
or reload the agent session.

Optional project check:

```bash
node skills/acmeui-web/scripts/check-project.mjs .
```
