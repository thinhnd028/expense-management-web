# Skill: add-component

Cài đặt một component từ shadcn/ui vào project.

## Instructions

When this skill is invoked:

1. Identify which component(s) the user wants. If not specified, ask.
2. Run the shadcn CLI to add the component:

```bash
npx shadcn@latest add <component-name>
```

The `components.json` at the project root configures the output path (`src/components/ui/`), Tailwind, and aliases — the CLI reads it automatically.

3. After installation, read the generated file in `src/components/ui/` and verify it follows the existing pattern (uses `cn()`, exports named component, uses Radix UI primitives where applicable).
4. If the user wants to use the new component immediately, show a minimal usage example consistent with how other `src/components/ui/` components are used in this codebase.
5. Do not manually write shadcn component code — always use the CLI so the output stays in sync with the project's Tailwind config and CSS variables.
