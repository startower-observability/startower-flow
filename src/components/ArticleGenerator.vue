<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task, Category, Tag } from '@/types'
import { generateArticle, downloadMarkdown, GEMINI_MODELS, type GeminiModelId } from '@/lib/gemini'
import { 
  X, 
  Sparkles, 
  Download, 
  Loader2, 
  Key, 
  Globe, 
  Cpu,
  FileText,
  AlertCircle,
  CheckCircle2
} from 'lucide-vue-next'

interface Props {
  tasks: Task[]
  categories: Category[]
  tags: Tag[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
}>()

// Form state
const apiKey = ref('')
const selectedModel = ref<GeminiModelId>('gemini-2.0-flash')
const selectedLanguage = ref<'en' | 'id'>('id')

// UI state
const isGenerating = ref(false)
const generatedArticle = ref('')
const error = ref('')
const success = ref(false)

const completedTasksCount = computed(() => 
  props.tasks.filter(t => t.status === 'completed').length
)

const canGenerate = computed(() => 
  apiKey.value.trim().length > 0 && completedTasksCount.value > 0
)

async function handleGenerate() {
  if (!canGenerate.value) return

  isGenerating.value = true
  error.value = ''
  generatedArticle.value = ''

  try {
    const article = await generateArticle(
      apiKey.value.trim(),
      selectedModel.value,
      props.tasks,
      props.categories,
      props.tags,
      selectedLanguage.value
    )
    generatedArticle.value = article
    success.value = true
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An error occurred'
  } finally {
    isGenerating.value = false
  }
}

function handleDownload() {
  if (!generatedArticle.value) return
  
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const filename = `${today}.md`
  downloadMarkdown(generatedArticle.value, filename)
}

function handleClose() {
  // Clear sensitive data
  apiKey.value = ''
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="neubrutalism-card-static bg-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-6 border-b-2 border-foreground flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#CBA6F7] to-[#7C3AED] border-2 border-foreground shadow-[3px_3px_0_#1D1D1F] flex items-center justify-center">
            <Sparkles class="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 class="text-xl font-bold">Generate Article</h2>
            <p class="text-sm text-muted-foreground">Create article from completed tasks</p>
          </div>
        </div>
        <button 
          class="w-10 h-10 rounded-lg border-2 border-foreground bg-card hover:bg-secondary transition-colors flex items-center justify-center"
          @click="handleClose"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Stats -->
        <div class="p-4 rounded-xl border-2 border-foreground bg-[#D1FAE5] flex items-center gap-3">
          <CheckCircle2 class="w-6 h-6 text-green-700" />
          <div>
            <span class="font-bold text-lg">{{ completedTasksCount }}</span>
            <span class="text-muted-foreground ml-1">completed tasks ready to generate</span>
          </div>
        </div>

        <!-- API Key Input -->
        <div class="space-y-2">
          <label class="flex items-center gap-2 font-semibold">
            <Key class="w-4 h-4" />
            Gemini API Key
          </label>
          <input 
            v-model="apiKey"
            type="password"
            placeholder="Enter your Gemini API key..."
            class="w-full h-12 px-4 rounded-xl border-2 border-foreground bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED] shadow-[2px_2px_0_#1D1D1F]"
          />
          <p class="text-xs text-muted-foreground">
            Get your API key from <a href="https://aistudio.google.com/apikey" target="_blank" class="text-[#7C3AED] underline">Google AI Studio</a>. Key is not stored.
          </p>
        </div>

        <!-- Model Selector -->
        <div class="space-y-2">
          <label class="flex items-center gap-2 font-semibold">
            <Cpu class="w-4 h-4" />
            AI Model
          </label>
          <select 
            v-model="selectedModel"
            class="w-full h-12 px-4 rounded-xl border-2 border-foreground bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED] shadow-[2px_2px_0_#1D1D1F] cursor-pointer"
          >
            <option v-for="model in GEMINI_MODELS" :key="model.id" :value="model.id">
              {{ model.name }} - {{ model.description }}
            </option>
          </select>
        </div>

        <!-- Language Selector -->
        <div class="space-y-2">
          <label class="flex items-center gap-2 font-semibold">
            <Globe class="w-4 h-4" />
            Language
          </label>
          <div class="flex gap-3">
            <button 
              class="flex-1 h-12 px-4 rounded-xl border-2 border-foreground font-semibold transition-all flex items-center justify-center gap-2"
              :class="selectedLanguage === 'id' 
                ? 'bg-[#FFDE59] shadow-[2px_2px_0_#1D1D1F]' 
                : 'bg-card hover:bg-secondary'"
              @click="selectedLanguage = 'id'"
            >
              🇮🇩 Bahasa Indonesia
            </button>
            <button 
              class="flex-1 h-12 px-4 rounded-xl border-2 border-foreground font-semibold transition-all flex items-center justify-center gap-2"
              :class="selectedLanguage === 'en' 
                ? 'bg-[#FFDE59] shadow-[2px_2px_0_#1D1D1F]' 
                : 'bg-card hover:bg-secondary'"
              @click="selectedLanguage = 'en'"
            >
              🇺🇸 English
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="p-4 rounded-xl border-2 border-[#FF7F7F] bg-[#FF7F7F]/20 flex items-start gap-3">
          <AlertCircle class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p class="font-semibold text-red-700">Error</p>
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>
        </div>

        <!-- Generated Article Preview -->
        <div v-if="generatedArticle" class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 font-semibold">
              <FileText class="w-4 h-4" />
              Generated Article
            </label>
            <button 
              class="px-4 py-2 rounded-lg border-2 border-foreground bg-[#76E0C2] shadow-[2px_2px_0_#1D1D1F] hover:shadow-[3px_3px_0_#1D1D1F] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all font-semibold text-sm flex items-center gap-2"
              @click="handleDownload"
            >
              <Download class="w-4 h-4" />
              Download .md
            </button>
          </div>
          <div class="p-4 rounded-xl border-2 border-foreground bg-white max-h-80 overflow-y-auto">
            <pre class="whitespace-pre-wrap text-sm font-mono">{{ generatedArticle }}</pre>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t-2 border-foreground flex justify-end gap-3">
        <button 
          class="px-6 py-3 rounded-xl border-2 border-foreground bg-card hover:bg-secondary transition-colors font-semibold"
          @click="handleClose"
        >
          Cancel
        </button>
        <button 
          class="px-6 py-3 rounded-xl border-2 border-foreground bg-gradient-to-r from-[#CBA6F7] to-[#7C3AED] text-white shadow-[3px_3px_0_#1D1D1F] hover:shadow-[4px_4px_0_#1D1D1F] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[3px_3px_0_#1D1D1F] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          :disabled="!canGenerate || isGenerating"
          @click="handleGenerate"
        >
          <Loader2 v-if="isGenerating" class="w-5 h-5 animate-spin" />
          <Sparkles v-else class="w-5 h-5" />
          {{ isGenerating ? 'Generating...' : 'Generate Article' }}
        </button>
      </div>
    </div>
  </div>
</template>
