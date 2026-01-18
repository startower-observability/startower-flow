import { ref, computed, type Ref } from 'vue'
import type { Task, TaskStatus, TaskPriority } from '@/types'

interface FilterState {
    search: string
    statuses: TaskStatus[]
    priorities: TaskPriority[]
    categoryIds: string[]
    tagIds: string[]
}

export function useTaskFilters(tasks: Ref<Task[]>) {
    const filters = ref<FilterState>({
        search: '',
        statuses: [],
        priorities: [],
        categoryIds: [],
        tagIds: [],
    })

    const filteredTasks = computed(() => {
        let result = tasks.value

        if (filters.value.search) {
            const search = filters.value.search.toLowerCase()
            result = result.filter(
                t =>
                    t.title.toLowerCase().includes(search) ||
                    (t.description && t.description.toLowerCase().includes(search))
            )
        }

        if (filters.value.statuses.length > 0) {
            result = result.filter(t => filters.value.statuses.includes(t.status))
        }

        if (filters.value.priorities.length > 0) {
            result = result.filter(t => filters.value.priorities.includes(t.priority))
        }

        if (filters.value.categoryIds.length > 0) {
            result = result.filter(
                t => t.categoryId && filters.value.categoryIds.includes(t.categoryId)
            )
        }

        if (filters.value.tagIds.length > 0) {
            result = result.filter(t =>
                t.tags.some(tagId => filters.value.tagIds.includes(tagId))
            )
        }

        return result
    })

    const hasActiveFilters = computed(() => {
        return (
            filters.value.search !== '' ||
            filters.value.statuses.length > 0 ||
            filters.value.priorities.length > 0 ||
            filters.value.categoryIds.length > 0 ||
            filters.value.tagIds.length > 0
        )
    })

    function setSearch(search: string) {
        filters.value.search = search
    }

    function toggleStatus(status: TaskStatus) {
        const index = filters.value.statuses.indexOf(status)
        if (index === -1) {
            filters.value.statuses.push(status)
        } else {
            filters.value.statuses.splice(index, 1)
        }
    }

    function togglePriority(priority: TaskPriority) {
        const index = filters.value.priorities.indexOf(priority)
        if (index === -1) {
            filters.value.priorities.push(priority)
        } else {
            filters.value.priorities.splice(index, 1)
        }
    }

    function toggleCategory(categoryId: string) {
        const index = filters.value.categoryIds.indexOf(categoryId)
        if (index === -1) {
            filters.value.categoryIds.push(categoryId)
        } else {
            filters.value.categoryIds.splice(index, 1)
        }
    }

    function toggleTag(tagId: string) {
        const index = filters.value.tagIds.indexOf(tagId)
        if (index === -1) {
            filters.value.tagIds.push(tagId)
        } else {
            filters.value.tagIds.splice(index, 1)
        }
    }

    function clearFilters() {
        filters.value = {
            search: '',
            statuses: [],
            priorities: [],
            categoryIds: [],
            tagIds: [],
        }
    }

    return {
        filters,
        filteredTasks,
        hasActiveFilters,
        setSearch,
        toggleStatus,
        togglePriority,
        toggleCategory,
        toggleTag,
        clearFilters,
    }
}
