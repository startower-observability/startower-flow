<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Task, Category, Tag, TaskStatus, TaskPriority } from '@/types'
import { Plus, Pencil, X, ChevronDown } from 'lucide-vue-next'
import DateTimePicker from '@/components/ui/DateTimePicker.vue'

interface Props {
  task?: Task
  categories: Category[]
  tags: Tag[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [task: Omit<Task, 'id' | 'createdAt' | 'comments' | 'order'>]
  cancel: []
  'add-category': [category: Omit<Category, 'id'>]
  'add-tag': [tag: Omit<Tag, 'id'>]
}>()

const randomColors = [
  '#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#a855f7', '#f43f5e', '#0ea5e9', '#eab308'
]

function getRandomColor() {
  return randomColors[Math.floor(Math.random() * randomColors.length)]
}

const title = ref(props.task?.title || '')
const description = ref(props.task?.description || '')
const status = ref<TaskStatus>(props.task?.status || 'pending')
const priority = ref<TaskPriority>(props.task?.priority || 'medium')
const categoryId = ref(props.task?.categoryId || '')
const selectedTags = ref<string[]>(props.task?.tags || [])
const dueDate = ref<string | undefined>(props.task?.dueDate)

const categorySearch = ref('')
const showCategoryDropdown = ref(false)
const filteredCategories = computed(() => {
  if (!categorySearch.value) return props.categories
  return props.categories.filter(c => 
    c.name.toLowerCase().includes(categorySearch.value.toLowerCase())
  )
})
const showAddNewCategory = computed(() => {
  if (!categorySearch.value.trim()) return false
  return !props.categories.some(c => 
    c.name.toLowerCase() === categorySearch.value.toLowerCase()
  )
})

const tagSearch = ref('')
const showTagDropdown = ref(false)
const filteredTags = computed(() => {
  if (!tagSearch.value) return props.tags.filter(t => !selectedTags.value.includes(t.id))
  return props.tags.filter(t => 
    t.name.toLowerCase().includes(tagSearch.value.toLowerCase()) &&
    !selectedTags.value.includes(t.id)
  )
})
const showAddNewTag = computed(() => {
  if (!tagSearch.value.trim()) return false
  return !props.tags.some(t => 
    t.name.toLowerCase() === tagSearch.value.toLowerCase()
  )
})

const selectedCategory = computed(() => 
  props.categories.find(c => c.id === categoryId.value)
)

const selectedTagObjects = computed(() => 
  props.tags.filter(t => selectedTags.value.includes(t.id))
)

const isEditMode = computed(() => !!props.task)

function selectCategory(cat: Category) {
  categoryId.value = cat.id
  categorySearch.value = ''
  showCategoryDropdown.value = false
}

function closeCategoryDropdown() {
  setTimeout(() => showCategoryDropdown.value = false, 200)
}

function closeTagDropdown() {
  setTimeout(() => showTagDropdown.value = false, 200)
}

function addNewCategory() {
  if (categorySearch.value.trim()) {
    emit('add-category', {
      name: categorySearch.value.trim(),
      color: getRandomColor() || '#888888'
    })
    categorySearch.value = ''
    showCategoryDropdown.value = false
  }
}

function clearCategory() {
  categoryId.value = ''
}

function selectTag(tag: Tag) {
  if (!selectedTags.value.includes(tag.id)) {
    selectedTags.value.push(tag.id)
  }
  tagSearch.value = ''
  showTagDropdown.value = false
}

function addNewTag() {
  if (tagSearch.value.trim()) {
    emit('add-tag', {
      name: tagSearch.value.trim(),
      color: getRandomColor() || '#888888'
    })
    tagSearch.value = ''
    showTagDropdown.value = false
  }
}

function removeTag(tagId: string) {
  const index = selectedTags.value.indexOf(tagId)
  if (index !== -1) {
    selectedTags.value.splice(index, 1)
  }
}

function handleSubmit() {
  if (!title.value.trim()) return
  
  emit('submit', {
    title: title.value.trim(),
    description: description.value.trim() || undefined,
    status: status.value,
    priority: priority.value,
    categoryId: categoryId.value || undefined,
    tags: selectedTags.value,
    dueDate: dueDate.value ? new Date(dueDate.value).toISOString() : undefined,
    startedAt: props.task?.startedAt,
    completedAt: props.task?.completedAt,
  })
}

watch(() => props.categories.length, (newLen, oldLen) => {
  if (newLen > oldLen && props.categories.length > 0) {
    const newCat = props.categories[props.categories.length - 1]
    if (newCat) {
      categoryId.value = newCat.id
    }
  }
})

watch(() => props.tags.length, (newLen, oldLen) => {
  if (newLen > oldLen && props.tags.length > 0) {
    const newTag = props.tags[props.tags.length - 1]
    if (newTag && !selectedTags.value.includes(newTag.id)) {
      selectedTags.value.push(newTag.id)
    }
  }
})
</script>

<template>
  <div class="neubrutalism-card-static bg-card max-h-[90vh] overflow-y-auto">
    <form class="p-6" @submit.prevent="handleSubmit">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <div class="w-12 h-12 rounded-xl bg-[#FFDE59] border-2 border-foreground shadow-[3px_3px_0_#1D1D1F] flex items-center justify-center">
          <Pencil v-if="isEditMode" class="w-6 h-6" />
          <Plus v-else class="w-6 h-6" :stroke-width="2.5" />
        </div>
        <h3 class="text-xl font-black">
          {{ isEditMode ? 'Edit Task' : 'Add New Task' }}
        </h3>
      </div>
      
