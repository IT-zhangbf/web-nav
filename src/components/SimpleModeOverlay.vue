<template>
  <div class="simple-overlay" @click.self="$emit('close')">
    <div class="simple-time">{{ time }}</div>
    <div class="simple-date">{{ dateStr }}</div>
    <div class="simple-search-wrapper" @click.stop>
      <div class="simple-search-box">
        <input
          type="text"
          class="simple-search-input"
          ref="simpleInput"
          v-model="searchText"
          placeholder="搜索..."
          @keydown.enter="doSearch"
        />
        <button class="simple-search-btn" @click="doSearch">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { searchEngines } from '../utils/searchEngines'
import { useSearchHistory } from '../composables/useSearchHistory'

defineEmits(['close'])

const { show: showToast } = inject('toast')
const searchText = ref('')
const time = ref('')
const dateStr = ref('')
const simpleInput = ref(null)
const { add: addHistory } = useSearchHistory()
let timer = null

function updateClock() {
  const now = new Date()
  time.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  dateStr.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  })
}

function doSearch() {
  const kw = searchText.value.trim()
  if (!kw) return
  addHistory(kw)
  const engine = localStorage.getItem('searchEngine') || 'baidu'
  const url = searchEngines[engine]
  if (url) {
    window.open(url + encodeURIComponent(kw), '_blank')
  }
}

onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
  setTimeout(() => simpleInput.value?.focus(), 400)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.simple-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.4rem;
  min-height: 100vh;
  padding: 8vh 1.25rem 18vh;
  background: var(--gradient-bg);
  animation: simpleFadeIn 0.6s ease;
}

.simple-time {
  font-size: clamp(3rem, 7vw, 6rem);
  font-weight: 250;
  letter-spacing: 0.06em;
  background: linear-gradient(135deg, var(--text-primary) 30%, var(--primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  cursor: pointer;
  transition: opacity 0.3s;
  user-select: none;
}

.simple-time:hover { opacity: 0.7; }

.simple-date {
  font-size: clamp(0.9rem, 1.6vw, 1.15rem);
  color: var(--text-secondary);
  letter-spacing: 0.1em;
  margin-bottom: 2.25rem;
  cursor: pointer;
  transition: opacity 0.3s;
  font-weight: 400;
}

.simple-date:hover { opacity: 0.7; }

.simple-search-wrapper {
  width: min(540px, 85vw);
}

.simple-search-box {
  display: flex;
  align-items: center;
  background: var(--bg-glass-strong);
  backdrop-filter: blur(20px) saturate(1.5);
  -webkit-backdrop-filter: blur(20px) saturate(1.5);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-full);
  padding: 0.75rem 0.75rem 0.75rem 1.5rem;
  transition: all 0.35s ease;
  box-shadow: var(--shadow-md), 0 0 30px rgba(99, 102, 241, 0.06);
}

.simple-search-box:focus-within {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px var(--primary-glow), var(--shadow-lg), 0 0 40px rgba(99, 102, 241, 0.1);
  background: var(--bg-glass-strong);
  transform: scale(1.01);
}

.simple-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1.05rem;
  background: transparent;
  color: var(--text-primary);
}

.simple-search-input::placeholder { color: var(--text-muted); }

.simple-search-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  color: #fff;
  flex-shrink: 0;
  transition: all 0.25s ease;
  box-shadow: var(--shadow-sm);
}

.simple-search-btn:hover {
  transform: scale(1.08);
  box-shadow: var(--shadow-glow);
}

@keyframes simpleFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
