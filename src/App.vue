<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TimeOfDay } from './types'
import type { OutputFormat } from './composables/useFormatter'
import { useAvailability } from './composables/useAvailability'
import { useClipboard } from './composables/useClipboard'
import { formatAvailability, formatGrid, formatEmoji, formatChat } from './composables/useFormatter'
import DayRow from './components/DayRow.vue'

const { days, toggleSlot, getSlot, clearAll, hasSelections } = useAvailability()
const { copied, error, copyText } = useClipboard()

const outputFormat = ref<OutputFormat>('grid')

const formattedText = computed(() => {
  switch (outputFormat.value) {
    case 'grid': return formatGrid(days.value)
    case 'emoji': return formatEmoji(days.value)
    case 'chat': return formatChat(days.value)
    default: return formatAvailability(days.value)
  }
})

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

    <footer class="footer">
      <div v-if="canCopy" class="format-toggle">
        <button
          class="toggle-btn"
          :class="{ 'toggle-btn--active': outputFormat === 'list' }"
          @click="outputFormat = 'list'"
        >List</button>
        <button
          class="toggle-btn"
          :class="{ 'toggle-btn--active': outputFormat === 'grid' }"
          @click="outputFormat = 'grid'"
        >Grid</button>
        <button
          class="toggle-btn"
          :class="{ 'toggle-btn--active': outputFormat === 'emoji' }"
          @click="outputFormat = 'emoji'"
        >Emoji</button>
        <button
          class="toggle-btn"
          :class="{ 'toggle-btn--active': outputFormat === 'chat' }"
          @click="outputFormat = 'chat'"
        >Chat</button>
      </div>
      <div v-if="formattedText" class="preview">
        <pre class="preview__text">{{ formattedText }}</pre>
      </div>
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
  padding-bottom: 220px;
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

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: var(--bg-color);
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  z-index: 10;
}

.format-toggle {
  display: flex;
  gap: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.toggle-btn {
  padding: 6px 16px;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.toggle-btn--active {
  background: var(--text-primary);
  color: var(--bg-color);
}

.preview {
  width: 100%;
  max-width: 480px;
  padding: 10px 14px;
  background: var(--today-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  max-height: 120px;
  overflow-y: auto;
}

.preview__text {
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.75rem;
  line-height: 1.4;
  white-space: pre;
  color: var(--text-primary);
  margin: 0;
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
