# StarTower Flow - Product Requirements Document

## Overview

**StarTower Flow** adalah aplikasi todo web sederhana untuk mengelola task harian. Aplikasi ini dirancang untuk penggunaan cepat tanpa perlu penyimpanan permanen - data disimpan di localStorage browser.

### Tech Stack
- **Frontend Framework**: Vue.js 3 (Composition API)
- **Runtime**: Bun
- **UI Library**: Shadcn-Vue
- **Styling**: Tailwind CSS (bundled with Shadcn)
- **Storage**: localStorage (browser)

---

## Core Features

### 1. Task Management
| Feature | Description |
|---------|-------------|
| **Add Task** | Menambahkan task baru dengan judul dan deskripsi opsional |
| **Edit Task** | Mengubah judul, deskripsi, dan status task |
| **Delete Task** | Menghapus task dari daftar |
| **Reorder** | Drag & drop untuk mengatur urutan task (opsional) |

### 2. Status System
Task memiliki beberapa status yang bisa dipilih:

| Status | Color | Icon |
|--------|-------|------|
| `pending` | Gray | ⏳ |
| `in-progress` | Blue | 🔄 |
| `completed` | Green | ✅ |
| `on-hold` | Orange | ⏸️ |

### 3. Priority Levels
Setiap task memiliki level prioritas:

| Priority | Color | Badge |
|----------|-------|-------|
| `low` | Gray | Low |
| `medium` | Yellow | Medium |
| `high` | Red | High |
| `urgent` | Purple (animated) | 🔥 Urgent |

### 4. Due Date / Deadline
- Setiap task bisa memiliki due date opsional
- Tampilan warning jika deadline sudah dekat (< 24 jam)
- Tampilan overdue jika sudah melewati deadline
- Sorting berdasarkan deadline

### 5. Categories & Tags
- **Categories**: Grup utama task (e.g., Work, Personal, Learning)
- **Tags**: Label fleksibel untuk filterisasi (e.g., bug, feature, meeting)
- Setiap task bisa punya 1 category dan multiple tags
- Color coding untuk categories

### 6. Filter & Search
- **Search**: Filter task berdasarkan title atau description
- **Filter by Status**: Show/hide task berdasarkan status
- **Filter by Priority**: Filter berdasarkan level prioritas
- **Filter by Category**: Filter berdasarkan kategori
- **Filter by Tag**: Filter berdasarkan tag
- **Combined Filters**: Bisa kombinasi beberapa filter sekaligus

### 7. Export Data
- **Export to JSON**: Download semua data task sebagai file JSON
- **Import from JSON**: Restore data dari file JSON backup
- Includes all tasks, categories, tags, dan comments

### 8. Progress & Statistics
- **Persentase per Status**: Menampilkan berapa persen task di setiap status
- **Overall Progress**: Progress bar keseluruhan berdasarkan task yang completed
- **Task Counter**: Menampilkan jumlah task per status (e.g., "3/10 completed")
- **Priority Breakdown**: Statistik berdasarkan priority level

### 9. Duration Tracking
- **Start Time**: Waktu mulai saat task dipindah ke `in-progress`
- **End Time**: Waktu selesai saat task dipindah ke `completed`
- **Duration Display**: Menampilkan durasi pengerjaan dalam format yang readable (e.g., "2h 30m")
- **Auto Timer**: Timer otomatis berjalan saat task dalam status `in-progress`

### 10. Comments System
- **Add Comment**: Menambahkan komentar/catatan pada setiap task
- **Timestamp**: Setiap komentar memiliki timestamp
- **Delete Comment**: Menghapus komentar

---

## Data Model

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  categoryId?: string;
  tags: string[];
  dueDate?: Date;
  createdAt: Date;
  startedAt?: Date;      // When moved to in-progress
  completedAt?: Date;    // When moved to completed
  comments: Comment[];
  order: number;
}

