import type { Task, Category, Tag } from '@/types'

export const GEMINI_MODELS = [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Cost efficient (Recommended)' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Speed optimized' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Complex reasoning' },
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', description: 'Fast + powerful' },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', description: 'Most intelligent' },
] as const

export type GeminiModelId = typeof GEMINI_MODELS[number]['id']

interface TaskWithDetails extends Task {
    categoryName?: string
    tagNames?: string[]
}

function buildPrompt(tasks: TaskWithDetails[], language: 'en' | 'id'): string {
    const today = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const tasksByCategory: Record<string, TaskWithDetails[]> = {}
    tasks.forEach(task => {
        const category = task.categoryName || 'Uncategorized'
        if (!tasksByCategory[category]) {
            tasksByCategory[category] = []
        }
        tasksByCategory[category].push(task)
    })

    const tasksByDate: Record<string, TaskWithDetails[]> = {}
    tasks.forEach(task => {
        if (task.completedAt) {
            const date = new Date(task.completedAt).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            if (!tasksByDate[date]) {
                tasksByDate[date] = []
            }
            tasksByDate[date].push(task)
        }
    })

    const tasksSummary = tasks.map(t => {
        let summary = `- "${t.title}"`
        if (t.description) summary += `: ${t.description}`
        if (t.priority) summary += ` [Priority: ${t.priority.toUpperCase()}]`
        if (t.categoryName) summary += ` [Category: ${t.categoryName}]`
        if (t.tagNames && t.tagNames.length > 0) summary += ` [Tags: ${t.tagNames.join(', ')}]`

        if (t.startedAt && t.completedAt) {
            const start = new Date(t.startedAt).getTime()
            const end = new Date(t.completedAt).getTime()
            const durationMs = end - start
            const hours = Math.floor(durationMs / (1000 * 60 * 60))
            const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
            if (hours > 0 || minutes > 0) {
                summary += ` [Duration: ${hours > 0 ? `${hours}h ` : ''}${minutes}m]`
            }
        }

        if (t.completedAt) summary += ` [Completed: ${new Date(t.completedAt).toLocaleDateString()}]`

        if (t.comments && t.comments.length > 0) {
            const commentTexts = t.comments.map(c => `"${c.text}"`).join(', ')
            summary += `\n  Notes/Comments: ${commentTexts}`
        }

        return summary
    }).join('\n')

    const categorySummary = Object.entries(tasksByCategory).map(([cat, catTasks]) => {
        return `${cat}: ${catTasks.length} tasks completed`
    }).join('\n')

    if (language === 'id') {
        return `Kamu adalah seorang penulis konten profesional yang menulis artikel untuk LinkedIn dan Medium. Buatkan sebuah artikel dalam Bahasa Indonesia yang menceritakan perjalanan produktivitas saya berdasarkan task-task yang sudah saya selesaikan.

Tanggal hari ini: ${today}

Berikut task yang sudah selesai:
${tasksSummary}

Ringkasan per kategori:
${categorySummary}

Panduan penulisan:
1. Gunakan gaya penulisan profesional tapi tetap casual dan storytelling
2. Buat artikel dengan struktur: Pendahuluan, Project/Kategori yang dikerjakan, Highlight harian, Refleksi, dan Penutup
3. Masukkan detail task secara natural dalam narasi
4. Gunakan markdown formatting (heading, bold, bullet points, emoji)
5. Panjang artikel sekitar 500-800 kata
6. Buat judul yang menarik dan engaging
7. Fokus pada pencapaian dan pembelajaran

Tulis artikel dalam format markdown:`
    }

    return `You are a professional content writer who writes articles for LinkedIn and Medium. Create an article in English that tells my productivity journey based on the tasks I've completed.

Today's date: ${today}

Completed tasks:
${tasksSummary}

Summary by category:
${categorySummary}

Writing guidelines:
1. Use a professional yet casual and storytelling writing style
2. Structure the article with: Introduction, Projects/Categories worked on, Daily highlights, Reflections, and Closing
3. Weave task details naturally into the narrative
4. Use markdown formatting (headings, bold, bullet points, emoji)
5. Article length around 500-800 words
6. Create an engaging and attractive title
7. Focus on achievements and learnings

Write the article in markdown format:`
}

export async function generateArticle(
    apiKey: string,
    model: GeminiModelId,
    tasks: Task[],
    categories: Category[],
    tags: Tag[],
    language: 'en' | 'id'
): Promise<string> {
    const enrichedTasks: TaskWithDetails[] = tasks
        .filter(t => t.status === 'completed')
        .map(task => ({
            ...task,
            categoryName: categories.find(c => c.id === task.categoryId)?.name,
            tagNames: tags.filter(t => task.tags.includes(t.id)).map(t => t.name)
        }))

    if (enrichedTasks.length === 0) {
        throw new Error(language === 'id'
            ? 'Tidak ada task yang sudah selesai. Selesaikan beberapa task terlebih dahulu!'
            : 'No completed tasks found. Complete some tasks first!')
    }

    const prompt = buildPrompt(enrichedTasks, language)

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.8,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 4096,
                }
            })
        }
    )

    if (!response.ok) {
        const error = await response.json()
        if (error.error?.message) {
            throw new Error(error.error.message)
        }
        throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('No content generated')
    }

    return data.candidates[0].content.parts[0].text
}

export function downloadMarkdown(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
