<script setup lang="ts">
import { computed } from 'vue'
import type { Category, Tag, TaskStatus, TaskPriority } from '@/types'
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/types'
import { 
  Search, 
  X, 
  Clock, 
  Play, 
  CheckCircle2, 
  PauseCircle
} from 'lucide-vue-next'

interface FilterState {
  search: string
  statuses: TaskStatus[]
  priorities: TaskPriority[]
  categoryIds: string[]
  tagIds: string[]
}

interface Props {
  filters: FilterState
  categories: Category[]
  tags: Tag[]
  hasActiveFilters: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:search': [value: string]
  'toggle-status': [status: TaskStatus]
  'toggle-priority': [priority: TaskPriority]
  'toggle-category': [categoryId: string]
  'toggle-tag': [tagId: string]
  'clear-filters': []
}>()

const statusOptions = computed(() => Object.entries(STATUS_CONFIG).map(([key, value]) => ({
  key: key as TaskStatus,
  ...value,
})))

const statusIcons: Record<TaskStatus, any> = {
  'pending': Clock,
  'in-progress': Play,
  'completed': CheckCircle2,
  'on-hold': PauseCircle,
}

const statusColors: Record<string, string> = {
  'pending': 'bg-[#E8E8ED]',
  'in-progress': 'bg-[#BFDBFE]',
  'completed': 'bg-[#D1FAE5]',
  'on-hold': 'bg-[#FEF9C3]',
}

const priorityColors: Record<string, string> = {
  urgent: 'bg-[#CBA6F7]',
  high: 'bg-[#FF7F7F]',
  medium: 'bg-[#FFDE59]',
  low: 'bg-[#E8E8ED]',
}
</script>

<template>
  <div class="bento-card p-5">
    <!-- Search -->
    <div class="relative mb-5">
      <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input 
        :value="filters.search"
        placeholder="Search tasks..."
        class="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-foreground bg-card font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-[2px_2px_0_#1D1D1F]"
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      />
    </div>
    
    <!-- Filter Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Status</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="status in statusOptions"
            :key="status.key"
            class="px-3 py-2 rounded-xl border-2 border-foreground font-semibold text-sm transition-all flex items-center gap-1.5"
            :class="filters.statuses.includes(status.key) 
              ? statusColors[status.key] + ' shadow-[3px_3px_0_#1D1D1F]' 
              : 'bg-card shadow-[2px_2px_0_#1D1D1F] hover:shadow-[3px_3px_0_#1D1D1F] hover:translate-x-[-1px] hover:translate-y-[-1px]'"
            @click="emit('toggle-status', status.key)"
          >
            <component :is="statusIcons[status.key]" class="w-4 h-4" />
            {{ status.label }}
          </button>
        </div>
      </div>
      
      <!-- Priority -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Priority</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(config, key) in PRIORITY_CONFIG"
            :key="key"
            class="px-3 py-2 rounded-xl border-2 border-foreground font-semibold text-sm transition-all"
            :class="[
              filters.priorities.includes(key as TaskPriority) 
                ? priorityColors[key] + ' shadow-[2px_2px_0_#1D1D1F]' 
                : 'bg-card shadow-[2px_2px_0_#1D1D1F] hover:shadow-[3px_3px_0_#1D1D1F] hover:translate-x-[-1px] hover:translate-y-[-1px]'
            ]"
            @click="emit('toggle-priority', key as TaskPriority)"
          >
            {{ config.label }}
          </button>
        </div>
      </div>
      
      <!-- Category -->
      <div v-if="categories.length > 0">
        <label class="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Category</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="category in categories"
            :key="category.id"
            class="px-3 py-2 rounded-xl border-2 font-semibold text-sm transition-all"
            :class="filters.categoryIds.includes(category.id) 
              ? 'shadow-[2px_2px_0_#1D1D1F] translate-x-[-1px] translate-y-[-1px]' 
              : 'shadow-[2px_2px_0_#1D1D1F] hover:shadow-[3px_3px_0_#1D1D1F] hover:translate-x-[-1px] hover:translate-y-[-1px]'"
            :style="filters.categoryIds.includes(category.id) 
              ? { backgroundColor: category.color, borderColor: '#1D1D1F', color: 'white' }
              : { backgroundColor: 'white', borderColor: category.color, color: category.color }"
            @click="emit('toggle-category', category.id)"
          >
            {{ category.icon }} {{ category.name }}
          </button>
        </div>
      </div>
      
      <!-- Tags -->
      <div v-if="tags.length > 0">
        <label class="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Tags</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in tags"
            :key="tag.id"
            class="px-3 py-2 rounded-xl border-2 font-semibold text-sm transition-all"
            :class="filters.tagIds.includes(tag.id) 
              ? 'shadow-[2px_2px_0_#1D1D1F] translate-x-[-1px] translate-y-[-1px]' 
              : 'shadow-[2px_2px_0_#1D1D1F] hover:shadow-[3px_3px_0_#1D1D1F] hover:translate-x-[-1px] hover:translate-y-[-1px]'"
            :style="filters.tagIds.includes(tag.id) 
              ? { backgroundColor: tag.color, borderColor: '#1D1D1F', color: 'white' }
              : { backgroundColor: 'white', borderColor: tag.color, color: tag.color }"
            @click="emit('toggle-tag', tag.id)"
          >
            {{ tag.name }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Clear -->
    <div v-if="hasActiveFilters" class="mt-5 pt-4 border-t-2 border-dashed border-foreground/30">
      <button 
        class="w-full h-11 rounded-xl border-2 border-foreground bg-card font-semibold shadow-[2px_2px_0_#1D1D1F] hover:shadow-[3px_3px_0_#1D1D1F] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2"
        @click="emit('clear-filters')"
      >
        <X class="w-4 h-4" />
        Clear all filters
      </button>
    </div>
  </div>
</template>