interface Comment {
  id: string;
  text: string;
  createdAt: Date;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface AppState {
  tasks: Task[];
  categories: Category[];
  tags: Tag[];
  lastUpdated: Date;
}
```

---

## UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────────┐
│  🚀 StarTower Flow                      [Clear All] │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐    │
│  │  📊 Progress Overview                       │    │
│  │  ████████████░░░░░░░ 60% Complete           │    │
│  │  Pending: 2 | In Progress: 1 | Done: 3      │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  ➕ Add New Task...                         │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─ Task Card ─────────────────────────────────┐    │
│  │  [ ] Task Title                    ⏱️ 1h 30m │    │
│  │      Description text here...               │    │
│  │      [Pending ▼] [💬 2] [🗑️]               │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─ Task Card (expanded) ──────────────────────┐    │
│  │  [✓] Completed Task                ⏱️ 2h 15m │    │
│  │      ├─ Comment 1 (10:30 AM)               │    │
│  │      └─ Comment 2 (11:45 AM)               │    │
│  │      [Add comment...]                       │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Design Principles
1. **Modern & Clean**: Menggunakan Shadcn components dengan styling modern
2. **Dark Mode Support**: Toggle untuk dark/light mode
3. **Responsive**: Mobile-first design, bekerja baik di semua screen size
4. **Micro-animations**: Transisi halus untuk interaksi yang lebih engaging
5. **Glassmorphism**: Subtle glass effect untuk cards (optional enhancement)

### Color Palette (Dark Mode Primary)
| Element | Color |
|---------|-------|
| Background | `#0a0a0a` |
| Card | `#1a1a1a` with subtle border |
| Primary | `#6366f1` (Indigo) |
| Success | `#22c55e` (Green) |
| Warning | `#f59e0b` (Amber) |
| Text | `#fafafa` |

---

## User Stories

1. **Sebagai user**, saya ingin menambahkan task baru dengan cepat agar bisa mencatat pekerjaan saya.
2. **Sebagai user**, saya ingin melihat persentase progress agar tahu seberapa banyak yang sudah selesai.
3. **Sebagai user**, saya ingin melacak durasi pengerjaan task agar bisa estimasi waktu lebih baik.
4. **Sebagai user**, saya ingin menambahkan komentar pada task untuk mencatat progress atau blockers.
5. **Sebagai user**, saya ingin data tersimpan di browser agar tidak hilang saat refresh.

---

## Technical Implementation

### Project Structure
```
startower-flow/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn components
│   │   ├── TaskCard.vue     # Individual task display
│   │   ├── TaskList.vue     # List of tasks
│   │   ├── TaskForm.vue     # Add/Edit task form
│   │   ├── ProgressStats.vue # Statistics display
│   │   └── CommentSection.vue
│   ├── composables/
│   │   ├── useTasks.ts      # Task management logic
│   │   ├── useLocalStorage.ts
│   │   └── useTimer.ts      # Duration tracking
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

### localStorage Strategy
- Auto-save on every state change
- Load state on app initialization
- Provide "Clear All" button to reset all data
- Handle corrupted data gracefully



## Out of Scope (v1.0)
- User authentication
- Cloud sync / backend storage
- Collaboration features
- Recurring tasks
- Notifications/reminders
- Offline PWA support (bisa ditambah di v2.0)

---

## Verification Plan

### Automated Testing
- Unit tests for composables (`useTasks`, `useTimer`) menggunakan Vitest
- Component tests untuk TaskCard dan TaskForm

### Manual Testing
1. **Add Task**: Tambah beberapa task, verify tampil di list
2. **Status Change**: Ubah status, verify timer dan durasi berjalan
3. **Comments**: Tambah & hapus komentar pada task
4. **Persistence**: Refresh browser, verify data masih ada
5. **Statistics**: Verify persentase dan counter akurat
6. **Responsive**: Test di berbagai screen size
7. **Dark Mode**: Toggle theme, verify tampilan konsisten

---

*Document Version: 1.0*  
*Created: 2026-01-18*
