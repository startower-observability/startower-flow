<script setup lang="ts">
import { computed } from 'vue'
import { type TaskStatus, type TaskPriority } from '@/types'
import { 
  BarChart3, 
  Target,
  Clock,
  Play,
  CheckCircle2,
  PauseCircle,
  Flame,
  AlertTriangle,
  Minus,
  ChevronDown
} from 'lucide-vue-next'

interface Stats {
  total: number
  byStatus: Record<TaskStatus, number>
  byPriority: Record<TaskPriority, number>
  completedPercentage: number
}

interface Props {
  stats: Stats
  selectedPriority?: TaskPriority | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'select-priority': [priority: TaskPriority | null]
}>()

const statusItems = computed(() => [
  { key: 'pending', label: 'Pending', count: props.stats.byStatus['pending'], bg: 'bg-[#F0F0F5]', icon: Clock },
  { key: 'in-progress', label: 'In Progress', count: props.stats.byStatus['in-progress'], bg: 'bg-[#DBEAFE]', icon: Play },
  { key: 'completed', label: 'Completed', count: props.stats.byStatus['completed'], bg: 'bg-[#D1FAE5]', icon: CheckCircle2 },
  { key: 'on-hold', label: 'On Hold', count: props.stats.byStatus['on-hold'], bg: 'bg-[#FEF3C7]', icon: PauseCircle },
])

const priorityItems = computed(() => [
  { key: 'urgent', label: 'Urgent', count: props.stats.byPriority['urgent'], color: 'bg-[#CBA6F7]', icon: Flame },
  { key: 'high', label: 'High', count: props.stats.byPriority['high'], color: 'bg-[#FF7F7F]', icon: AlertTriangle },
  { key: 'medium', label: 'Medium', count: props.stats.byPriority['medium'], color: 'bg-[#FFDE59]', icon: Minus },
  { key: 'low', label: 'Low', count: props.stats.byPriority['low'], color: 'bg-[#E8E8ED]', icon: ChevronDown },
])

function handlePriorityClick(priority: TaskPriority) {
  if (props.selectedPriority === priority) {
    emit('select-priority', null)
  } else {
    emit('select-priority', priority)
  }
}
</script>

<template>
  <!-- Bento Grid Layout -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
    <!-- Main Progress Card -->
    <div class="md:col-span-2 bento-card p-6">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-[#FFDE59] border-2 border-foreground shadow-[3px_3px_0_#1D1D1F] flex items-center justify-center">
            <BarChart3 class="w-7 h-7" :stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl font-bold">Progress Overview</h2>
            <p class="text-muted-foreground text-sm">{{ stats.total }} total tasks</p>
          </div>
        </div>
        <div class="text-right">
          <span class="text-5xl font-black">{{ stats.completedPercentage }}%</span>
          <p class="text-sm text-muted-foreground font-medium">completed</p>
        </div>
      </div>
      
      <!-- Progress bar - Neubrutalism style -->
      <div class="progress-bar mb-6">
        <div class="progress-fill" :style="{ width: `${stats.completedPercentage}%` }" />
      </div>
      
      <!-- Status Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          v-for="item in statusItems" 
          :key="item.key"
          class="p-4 rounded-xl border-2 border-foreground shadow-[2px_2px_0_#1D1D1F] text-center transition-all hover:shadow-[3px_3px_0_#1D1D1F] hover:translate-x-[-1px] hover:translate-y-[-1px]"
          :class="item.bg"
        >
          <component :is="item.icon" class="w-6 h-6 mx-auto mb-2" :stroke-width="2" />
          <div class="text-3xl font-black">{{ item.count }}</div>
          <div class="text-xs font-semibold text-foreground/70">{{ item.label }}</div>
        </div>
      </div>
    </div>
    
    <!-- Priority Card (clickable for filtering) -->
    <div class="bento-card p-6">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-xl bg-[#CBA6F7] border-2 border-foreground shadow-[2px_2px_0_#1D1D1F] flex items-center justify-center">
          <Target class="w-5 h-5" :stroke-width="2.5" />
        </div>
        <h3 class="font-bold">Priority</h3>
        <span v-if="selectedPriority" class="text-xs px-2 py-0.5 bg-[#FFDE59] rounded-lg font-semibold border border-foreground">
          Filtered
        </span>
      </div>
      
      <div class="space-y-3">
        <button 
          v-for="item in priorityItems" 
          :key="item.key"
          class="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer"
          :class="[
            selectedPriority === item.key 
              ? 'border-foreground bg-foreground/5 shadow-[2px_2px_0_#1D1D1F]' 
              : 'border-foreground/20 hover:border-foreground hover:bg-foreground/5'
          ]"
          @click="handlePriorityClick(item.key as TaskPriority)"
        >
          <div 
            class="w-8 h-8 rounded-lg border-2 border-foreground flex items-center justify-center"
            :class="item.color"
          >
            <component :is="item.icon" class="w-4 h-4" :stroke-width="2.5" />
          </div>
          <span class="font-medium flex-1 text-left">{{ item.label }}</span>
          <span class="text-2xl font-black">{{ item.count }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
