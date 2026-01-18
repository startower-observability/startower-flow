<script setup lang="ts">
import { ref } from 'vue'
import { useTasks } from '@/composables/useTasks'
import { useTaskFilters } from '@/composables/useTaskFilters'
import { exportToJson, importFromJson } from '@/composables/useLocalStorage'
import type { Task, AppState, TaskStatus, TaskPriority } from '@/types'
import { 
  Rocket, 
  Download,
  Upload,
  Trash2,
  Search,
  Plus,
  Sparkles,
  FileText
} from 'lucide-vue-next'

import TaskCard from '@/components/TaskCard.vue'
import TaskForm from '@/components/TaskForm.vue'
import ProgressStats from '@/components/ProgressStats.vue'
import FilterBar from '@/components/FilterBar.vue'
import ArticleGenerator from '@/components/ArticleGenerator.vue'

// Light mode only (dark mode removed)

// Task management
const {
  tasks,
  categories,
  tags,
  stats,
  addTask,
  updateTask,
  deleteTask,
  setStatus,
  setPriority,
  addComment,
  deleteComment,
  addCategory,
  addTag,
  getTaskDuration,
  clearAll,
  exportData,
  importData,
} = useTasks()

// Filtering
const {
  filters,
  filteredTasks,
  hasActiveFilters,
  setSearch,
  toggleStatus,
  togglePriority,
  toggleCategory,
  toggleTag,
  clearFilters,
} = useTaskFilters(tasks)

// UI state
const showForm = ref(false)
const editingTask = ref<Task | null>(null)
const showFilters = ref(false)
const selectedPriorityFilter = ref<TaskPriority | null>(null)
const showArticleGenerator = ref(false)

// Priority filter from sidebar
function handlePriorityFilter(priority: TaskPriority | null) {
  selectedPriorityFilter.value = priority
  if (priority) {
    // Make sure this priority is the only one selected
    filters.value.priorities = [priority]
  } else {
    // Clear priority filter
    filters.value.priorities = []
  }
}

// Form handling
function handleOpenForm(task?: Task) {
  editingTask.value = task || null
  showForm.value = true
}

function handleCloseForm() {
  showForm.value = false
  editingTask.value = null
}

function handleSubmitTask(taskData: Omit<Task, 'id' | 'createdAt' | 'comments' | 'order'>) {
  if (editingTask.value) {
    updateTask(editingTask.value.id, taskData)
  } else {
    addTask(taskData)
  }
  handleCloseForm()
}

// Status/Priority handlers
function handleStatusChange(taskId: string, status: string) {
  setStatus(taskId, status as TaskStatus)
}

function handlePriorityChange(taskId: string, priority: string) {
  setPriority(taskId, priority as TaskPriority)
}

// Export/Import
function handleExport() {
  const data = exportData()
  exportToJson(data, `startower-flow-backup-${new Date().toISOString().slice(0, 10)}.json`)
}

function handleImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        const data = await importFromJson<AppState>(file)
        importData(data)
        alert('Data imported successfully!')
      } catch {
        alert('Failed to import data. Please check the file format.')
      }
    }
  }
  input.click()
}

function handleClearAll() {
  if (confirm('Are you sure you want to clear all tasks? This cannot be undone.')) {
    clearAll()
  }
}
</script>

