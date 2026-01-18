<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css'
import { Calendar, X } from 'lucide-vue-next'

interface Props {
  modelValue?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select date and time...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const date = ref<Date | null>(props.modelValue ? new Date(props.modelValue) : null)

watch(() => props.modelValue, (newVal) => {
  date.value = newVal ? new Date(newVal) : null
})

watch(date, (newVal) => {
  emit('update:modelValue', newVal ? newVal.toISOString() : undefined)
})

const displayValue = computed(() => {
  if (!date.value) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date.value)
})

function clearDate() {
  date.value = null
}
</script>

<template>
  <div class="date-picker-wrapper">
    <DatePicker 
      v-model="date" 
      mode="dateTime"
      :popover="{ visibility: 'click', placement: 'bottom-start' }"
      color="gray"
      is-required
    >
      <template #default="{ togglePopover }">
        <div class="relative">
          <button
            type="button"
            class="w-full h-12 px-4 pr-20 rounded-xl border-2 border-foreground bg-card text-left font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-[2px_2px_0_#1D1D1F] cursor-pointer flex items-center"
            @click="togglePopover"
          >
            <span v-if="displayValue" class="text-foreground">{{ displayValue }}</span>
            <span v-else class="text-muted-foreground">{{ placeholder }}</span>
          </button>
          
          <!-- Clear button -->
          <button
            v-if="date"
            type="button"
            class="absolute right-12 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-foreground/20 transition-colors"
            @click.stop="clearDate"
          >
            <X class="w-4 h-4" />
          </button>
          
          <!-- Calendar icon -->
          <div 
            class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#FFDE59] border-2 border-foreground flex items-center justify-center pointer-events-none"
          >
            <Calendar class="w-4 h-4" />
          </div>
        </div>
      </template>
    </DatePicker>
  </div>
</template>

<style>
/* 
 * V-Calendar Custom Styling
 * Based on browser inspection findings:
 * - Container needs explicit width (was 250px, need 340px)
 * - Header uses grid-template-columns, not flexbox
 * - Clock icon SVG needs stroke override
 * - Time selects need wider min-width
 */

/* ==========================================
   CONTAINER - Force wider width
   ========================================== */
.vc-container {
  width: 340px !important;
  min-width: 340px !important;
  font-family: 'Inter', -apple-system, sans-serif !important;
}

/* ==========================================
   POPOVER - Neubrutalism styling
   ========================================== */
.vc-popover-content {
  border: 3px solid #1D1D1F !important;
  border-radius: 16px !important;
  box-shadow: 6px 6px 0 #1D1D1F !important;
  overflow: hidden !important;
}

/* ==========================================
   HEADER - Title and Navigation
   FIX: There are 2 overlapping .vc-header elements
   Only style the outer one, make inner one transparent
   ========================================== */
.vc-header {
  background: transparent !important;
  border-bottom: none !important;
  padding: 12px 16px !important;
}

/* Only the first/outer header should have background */
.vc-pane-container > .vc-pane > .vc-header,
.vc-weeks-rows + .vc-header {
  background: #FFFFFF !important;
  border-bottom: 2px solid #E5E5EA !important;
}

/* Title button - FORCE BLACK TEXT */
.vc-title {
  color: #1D1D1F !important;
  font-weight: 700 !important;
  font-size: 1rem !important;
  background: transparent !important;
}

.vc-title span {
  color: #1D1D1F !important;
}

.vc-title-wrapper {
  display: flex !important;
  justify-content: center !important;
  background: transparent !important;
}

/* Navigation arrows */
.vc-arrow {
  color: #1D1D1F !important;
  border: 2px solid #1D1D1F !important;
  border-radius: 8px !important;
  background: #FFFFFF !important;
  width: 32px !important;
  height: 32px !important;
}

.vc-arrow:hover {
  background: #FFDE59 !important;
}

/* ==========================================
   WEEKDAYS
   ========================================== */
.vc-weekdays {
  padding: 10px 16px !important;
  border-bottom: 2px dashed #E5E5EA !important;
}

.vc-weekday {
  color: #6E6E73 !important;
  font-weight: 600 !important;
  font-size: 0.75rem !important;
}

/* ==========================================
   DAYS GRID
   ========================================== */
.vc-weeks {
  padding: 10px 16px 16px !important;
}

.vc-day-content {
  color: #1D1D1F !important;
  font-weight: 500 !important;
  width: 36px !important;
  height: 36px !important;
  border-radius: 8px !important;
}

.vc-day-content:hover {
  background: #F0F0F5 !important;
}

.vc-day.is-today .vc-day-content {
  border: 2px solid #1D1D1F !important;
  font-weight: 700 !important;
}

/* Selected highlight - Yellow */
.vc-highlight {
  background: #FFDE59 !important;
  border-radius: 8px !important;
}

.vc-highlight-content-solid {
  background: #FFDE59 !important;
  color: #1D1D1F !important;
}

/* ==========================================
   TIME PICKER
   ========================================== */
.vc-time-picker {
  background: #F5F5F7 !important;
  border-top: 2px solid #E5E5EA !important;
  padding: 12px 16px !important;
  display: flex !important;
  justify-content: center !important;
}

.vc-time-select-group {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
}

/* Clock icon - FORCE BLACK STROKE */
.vc-time-select-group svg,
.vc-time-select-group svg path,
.vc-time-select-group svg circle,
.vc-time-select-group svg line {
  stroke: #1D1D1F !important;
  color: #1D1D1F !important;
}

/* Time colon */
.vc-time-colon {
  color: #1D1D1F !important;
  font-weight: 700 !important;
  font-size: 1.1rem !important;
}

/* Time selects - Hours and Minutes - FIX: proper height and padding */
.vc-time-select-hours,
.vc-time-select-minutes {
  color: #1D1D1F !important;
  background: #FFFFFF !important;
  border: 2px solid #1D1D1F !important;
  border-radius: 8px !important;
  font-weight: 700 !important;
  padding: 6px 8px !important;
  min-width: 60px !important;
  width: 60px !important;
  height: auto !important;
  min-height: 36px !important;
  font-size: 14px !important;
  line-height: 1.4 !important;
  text-align: center !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  box-sizing: border-box !important;
}

/* AM/PM select */
.vc-time-picker .vc-base-select {
  min-width: 55px !important;
}

.vc-time-picker .vc-base-select select {
  color: #1D1D1F !important;
  background: #FFFFFF !important;
  border: 2px solid #1D1D1F !important;
  border-radius: 8px !important;
  font-weight: 700 !important;
  padding: 6px 8px !important;
  min-width: 55px !important;
  width: 55px !important;
  height: auto !important;
  min-height: 36px !important;
  font-size: 14px !important;
  line-height: 1.4 !important;
  text-align: center !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  box-sizing: border-box !important;
}

/* Select focus state */
.vc-time-select-hours:focus,
.vc-time-select-minutes:focus,
.vc-time-picker .vc-base-select select:focus {
  outline: none !important;
  box-shadow: 0 0 0 2px #7C3AED !important;
}
</style>