      <!-- Title -->
      <div class="mb-4">
        <label class="block text-sm font-bold mb-2">Title *</label>
        <input 
          v-model="title"
          placeholder="What needs to be done?"
          class="w-full h-12 px-4 rounded-xl border-2 border-foreground bg-card text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-[2px_2px_0_#1D1D1F]"
        />
      </div>
      
      <!-- Description -->
      <div class="mb-4">
        <label class="block text-sm font-bold mb-2">Description</label>
        <textarea 
          v-model="description"
          placeholder="Add more details..."
          rows="2"
          class="w-full px-4 py-3 rounded-xl border-2 border-foreground bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-[2px_2px_0_#1D1D1F] resize-none"
        />
      </div>
      
      <!-- Status & Priority -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-bold mb-2">Status</label>
          <select 
            v-model="status"
            class="w-full h-12 px-4 rounded-xl border-2 border-foreground bg-card font-semibold focus:outline-none focus:ring-2 focus:ring-primary shadow-[2px_2px_0_#1D1D1F] cursor-pointer"
          >
            <option value="pending">⏳ Pending</option>
            <option value="in-progress">▶️ In Progress</option>
            <option value="completed">✅ Completed</option>
            <option value="on-hold">⏸️ On Hold</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-bold mb-2">Priority</label>
          <select 
            v-model="priority"
            class="w-full h-12 px-4 rounded-xl border-2 border-foreground bg-card font-semibold focus:outline-none focus:ring-2 focus:ring-primary shadow-[2px_2px_0_#1D1D1F] cursor-pointer"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">🔥 Urgent</option>
          </select>
        </div>
      </div>
      
      <!-- Category Combobox -->
      <div class="mb-4">
        <label class="block text-sm font-bold mb-2">Category</label>
        
        <!-- Selected category display -->
        <div v-if="selectedCategory" class="flex items-center gap-2 mb-2">
          <span 
            class="px-3 py-1.5 rounded-lg text-sm font-semibold border-2 border-foreground flex items-center gap-2"
            :style="{ backgroundColor: selectedCategory.color + '30' }"
          >
            <span 
              class="w-3 h-3 rounded-full border border-foreground"
              :style="{ backgroundColor: selectedCategory.color }"
            />
            {{ selectedCategory.name }}
            <button 
              type="button" 
              class="w-4 h-4 rounded-full bg-foreground/20 flex items-center justify-center hover:bg-foreground/40"
              @click="clearCategory"
            >
              <X class="w-3 h-3" />
            </button>
          </span>
        </div>
        
