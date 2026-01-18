<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Task, Category, Tag } from '@/types'
import { PRIORITY_CONFIG } from '@/types'
import { formatDuration, formatDateTime, isOverdue, isDueSoon } from '@/lib/utils'
import { 
  Clock, 
  Play, 
  CheckCircle2, 
  PauseCircle,
  Timer,
  Calendar,
  MessageCircle,
  ChevronDown,
  Pencil,
  Trash2,
  X,
  Send,
  Flame,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Hash
} from 'lucide-vue-next'

interface Props {
  task: Task
  categories: Category[]
  tags: Tag[]
  duration: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:status': [status: string]
  'update:priority': [priority: string]
  'delete': []
  'add-comment': [text: string]
  'delete-comment': [commentId: string]
  'edit': []
}>()

const isExpanded = ref(false)
const newComment = ref('')

const priorityConfig = computed(() => PRIORITY_CONFIG[props.task.priority] || PRIORITY_CONFIG['medium'])
const category = computed(() => props.categories.find(c => c.id === props.task.categoryId))
const taskTags = computed(() => props.tags.filter(t => props.task.tags.includes(t.id)))

const dueDateStatus = computed(() => {
  if (!props.task.dueDate) return null
  if (isOverdue(props.task.dueDate)) return 'overdue'
  if (isDueSoon(props.task.dueDate)) return 'soon'
  return 'normal'
})

function submitComment() {
  if (newComment.value.trim()) {
    emit('add-comment', newComment.value.trim())
    newComment.value = ''
  }
}

const priorityBg = computed(() => {
  switch (props.task.priority) {
    case 'urgent': return 'bg-[#CBA6F7]'
    case 'high': return 'bg-[#FF7F7F]'
    case 'medium': return 'bg-[#FFDE59]'
    default: return 'bg-[#E8E8ED]'
  }
})

const statusBg = computed(() => {
  switch (props.task.status) {
    case 'in-progress': return 'bg-[#DBEAFE] border-[#93C5FD]'
    case 'completed': return 'bg-[#D1FAE5] border-[#6EE7B7]'
    case 'on-hold': return 'bg-[#FEF3C7] border-[#FCD34D]'
    default: return 'bg-[#F0F0F5] border-[#E5E5EA]'
  }
})

const statusIcon = computed(() => {
  switch (props.task.status) {
    case 'in-progress': return Play
    case 'completed': return CheckCircle2
    case 'on-hold': return PauseCircle
    default: return Clock
  }
})
</script>

