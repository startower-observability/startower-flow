---
description: How to run and develop the StarTower Flow todo app
---

# StarTower Flow - Todo List App

## Quick Start
// turbo-all

1. Install dependencies:
```bash
bun install
```

2. Start development server:
```bash
bun run dev
```

3. Open browser at http://localhost:5173

## Build for Production

```bash
bun run build
```

## Features

- Add/Edit/Delete tasks
- Status management (Pending, In Progress, Completed, On Hold)
- Priority levels (Low, Medium, High, Urgent)
- Duration tracking (auto timer when in progress)
- Categories & Tags
- Comments on tasks
- Search & Filters
- Export/Import JSON backup
- Dark/Light mode toggle
- Data persisted in localStorage

## Tech Stack

- Vue.js 3 (Composition API)
- Bun runtime
- Vite
- Tailwind CSS v4
- TypeScript