        <!-- Category search input -->
        <div class="relative">
          <input 
            v-model="categorySearch"
            placeholder="Type to search or add category..."
            class="w-full h-12 px-4 pr-10 rounded-xl border-2 border-foreground bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-[2px_2px_0_#1D1D1F]"
            @focus="showCategoryDropdown = true"
            @blur="closeCategoryDropdown"
          />
          <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          
          <!-- Dropdown -->
          <div 
            v-if="showCategoryDropdown && (filteredCategories.length > 0 || showAddNewCategory)"
            class="absolute z-10 w-full mt-1 bg-card border-2 border-foreground rounded-xl shadow-[4px_4px_0_#1D1D1F] overflow-hidden"
          >
            <!-- Existing categories -->
            <button
              v-for="cat in filteredCategories"
              :key="cat.id"
              type="button"
              class="w-full px-4 py-3 text-left text-sm font-medium hover:bg-secondary flex items-center gap-2 border-b border-foreground/10 last:border-0"
              @click="selectCategory(cat)"
            >
              <span 
                class="w-4 h-4 rounded-full border-2 border-foreground"
                :style="{ backgroundColor: cat.color }"
              />
              {{ cat.name }}
            </button>
            
            <!-- Add new option -->
            <button
              v-if="showAddNewCategory"
              type="button"
              class="w-full px-4 py-3 text-left text-sm font-bold bg-[#76E0C2] hover:bg-[#5fd4b3] flex items-center gap-2"
              @click="addNewCategory"
            >
              <Plus class="w-4 h-4" />
              Add "{{ categorySearch }}"
            </button>
          </div>
        </div>
      </div>
      
      <!-- Due Date -->
      <div class="mb-4">
        <label class="block text-sm font-bold mb-2">Due Date</label>
        <DateTimePicker v-model="dueDate" placeholder="Select due date..." />
      </div>
      
      <!-- Tags Combobox -->
      <div class="mb-6">
        <label class="block text-sm font-bold mb-2">Tags</label>
        
        <!-- Selected tags display -->
        <div v-if="selectedTagObjects.length > 0" class="flex flex-wrap gap-2 mb-2">
          <span 
            v-for="tag in selectedTagObjects"
            :key="tag.id"
            class="px-3 py-1 rounded-lg text-sm font-semibold border-2 border-foreground flex items-center gap-1"
            :style="{ backgroundColor: tag.color, color: 'white' }"
          >
            {{ tag.name }}
            <button 
              type="button" 
              class="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/50"
              @click="removeTag(tag.id)"
            >
              <X class="w-3 h-3" />
            </button>
          </span>
        </div>
        
        <!-- Tag search input -->
        <div class="relative">
          <input 
            v-model="tagSearch"
            placeholder="Type to search or add tags..."
            class="w-full h-12 px-4 pr-10 rounded-xl border-2 border-foreground bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-[2px_2px_0_#1D1D1F]"
            @focus="showTagDropdown = true"
            @blur="closeTagDropdown"
          />
          <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          
          <!-- Dropdown -->
          <div 
            v-if="showTagDropdown && (filteredTags.length > 0 || showAddNewTag)"
            class="absolute z-10 w-full mt-1 bg-card border-2 border-foreground rounded-xl shadow-[4px_4px_0_#1D1D1F] overflow-hidden max-h-48 overflow-y-auto"
          >
            <!-- Existing tags -->
            <button
              v-for="tag in filteredTags"
              :key="tag.id"
              type="button"
              class="w-full px-4 py-3 text-left text-sm font-medium hover:bg-secondary flex items-center gap-2 border-b border-foreground/10 last:border-0"
              @click="selectTag(tag)"
            >
              <span 
                class="w-4 h-4 rounded-full border-2 border-foreground"
                :style="{ backgroundColor: tag.color }"
              />
              {{ tag.name }}
            </button>
            
            <!-- Add new option -->
            <button
              v-if="showAddNewTag"
              type="button"
              class="w-full px-4 py-3 text-left text-sm font-bold bg-[#76E0C2] hover:bg-[#5fd4b3] flex items-center gap-2"
              @click="addNewTag"
            >
              <Plus class="w-4 h-4" />
              Add "{{ tagSearch }}"
            </button>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex gap-3 pt-5 border-t-2 border-dashed border-foreground/30">
        <button 
          type="button"
          class="flex-1 h-12 rounded-xl border-2 border-foreground bg-card font-bold shadow-[3px_3px_0_#1D1D1F] hover:shadow-[4px_4px_0_#1D1D1F] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button 
          type="submit"
          :disabled="!title.trim()"
          class="flex-1 h-12 rounded-xl border-2 border-foreground bg-[#FFDE59] font-bold shadow-[3px_3px_0_#1D1D1F] hover:shadow-[4px_4px_0_#1D1D1F] hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {{ isEditMode ? 'Save Changes' : 'Add Task' }}
        </button>
      </div>
    </form>
  </div>
</template>
