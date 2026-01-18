# StarTower Flow ✨

A modern, beautiful todo application with AI-powered article generation. Built with Vue 3, TypeScript, and Tailwind CSS featuring Neubrutalism design.

![StarTower Flow](https://img.shields.io/badge/Vue-3-4FC08D?style=flat-square&logo=vue.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwindcss)

## Features

- 📝 Task Management with status, priority, categories, and tags
- 🎨 Beautiful Neubrutalism UI design
- 🤖 AI Article Generator (Google Gemini) - Generate LinkedIn/Medium articles from completed tasks
- 💾 Local storage persistence - Data stays in your browser
- 📱 Fully responsive design
- 🔍 Advanced filtering and search
- ⏱️ Task duration tracking
- 💬 Task comments/notes
- 📤 Export/Import data as JSON

## Quick Start

### Using Docker (Recommended)

```bash
bun install
bun run build
docker compose up -d
```

Open http://localhost:8080

### Development

```bash
bun install
bun run dev
```

Open http://localhost:5173

### Build for Production

```bash
bun run build
```

## AI Article Generator

Generate professional articles from your completed tasks using Google Gemini AI:

1. Click the purple **Generate Article** button in the header
2. Enter your [Gemini API Key](https://aistudio.google.com/apikey)
3. Select AI model and language
4. Click Generate and download as `.md` file

**Supported Models:** Gemini 2.0 Flash, 2.5 Flash, 2.5 Pro, 3 Flash, 3 Pro

## Tech Stack

- **Frontend:** Vue 3 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide Vue
- **Calendar:** v-calendar
- **AI:** Google Gemini API
- **Container:** Docker + Nginx

## License

MIT
