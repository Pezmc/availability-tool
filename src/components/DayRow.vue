<script setup lang="ts">
import type { TimeOfDay, Status } from '../types'
import { parseLocalDate, formatCompactLabel, todayDateString } from '../utils/dates'
import SlotChip from './SlotChip.vue'

const props = defineProps<{
  date: string
  getSlot: (date: string, timeOfDay: TimeOfDay) => { status: Status } | undefined
}>()

defineEmits<{
  toggle: [date: string, timeOfDay: TimeOfDay]
}>()

const dateObj = parseLocalDate(props.date)
const label = formatCompactLabel(dateObj)
const isToday = props.date === todayDateString()

const slots: { key: TimeOfDay; label: string }[] = [
  { key: 'morning', label: 'Morning' },
  { key: 'afternoon', label: 'Afternoon' },
  { key: 'evening', label: 'Evening' },
]
</script>

<template>
  <div class="day-row" :class="{ 'day-row--today': isToday }">
    <div class="day-row__label">
      <span class="day-row__date">{{ label }}</span>
      <span v-if="isToday" class="day-row__today-badge">Today</span>
    </div>
    <div class="day-row__chips">
      <SlotChip
        v-for="slot in slots"
        :key="slot.key"
        :label="slot.label"
        :status="getSlot(date, slot.key)?.status ?? null"
        @toggle="$emit('toggle', date, slot.key)"
      />
    </div>
  </div>
</template>

<style scoped>
.day-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color, #f0f0f0);
}

@media (max-width: 440px) {
  .day-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}

.day-row--today {
  background: var(--today-bg, rgba(59, 130, 246, 0.04));
  border-radius: 8px;
  padding: 8px 12px;
  margin: 0 -12px;
}

.day-row__label {
  min-width: 110px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.day-row__date {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary, #1a1a1a);
}

.day-row__today-badge {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-maybe, #3b82f6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.day-row__chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
