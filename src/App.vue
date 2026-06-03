<script setup lang="ts">
import { computed } from 'vue'
import type { TimeOfDay } from './types'
import { useAvailability } from './composables/useAvailability'
import { useClipboard } from './composables/useClipboard'
import { formatAvailability } from './composables/useFormatter'
import DayRow from './components/DayRow.vue'

const { days, toggleSlot, getSlot, clearAll, hasSelections } = useAvailability()
const { copied, error, copyText } = useClipboard()

const formattedText = computed(() => formatAvailability(days.value))
const canCopy = computed(() => hasSelections())

function handleCopy() {
  if (formattedText.value) {
    copyText(formattedText.value)
  }
}
</script>

<template>
  <div class="app">
    <header class="header">
      <h1 class="header__title">My Availability</h1>
      <button
        v-if="canCopy"
        class="btn btn--ghost"
        @click="clearAll"
      >
        Start fresh
      </button>
    </header>

    <main class="day-list">
      <DayRow
        v-for="day in days"
        :key="day.date"
        :date="day.date"
        :get-slot="getSlot"
        @toggle="(date: string, tod: TimeOfDay) => toggleSlot(date, tod)"
      />
    </main>

    <div v-if="formattedText" class="preview">
      <pre class="preview__text">{{ formattedText }}</pre>
    </div>

    <footer class="footer">
      <button
        class="btn btn--primary"
        :disabled="!canCopy"
        @click="handleCopy"
      >
        <template v-if="copied">Copied!</template>
        <template v-else-if="error">Tap to select text</template>
        <template v-else>Copy</template>
      </button>
    </footer>
  </div>
</template>

<style>
:root {
  --text-primary: #1a1a1a;
  --text-muted: #888;
  --bg-color: #fff;
  --border-color: #e8e8e8;
  --today-bg: rgba(59, 130, 246, 0.04);
  --color-yes: #22c55e;
  --color-ifneedbe: #f59e0b;
  --color-maybe: #3b82f6;
}

@media (prefers-color-scheme: dark) {
  :root {
    --text-primary: #e8e8e8;
    --text-muted: #888;
    --bg-color: #1a1a1a;
    --border-color: #333;
    --today-bg: rgba(59, 130, 246, 0.08);
  }
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-color);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
}
</style>

<style scoped>
.app {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;
  padding-bottom: 100px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-color);
}

.header__title {
  font-size: 1.4rem;
  font-weight: 700;
}

.day-list {
  display: flex;
  flex-direction: column;
}

.preview {
  margin-top: 24px;
  padding: 16px;
  background: var(--today-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.preview__text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 0.85rem;
  line-height: 1.6;
  white-space: pre-wrap;
  color: var(--text-primary);
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: var(--bg-color);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: center;
}

.btn {
  padding: 12px 32px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.btn--primary {
  background: var(--color-yes);
  color: #fff;
  width: 100%;
  max-width: 480px;
  min-height: 48px;
}

.btn--primary:hover:not(:disabled) {
  filter: brightness(0.9);
}

.btn--primary:disabled {
  background: var(--border-color);
  color: var(--text-muted);
  cursor: not-allowed;
}

.btn--ghost {
  background: transparent;
  color: var(--text-muted);
  font-size: 0.85rem;
  padding: 8px 12px;
}

.btn--ghost:hover {
  color: var(--text-primary);
}
</style>
