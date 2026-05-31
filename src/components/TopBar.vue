<template>
  <header class="top-bar">
    <div class="top-bar-inner">
      <div class="logo" @click="$emit('toggle-simple')">个人导航</div>

      <div class="search-wrapper">
        <div class="search-engine-select">
          <button
            v-for="engine in engines"
            :key="engine.key"
            class="engine-btn"
            :class="{ active: activeEngine === engine.key }"
            @click="activeEngine = engine.key"
          >{{ engine.label }}</button>
        </div>
        <div class="search-box" style="position: relative;">
          <input
            type="text"
            class="search-input"
            v-model="searchText"
            placeholder="搜索网站或输入关键词..."
            @focus="showHistory = true"
            @input="onSearchInput"
            @keydown.enter="doSearch"
            ref="searchInputRef"
          />
          <button class="search-btn" @click="doSearch">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <div class="search-history" :class="{ show: showHistory && !searchText.trim() }" ref="historyRef">
            <div class="search-history-header">
              <span class="search-history-title">搜索历史</span>
              <span class="search-history-clear" @click="clearHistory">清空</span>
            </div>
            <div id="searchHistoryList">
              <div
                v-for="item in historyList"
                :key="item.time"
                class="search-history-item"
                @click="selectHistory(item)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span class="search-history-text">{{ item.keyword }}</span>
                <span class="search-history-time">{{ formatTime(item.time) }}</span>
              </div>
              <div
                v-if="historyList.length === 0"
                style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.82rem;"
              >暂无搜索记录</div>
            </div>
          </div>
        </div>
      </div>

      <div class="top-actions">
        <button class="icon-btn" @click="$emit('toggle-simple')" title="简洁模式">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"/>
          </svg>
        </button>
        <button class="icon-btn" id="wallpaperBtn" title="切换壁纸" @click="showWpPicker = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
          </svg>
        </button>
        <button class="icon-btn" @click="toggleTheme" title="切换主题">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, inject, watch, onMounted, onUnmounted } from 'vue'
import { useSearchHistory } from '../composables/useSearchHistory'
import { searchEngines } from '../utils/searchEngines'

const emit = defineEmits(['toggle-simple'])
const { theme, toggleTheme } = inject('theme')
const { keyword, applyFilter } = inject('links')
const { show: showToast } = inject('toast')
const { showWpPicker } = inject('wallpaperPicker')

const engines = Object.entries(searchEngines).map(([key, url]) => ({ key, label: key.charAt(0).toUpperCase() + key.slice(1) }))
engines[0].label = '百度'
engines[1].label = 'Google'
engines[2].label = '必应'
engines[3].label = '搜狗'
engines[4].label = 'Duck'
engines.splice(5, 0, { key: 'local', label: '本站' })

const activeEngine = ref(localStorage.getItem('searchEngine') || 'baidu')
const searchText = ref('')
const showHistory = ref(false)
const searchInputRef = ref(null)
const historyRef = ref(null)
const { historyList, add: addHistory, clear: clearHistoryList } = useSearchHistory()

watch(activeEngine, (val) => {
  localStorage.setItem('searchEngine', val)
})

function formatTime(ts) {
  const date = new Date(ts)
  return date.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function selectHistory(item) {
  searchText.value = item.keyword
  showHistory.value = false
  keyword.value = item.keyword
  applyFilter()
}

function onSearchInput() {
  if (searchText.value.trim().length > 0) {
    showHistory.value = false
  } else {
    showHistory.value = true
  }
  if (activeEngine.value === 'local') {
    keyword.value = searchText.value
    applyFilter()
  }
}

function doSearch() {
  const kw = searchText.value.trim()
  if (!kw) return
  addHistory(kw)
  if (activeEngine.value === 'local') {
    keyword.value = kw
    applyFilter()
  } else {
    const url = searchEngines[activeEngine.value]
    if (url) {
      window.open(url + encodeURIComponent(kw), '_blank')
    }
  }
}

function clearHistory() {
  clearHistoryList()
}

function onClickOutside(e) {
  if (historyRef.value && !historyRef.value.contains(e.target) && !e.target.closest('.search-input')) {
    showHistory.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-glass-strong);
  backdrop-filter: blur(var(--glass-blur-strong)) saturate(1.8);
  -webkit-backdrop-filter: blur(var(--glass-blur-strong)) saturate(1.8);
  border-bottom: 1px solid var(--border-glass);
  box-shadow: 0 1px 0 var(--border-subtle), var(--shadow-sm);
  transition: background 0.3s, box-shadow 0.3s;
}

.top-bar-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
  user-select: none;
  letter-spacing: -0.02em;
  cursor: pointer;
}

.search-wrapper {
  flex: 1;
  max-width: 580px;
  margin: 0 auto;
}

.search-engine-select {
  display: flex;
  gap: 0.3rem;
  margin-bottom: 0.4rem;
  flex-wrap: wrap;
}

.engine-btn {
  padding: 0.2rem 0.7rem;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 500;
  background: var(--bg-surface);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  transition: all 0.25s ease;
}

.engine-btn:hover {
  background: var(--bg-glass);
  border-color: var(--primary-light);
  color: var(--primary);
}

.engine-btn.active {
  background: var(--gradient-primary);
  color: #fff;
  border-color: transparent;
  box-shadow: var(--shadow-glow);
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  padding: 0.3rem 0.3rem 0.3rem 1rem;
  transition: all 0.3s ease;
}

.search-box:focus-within {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px var(--primary-glow), var(--shadow-md);
  background: var(--bg-glass-strong);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.9rem;
  background: transparent;
  color: var(--text-primary);
}

.search-input::placeholder { color: var(--text-muted); }

.search-btn {
  width: 34px;
  height: 34px;
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

.search-btn:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-glow);
}

.top-actions { display: flex; gap: 0.375rem; }

.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  transition: all 0.25s ease;
}

.icon-btn:hover {
  background: var(--bg-glass);
  color: var(--primary);
  border-color: var(--primary-light);
  box-shadow: var(--shadow-sm);
}

.search-history {
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--bg-glass-strong);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.6);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.6);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  max-height: 280px;
  overflow-y: auto;
}

.search-history.show { display: block; }

.search-history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.875rem;
  border-bottom: 1px solid var(--border);
}

.search-history-title {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.search-history-clear {
  font-size: 0.68rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s;
}

.search-history-clear:hover { color: #ef4444; }

.search-history-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.search-history-item:hover { background: var(--bg-surface); }

.search-history-item svg {
  width: 14px; height: 14px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-history-text {
  flex: 1;
  font-size: 0.85rem;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-history-time {
  font-size: 0.68rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .top-bar-inner {
    padding: 0.625rem 1rem;
    gap: 0.625rem;
    flex-wrap: wrap;
  }
  .logo { font-size: 1.1rem; }
  .search-wrapper { order: 3; flex-basis: 100%; max-width: none; }
  .top-actions { gap: 0.375rem; }
}
</style>
