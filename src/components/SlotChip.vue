<script setup lang="ts">
import type { Status } from '../types'

defineProps<{
  label: string
  status: Status | null
}>()

defineEmits<{
  toggle: []
}>()

function statusClass(status: Status | null): string {
  if (!status) return ''
  return `chip--${status}`
}
</script>

<template>
  <button
    class="chip"
    :class="[statusClass(status), { 'chip--active': status }]"
    @click="$emit('toggle')"
  >
    <span class="chip__label">{{ label }}</span>
    <span class="chip__status" :class="{ 'chip__status--visible': status === 'if-need-be' }">~</span>
  </button>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 20px;
  border: 2px solid var(--border-color, #e0e0e0);
  background: var(--bg-color, #fff);
  color: var(--text-muted, #888);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  min-width: 44px;
  min-height: 44px;
  justify-content: center;
}

.chip:hover {
  border-color: var(--text-muted, #aaa);
}

.chip--active {
  color: #fff;
  border-color: transparent;
}

.chip--yes {
  background: var(--color-yes, #22c55e);
  border-color: var(--color-yes, #22c55e);
}

.chip--if-need-be {
  background: var(--color-ifneedbe, #f59e0b);
  border-color: var(--color-ifneedbe, #f59e0b);
}

.chip__status {
  font-weight: 700;
  font-size: 0.9rem;
  visibility: hidden;
}

.chip__status--visible {
  visibility: visible;
}
</style>
