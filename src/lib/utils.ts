import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDuration(ms: number): string {
    if (ms < 0) return '0m'

    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
        return `${days}d ${hours % 24}h`
    }
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`
    }
    if (minutes > 0) {
        return `${minutes}m`
    }
    return `${seconds}s`
}

export function formatDate(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

export function formatTime(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function formatDateTime(date: Date | string): string {
    return `${formatDate(date)} ${formatTime(date)}`
}

export function isOverdue(dueDate: Date | string): boolean {
    return new Date(dueDate) < new Date()
}

export function isDueSoon(dueDate: Date | string, hoursThreshold = 24): boolean {
    const due = new Date(dueDate)
    const now = new Date()
    const diff = due.getTime() - now.getTime()
    const hoursMs = hoursThreshold * 60 * 60 * 1000
    return diff > 0 && diff < hoursMs
}

export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
