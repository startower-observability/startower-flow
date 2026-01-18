export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'on-hold'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Comment {
    id: string
    text: string
    createdAt: string
}

export interface Task {
    id: string
    title: string
    description?: string
    status: TaskStatus
    priority: TaskPriority
    categoryId?: string
    tags: string[]
    dueDate?: string
    createdAt: string
    startedAt?: string
    completedAt?: string
    comments: Comment[]
    order: number
}

export interface Category {
    id: string
    name: string
    color: string
    icon?: string
}

export interface Tag {
    id: string
    name: string
    color: string
}

export interface AppState {
    tasks: Task[]
    categories: Category[]
    tags: Tag[]
    lastUpdated: string
}

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: string }> = {
    'pending': { label: 'Pending', color: 'bg-gray-500', icon: '⏳' },
    'in-progress': { label: 'In Progress', color: 'bg-blue-500', icon: '🔄' },
    'completed': { label: 'Completed', color: 'bg-green-500', icon: '✅' },
    'on-hold': { label: 'On Hold', color: 'bg-orange-500', icon: '⏸️' },
}

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
    'low': { label: 'Low', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
    'medium': { label: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
    'high': { label: 'High', color: 'text-red-400', bgColor: 'bg-red-500/20' },
    'urgent': { label: 'Urgent', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
}

export const DEFAULT_CATEGORIES: Category[] = []

export const DEFAULT_TAGS: Tag[] = []
