<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value?: number
  max?: number
  class?: string
  indicatorClass?: string
}

const props = withDefaults(defineProps<ProgressProps>(), {
  value: 0,
  max: 100,
})

const percentage = computed(() => {
  return Math.min(Math.max((props.value / props.max) * 100, 0), 100)
})

const progressClass = computed(() =>
  cn(
    'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
    props.class
  )
)

const indicatorClass = computed(() =>
  cn(
    'h-full w-full flex-1 bg-primary transition-all duration-300',
    props.indicatorClass
  )
)
</script>

<template>
  <div :class="progressClass">
    <div
      :class="indicatorClass"
      :style="{ transform: `translateX(-${100 - percentage}%)` }"
    />
  </div>
</template>
