import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useLocalStorage } from './useLocalStorage'
import { generateId } from '@/lib/utils'
import type { Task, Category, Tag, AppState, TaskStatus, TaskPriority, Comment } from '@/types'
import { DEFAULT_CATEGORIES, DEFAULT_TAGS } from '@/types'

const STORAGE_KEY = 'startower-flow-data'

const defaultState: AppState = {
    tasks: [],
    categories: DEFAULT_CATEGORIES,
    tags: DEFAULT_TAGS,
    lastUpdated: new Date().toISOString(),
}

export function useTasks() {
    const state = useLocalStorage<AppState>(STORAGE_KEY, defaultState)

    const timerInterval = ref<number | null>(null)
    const now = ref(Date.now())

    onMounted(() => {
        timerInterval.value = window.setInterval(() => {
            now.value = Date.now()
        }, 1000)
    })

    onUnmounted(() => {
        if (timerInterval.value) {
            clearInterval(timerInterval.value)
        }
    })

    const tasks = computed(() => state.value.tasks.sort((a, b) => a.order - b.order))
    const categories = computed(() => state.value.categories)
    const tags = computed(() => state.value.tags)

    const stats = computed(() => {
        const total = state.value.tasks.length
        const byStatus = {
            pending: state.value.tasks.filter(t => t.status === 'pending').length,
            'in-progress': state.value.tasks.filter(t => t.status === 'in-progress').length,
            completed: state.value.tasks.filter(t => t.status === 'completed').length,
            'on-hold': state.value.tasks.filter(t => t.status === 'on-hold').length,
        }
        const byPriority = {
            low: state.value.tasks.filter(t => t.priority === 'low').length,
            medium: state.value.tasks.filter(t => t.priority === 'medium').length,
            high: state.value.tasks.filter(t => t.priority === 'high').length,
            urgent: state.value.tasks.filter(t => t.priority === 'urgent').length,
        }
        const completedPercentage = total > 0 ? Math.round((byStatus.completed / total) * 100) : 0

        return {
            total,
            byStatus,
            byPriority,
            completedPercentage,
        }
    })

    function addTask(task: Omit<Task, 'id' | 'createdAt' | 'comments' | 'order'>): Task {
        const newTask: Task = {
            ...task,
            id: generateId(),
            createdAt: new Date().toISOString(),
            comments: [],
            order: state.value.tasks.length,
        }
        state.value.tasks.push(newTask)
        state.value.lastUpdated = new Date().toISOString()
        return newTask
    }

    function updateTask(id: string, updates: Partial<Task>): void {
        const index = state.value.tasks.findIndex(t => t.id === id)
        if (index !== -1) {
            const task = state.value.tasks[index]
            if (!task) return

            if (updates.status && updates.status !== task.status) {
                if (updates.status === 'in-progress' && !task.startedAt) {
                    updates.startedAt = new Date().toISOString()
                }
                if (updates.status === 'completed' && !task.completedAt) {
                    updates.completedAt = new Date().toISOString()
                }
                if (updates.status === 'pending') {
                    updates.startedAt = undefined
                    updates.completedAt = undefined
                }
            }

            state.value.tasks[index] = { ...task, ...updates } as Task
            state.value.lastUpdated = new Date().toISOString()
        }
    }

    function deleteTask(id: string): void {
        const index = state.value.tasks.findIndex(t => t.id === id)
        if (index !== -1) {
            state.value.tasks.splice(index, 1)
            state.value.tasks.forEach((t, i) => {
                t.order = i
            })
            state.value.lastUpdated = new Date().toISOString()
        }
    }

    function getTask(id: string): Task | undefined {
        return state.value.tasks.find(t => t.id === id)
    }

    function setStatus(id: string, status: TaskStatus): void {
        updateTask(id, { status })
    }

    function setPriority(id: string, priority: TaskPriority): void {
        updateTask(id, { priority })
    }

    function addComment(taskId: string, text: string): void {
        const task = getTask(taskId)
        if (task) {
            const comment: Comment = {
                id: generateId(),
                text,
                createdAt: new Date().toISOString(),
            }
            task.comments.push(comment)
            state.value.lastUpdated = new Date().toISOString()
        }
    }

    function deleteComment(taskId: string, commentId: string): void {
        const task = getTask(taskId)
        if (task) {
            const index = task.comments.findIndex(c => c.id === commentId)
            if (index !== -1) {
                task.comments.splice(index, 1)
                state.value.lastUpdated = new Date().toISOString()
            }
        }
    }

    function addCategory(category: Omit<Category, 'id'>): Category {
        const newCategory: Category = {
            ...category,
            id: generateId(),
        }
        state.value.categories.push(newCategory)
        state.value.lastUpdated = new Date().toISOString()
        return newCategory
    }

    function deleteCategory(id: string): void {
        const index = state.value.categories.findIndex(c => c.id === id)
        if (index !== -1) {
            state.value.categories.splice(index, 1)
            state.value.tasks.forEach(t => {
                if (t.categoryId === id) {
                    t.categoryId = undefined
                }
            })
            state.value.lastUpdated = new Date().toISOString()
        }
    }

    function addTag(tag: Omit<Tag, 'id'>): Tag {
        const newTag: Tag = {
            ...tag,
            id: generateId(),
        }
        state.value.tags.push(newTag)
        state.value.lastUpdated = new Date().toISOString()
        return newTag
    }

    function deleteTag(id: string): void {
        const index = state.value.tags.findIndex(t => t.id === id)
        if (index !== -1) {
            state.value.tags.splice(index, 1)
            state.value.tasks.forEach(t => {
                const tagIndex = t.tags.indexOf(id)
                if (tagIndex !== -1) {
                    t.tags.splice(tagIndex, 1)
                }
            })
            state.value.lastUpdated = new Date().toISOString()
        }
    }

    function getTaskDuration(task: Task): number {
        if (!task.startedAt) return 0

        const start = new Date(task.startedAt).getTime()
        const end = task.completedAt
            ? new Date(task.completedAt).getTime()
            : (task.status === 'in-progress' ? now.value : start)

        return end - start
    }

    function clearAll(): void {
        state.value = { ...defaultState, lastUpdated: new Date().toISOString() }
    }

    function exportData(): AppState {
        return state.value
    }

    function importData(data: AppState): void {
        state.value = {
            ...data,
            lastUpdated: new Date().toISOString(),
        }
    }

    return {
        tasks,
        categories,
        tags,
        stats,
        addTask,
        updateTask,
        deleteTask,
        getTask,
        setStatus,
        setPriority,
        addComment,
        deleteComment,
        addCategory,
        deleteCategory,
        addTag,
        deleteTag,
        getTaskDuration,
        clearAll,
        exportData,
        importData,
    }
}