<template>
  <div class="min-h-screen relative overflow-hidden">
    <!-- Decorative blobs -->
    <div class="gradient-blob w-[600px] h-[600px] bg-[#FFDE59] top-[-200px] right-[-200px] fixed" />
    <div class="gradient-blob w-[500px] h-[500px] bg-[#76E0C2] bottom-[-150px] left-[-150px] fixed" />
    <div class="gradient-blob w-[400px] h-[400px] bg-[#CBA6F7] top-[40%] left-[50%] fixed" />
    
    <div class="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <!-- Header -->
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12">
        <div class="flex items-center gap-3 sm:gap-5">
          <!-- Modern Logo with Lucide icon -->
          <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#FFDE59] to-[#FF9F43] border-2 sm:border-3 border-foreground shadow-[3px_3px_0_#1D1D1F] sm:shadow-[4px_4px_0_#1D1D1F] flex items-center justify-center animate-float shrink-0">
            <Rocket class="w-6 h-6 sm:w-8 sm:h-8 text-foreground" :stroke-width="2.5" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
              StarTower Flow
            </h1>
            <p class="text-muted-foreground font-medium flex items-center gap-1 text-sm sm:text-base">
              Your daily tasks, simplified 
              <Sparkles class="w-4 h-4 text-[#FFDE59]" />
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-1.5 sm:gap-2">
          <!-- Export -->
          <button 
            class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border-2 border-foreground bg-card shadow-[2px_2px_0_#1D1D1F] sm:shadow-[3px_3px_0_#1D1D1F] hover:shadow-[3px_3px_0_#1D1D1F] sm:hover:shadow-[4px_4px_0_#1D1D1F] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center"
            title="Export data"
            @click="handleExport"
          >
            <Download class="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <!-- Generate Article -->
          <button 
            class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border-2 border-foreground bg-gradient-to-br from-[#CBA6F7] to-[#7C3AED] shadow-[2px_2px_0_#1D1D1F] sm:shadow-[3px_3px_0_#1D1D1F] hover:shadow-[3px_3px_0_#1D1D1F] sm:hover:shadow-[4px_4px_0_#1D1D1F] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center"
            title="Generate Article with AI"
            @click="showArticleGenerator = true"
          >
            <FileText class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
          
          <!-- Import -->
          <button 
            class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border-2 border-foreground bg-card shadow-[2px_2px_0_#1D1D1F] sm:shadow-[3px_3px_0_#1D1D1F] hover:shadow-[3px_3px_0_#1D1D1F] sm:hover:shadow-[4px_4px_0_#1D1D1F] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center"
            title="Import data"
            @click="handleImport"
          >
            <Upload class="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <!-- Clear all -->
          <button 
            class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border-2 border-foreground bg-[#FF7F7F] shadow-[2px_2px_0_#1D1D1F] sm:shadow-[3px_3px_0_#1D1D1F] hover:shadow-[3px_3px_0_#1D1D1F] sm:hover:shadow-[4px_4px_0_#1D1D1F] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center"
            title="Clear all"
            @click="handleClearAll"
          >
            <Trash2 class="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>
      
      <!-- Stats with Bento style -->
      <ProgressStats 
        :stats="stats" 
        :selected-priority="selectedPriorityFilter"
        class="mb-10" 
        @select-priority="handlePriorityFilter"
      />
      
      <!-- Action Bar -->
      <div class="flex items-center gap-4 mb-8">
        <!-- Filter button -->
        <button 
          class="h-12 px-6 rounded-xl border-2 border-foreground bg-card shadow-[3px_3px_0_#1D1D1F] hover:shadow-[4px_4px_0_#1D1D1F] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all font-semibold flex items-center gap-2"
          :class="{ 'bg-[#FFDE59]': hasActiveFilters }"
          @click="showFilters = !showFilters"
        >
          <Search class="w-4 h-4" />
          Filters
          <span v-if="hasActiveFilters" class="w-2 h-2 rounded-full bg-foreground animate-pulse" />
        </button>
        
        <div class="flex-1" />
        
        <!-- Add Task button - Neubrutalism style -->
        <button 
          class="h-12 px-8 rounded-xl bg-[#FFDE59] border-3 border-foreground shadow-[4px_4px_0_#1D1D1F] hover:shadow-[6px_6px_0_#1D1D1F] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0_#1D1D1F] active:translate-x-[2px] active:translate-y-[2px] transition-all font-bold text-lg flex items-center gap-2"
          @click="handleOpenForm()"
        >
          <Plus class="w-5 h-5" :stroke-width="3" />
          Add Task
        </button>
      </div>
      
      <!-- Filters -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 -translate-y-4 scale-95"
      >
        <FilterBar 
          v-if="showFilters"
          :filters="filters"
          :categories="categories"
          :tags="tags"
          :has-active-filters="hasActiveFilters"
          class="mb-8"
          @update:search="setSearch"
          @toggle-status="toggleStatus"
          @toggle-priority="togglePriority"
          @toggle-category="toggleCategory"
          @toggle-tag="toggleTag"
          @clear-filters="clearFilters"
        />
      </Transition>
      
      <!-- Task Form Modal -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          v-if="showForm" 
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm"
          @click.self="handleCloseForm"
        >
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-90 rotate-2"
            enter-to-class="opacity-100 scale-100 rotate-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 rotate-0"
            leave-to-class="opacity-0 scale-90 -rotate-2"
          >
            <TaskForm
              v-if="showForm"
              :task="editingTask ?? undefined"
              :categories="categories"
              :tags="tags"
              class="w-full max-w-lg"
              @submit="handleSubmitTask"
              @cancel="handleCloseForm"
              @add-category="addCategory"
              @add-tag="addTag"
            />
          </Transition>
        </div>
      </Transition>
      
      <!-- Task List -->
      <div class="space-y-5">
        <TransitionGroup
          enter-active-class="transition-all duration-400 ease-out"
          enter-from-class="opacity-0 translate-x-8 scale-95"
          enter-to-class="opacity-100 translate-x-0 scale-100"
          leave-active-class="transition-all duration-300 ease-in absolute w-full"
          leave-from-class="opacity-100 translate-x-0 scale-100"
          leave-to-class="opacity-0 -translate-x-8 scale-95"
          move-class="transition-all duration-400"
        >
          <TaskCard
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            :categories="categories"
            :tags="tags"
            :duration="getTaskDuration(task)"
            @update:status="handleStatusChange(task.id, $event)"
            @update:priority="handlePriorityChange(task.id, $event)"
            @delete="deleteTask(task.id)"
            @add-comment="addComment(task.id, $event)"
            @delete-comment="deleteComment(task.id, $event)"
            @edit="handleOpenForm(task)"
          />
        </TransitionGroup>
        
        <!-- Empty state -->
        <div v-if="filteredTasks.length === 0" class="neubrutalism-card neubrutalism-mint p-12 text-center">
          <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#FFDE59] border-3 border-foreground shadow-[4px_4px_0_#1D1D1F] flex items-center justify-center animate-float">
            <Sparkles v-if="!hasActiveFilters" class="w-10 h-10" />
            <Search v-else class="w-10 h-10" />
          </div>
          <h3 class="text-2xl font-black mb-3">
            {{ hasActiveFilters ? 'No tasks found!' : 'Ready to crush it?' }}
          </h3>
          <p class="text-foreground/70 mb-6 font-medium">
            {{ hasActiveFilters 
              ? 'Try adjusting your filters'
              : 'Add your first task and start being productive!'
            }}
          </p>
          <button 
            v-if="hasActiveFilters"
            class="h-11 px-6 rounded-xl border-2 border-foreground bg-card shadow-[3px_3px_0_#1D1D1F] font-semibold hover:shadow-[4px_4px_0_#1D1D1F] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            @click="clearFilters"
          >
            Clear filters
          </button>
          <button 
            v-else
            class="h-12 px-8 rounded-xl bg-[#FFDE59] border-3 border-foreground shadow-[4px_4px_0_#1D1D1F] font-bold text-lg hover:shadow-[6px_6px_0_#1D1D1F] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center gap-2 mx-auto"
            @click="handleOpenForm()"
          >
            <Plus class="w-5 h-5" :stroke-width="3" />
            Add Task
          </button>
        </div>
      </div>
      
      <!-- Footer -->
      <footer class="mt-20 text-center">
        <div class="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card border-2 border-foreground shadow-[3px_3px_0_#1D1D1F]">
          <Rocket class="w-5 h-5" />
          <span class="font-bold">StarTower Flow</span>
          <span class="text-muted-foreground">© {{ new Date().getFullYear() }}</span>
        </div>
        <p class="text-sm text-muted-foreground mt-4">
          Data stored locally in your browser 🔒
        </p>
      </footer>
    </div>
  </div>
  
  <!-- Article Generator Modal -->
  <ArticleGenerator 
    v-if="showArticleGenerator"
    :tasks="tasks"
    :categories="categories"
    :tags="tags"
    @close="showArticleGenerator = false"
  />
</template>
