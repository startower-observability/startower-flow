<script setup lang="ts">
import { computed, ref } from 'vue'
import { cn } from '@/lib/utils'

interface SelectProps {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  options: { value: string; label: string }[]
  class?: string
}

const props = withDefaults(defineProps<SelectProps>(), {
  modelValue: '',
  placeholder: 'Select an option',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue)
  return selected?.label || props.placeholder
})

const triggerClass = computed(() =>
  cn(
    'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    props.class
  )
)

function toggleDropdown() {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

function selectOption(value: string) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function closeDropdown() {
  isOpen.value = false
}
</script>

<template>
  <div class="relative" @blur="closeDropdown">
    <button
      type="button"
      :class="triggerClass"
      :disabled="disabled"
      @click="toggleDropdown"
    >
      <span :class="{ 'text-muted-foreground': !modelValue }">
        {{ selectedLabel }}
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="ml-2 h-4 w-4 opacity-50"
        :class="{ 'rotate-180': isOpen }"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
    
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md"
      >
        <div class="p-1">
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            class="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
            :class="{ 'bg-accent': modelValue === option.value }"
            @click="selectOption(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