<template>
  <div 
    class="neubrutalism-card overflow-hidden"
    :class="{ 
      'opacity-70': task.status === 'completed',
      'neubrutalism-lavender': task.priority === 'urgent'
    }"
  >
    <div class="p-4 sm:p-5">
      <!-- Desktop Layout -->
      <div class="hidden sm:flex items-start gap-4">
        <!-- Status Icon -->
        <div 
          class="w-12 h-12 rounded-xl border-2 border-foreground shadow-[2px_2px_0_#1D1D1F] flex items-center justify-center shrink-0"
          :class="statusBg"
        >
          <component :is="statusIcon" class="w-6 h-6" :stroke-width="2" />
        </div>
        
        <!-- Main Content -->
        <div class="flex-1 min-w-0">
          <!-- Row 1: Priority + Title -->
          <div class="flex items-center gap-3 mb-1">
            <span 
              class="px-3 py-1 rounded-lg text-sm font-black border-2 border-foreground flex items-center gap-1 shadow-[2px_2px_0_#1D1D1F] shrink-0"
              :class="priorityBg"
            >
              <Flame v-if="task.priority === 'urgent'" class="w-4 h-4" />
              <ArrowUp v-else-if="task.priority === 'high'" class="w-4 h-4" />
              <ArrowRight v-else-if="task.priority === 'medium'" class="w-4 h-4" />
              <ArrowDown v-else class="w-4 h-4" />
              {{ priorityConfig.label }}
            </span>
            <h3 
              class="text-lg font-bold"
              :class="{ 'line-through text-muted-foreground': task.status === 'completed' }"
            >
              {{ task.title }}
            </h3>
          </div>
          
          <!-- Description -->
          <p v-if="task.description" class="text-sm text-muted-foreground line-clamp-2 mb-2">
            {{ task.description }}
          </p>
          
          <!-- Tags -->
          <div v-if="taskTags.length > 0" class="flex items-center gap-2 flex-wrap">
            <span 
              v-for="tag in taskTags" 
              :key="tag.id"
              class="px-2 py-0.5 rounded-md text-xs font-semibold border-2 flex items-center gap-0.5"
              :style="{ 
                backgroundColor: tag.color + '20', 
                borderColor: tag.color,
                color: tag.color 
              }"
            >
              <Hash class="w-3 h-3" />
              {{ tag.name }}
            </span>
          </div>
        </div>
        
        <!-- Right Side -->
        <div class="flex flex-col items-end gap-2 shrink-0">
          <!-- Category + Date Row -->
          <div class="flex items-center gap-2">
            <span 
              v-if="category"
              class="px-2.5 py-1 rounded-lg text-sm font-semibold border-2 border-foreground flex items-center gap-1.5"
              :style="{ backgroundColor: category.color + '30' }"
            >
              <span 
                class="w-2.5 h-2.5 rounded-full border border-foreground"
                :style="{ backgroundColor: category.color }"
              />
              {{ category.name }}
            </span>
            <div 
              v-if="task.dueDate"
              class="px-2 py-1 rounded-lg text-xs font-semibold border-2 border-foreground flex items-center gap-1"
              :class="{
                'bg-[#FF7F7F]': dueDateStatus === 'overdue',
                'bg-[#FFDE59]': dueDateStatus === 'soon',
                'bg-card': dueDateStatus === 'normal'
              }"
            >
              <Calendar class="w-3 h-3" />
              {{ formatDateTime(task.dueDate) }}
            </div>
          </div>
          
          <!-- Duration -->
          <div 
            v-if="task.startedAt"
            class="px-3 py-1.5 rounded-lg border-2 border-foreground font-mono font-bold text-sm flex items-center gap-1"
            :class="task.status === 'in-progress' ? 'bg-[#7DD3FC]' : 'bg-card'"
          >
            <Timer class="w-4 h-4" />
            {{ formatDuration(duration) }}
          </div>
          
          <!-- Comments toggle -->
          <button 
            class="px-3 py-1 rounded-lg text-sm font-semibold border-2 border-foreground bg-card hover:bg-secondary transition-all flex items-center gap-1"
            @click="isExpanded = !isExpanded"
          >
            <MessageCircle class="w-4 h-4" />
            {{ task.comments.length }}
            <ChevronDown class="w-4 h-4 transition-transform" :class="{ 'rotate-180': isExpanded }" />
          </button>
        </div>
      </div>
      
      <!-- Mobile Layout -->
      <div class="sm:hidden">
        <!-- Row 1: Status + Priority + Title -->
        <div class="flex items-center gap-2 flex-wrap mb-2">
          <div 
            class="w-8 h-8 rounded-lg border-2 border-foreground shadow-[1px_1px_0_#1D1D1F] flex items-center justify-center shrink-0"
            :class="statusBg"
          >
            <component :is="statusIcon" class="w-4 h-4" :stroke-width="2" />
          </div>
          <span 
            class="px-2 py-0.5 rounded-lg text-xs font-black border-2 border-foreground flex items-center gap-1 shadow-[1px_1px_0_#1D1D1F] shrink-0"
            :class="priorityBg"
          >
            <Flame v-if="task.priority === 'urgent'" class="w-3 h-3" />
            <ArrowUp v-else-if="task.priority === 'high'" class="w-3 h-3" />
            <ArrowRight v-else-if="task.priority === 'medium'" class="w-3 h-3" />
            <ArrowDown v-else class="w-3 h-3" />
            {{ priorityConfig.label }}
          </span>
          <h3 
            class="text-base font-bold flex-1"
            :class="{ 'line-through text-muted-foreground': task.status === 'completed' }"
          >
            {{ task.title }}
          </h3>
        </div>
        
        <!-- Row 2: Category + Date + Comments -->
        <div class="flex items-center gap-1.5 flex-wrap mb-2">
          <span 
            v-if="category"
            class="px-1.5 py-0.5 rounded text-xs font-semibold border border-foreground flex items-center gap-1"
            :style="{ backgroundColor: category.color + '30' }"
          >
            <span 
              class="w-2 h-2 rounded-full"
              :style="{ backgroundColor: category.color }"
            />
            {{ category.name }}
          </span>
          <div 
            v-if="task.dueDate"
            class="px-1.5 py-0.5 rounded text-xs font-semibold border border-foreground flex items-center gap-1"
            :class="{
              'bg-[#FF7F7F]': dueDateStatus === 'overdue',
              'bg-[#FFDE59]': dueDateStatus === 'soon',
              'bg-card': dueDateStatus === 'normal'
            }"
          >
            <Calendar class="w-3 h-3" />
            {{ formatDateTime(task.dueDate) }}
          </div>
          <div 
            v-if="task.startedAt"
            class="px-1.5 py-0.5 rounded border border-foreground font-mono font-bold text-xs flex items-center gap-1"
            :class="task.status === 'in-progress' ? 'bg-[#7DD3FC]' : 'bg-card'"
          >
            <Timer class="w-3 h-3" />
            {{ formatDuration(duration) }}
          </div>
          <button 
            class="px-1.5 py-0.5 rounded text-xs font-semibold border border-foreground bg-card flex items-center gap-0.5"
            @click="isExpanded = !isExpanded"
          >
            <MessageCircle class="w-3 h-3" />
            {{ task.comments.length }}
          </button>
        </div>
        
        <!-- Description -->
        <p v-if="task.description" class="text-xs text-muted-foreground line-clamp-2 mb-2">
          {{ task.description }}
        </p>
        
        <!-- Tags -->
        <div v-if="taskTags.length > 0" class="flex items-center gap-1 flex-wrap">
          <span 
            v-for="tag in taskTags" 
            :key="tag.id"
            class="px-1.5 py-0.5 rounded text-xs font-semibold border flex items-center gap-0.5"
            :style="{ 
              backgroundColor: tag.color + '20', 
              borderColor: tag.color,
              color: tag.color 
            }"
          >
            <Hash class="w-2.5 h-2.5" />
            {{ tag.name }}
          </span>
        </div>
      </div>
      
      <!-- Actions Row -->
      <div class="flex items-center gap-3 mt-4 pt-4 border-t-2 border-dashed border-foreground/30">
        <!-- Status select only -->
        <select 
          :value="task.status"
          class="h-10 px-3 rounded-xl border-2 border-foreground bg-card font-semibold text-sm shadow-[2px_2px_0_#1D1D1F] hover:shadow-[3px_3px_0_#1D1D1F] transition-all cursor-pointer"
          @change="emit('update:status', ($event.target as HTMLSelectElement).value)"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
        </select>
        
        <div class="flex-1" />
        
        <!-- Edit -->
        <button 
          class="h-10 px-4 rounded-xl border-2 border-foreground bg-[#76E0C2] font-semibold shadow-[2px_2px_0_#1D1D1F] hover:shadow-[3px_3px_0_#1D1D1F] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center gap-2"
          @click="emit('edit')"
        >
          <Pencil class="w-4 h-4" />
          Edit
        </button>
        
        <!-- Delete -->
        <button 
          class="h-10 w-10 rounded-xl border-2 border-foreground bg-[#FF7F7F] shadow-[2px_2px_0_#1D1D1F] hover:shadow-[3px_3px_0_#1D1D1F] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center"
          @click="emit('delete')"
        >
          <Trash2 class="w-5 h-5" />
        </button>
      </div>
      
      <!-- Comments Section -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-[500px]"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 max-h-[500px]"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-if="isExpanded" class="mt-4 pt-4 border-t-2 border-dashed border-foreground/30 overflow-hidden">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 rounded-lg bg-[#FFDE59] border-2 border-foreground flex items-center justify-center">
              <MessageCircle class="w-4 h-4" />
            </div>
            <h4 class="font-bold">Comments</h4>
          </div>
          
          <!-- Comment list -->
          <div v-if="task.comments.length > 0" class="space-y-2 mb-4">
            <div 
              v-for="comment in task.comments" 
              :key="comment.id"
              class="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 border-2 border-foreground/10"
            >
              <div class="flex-1">
                <p class="text-sm font-medium">{{ comment.text }}</p>
                <span class="text-xs text-muted-foreground">{{ formatDateTime(comment.createdAt) }}</span>
              </div>
              <button 
                class="w-6 h-6 rounded-lg bg-[#FF7F7F] border border-foreground flex items-center justify-center hover:scale-110 transition-transform"
                @click="emit('delete-comment', comment.id)"
              >
                <X class="w-3 h-3" />
              </button>
            </div>
          </div>
          <div v-else class="text-center py-4 text-muted-foreground font-medium">
            No comments yet
          </div>
          
          <!-- Add comment -->
          <div class="flex gap-2">
            <input 
              v-model="newComment"
              placeholder="Add a comment..."
              class="flex-1 h-10 px-4 rounded-xl border-2 border-foreground bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              @keyup.enter="submitComment"
            />
            <button 
              class="h-10 px-5 rounded-xl bg-[#FFDE59] border-2 border-foreground font-bold shadow-[2px_2px_0_#1D1D1F] hover:shadow-[3px_3px_0_#1D1D1F] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center gap-2"
              @click="submitComment"
            >
              <Send class="w-4 h-4" />
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
