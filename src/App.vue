<template>
  <div :class="{ 'has-wallpaper': wallpaperActive, 'simple-mode': simpleMode }">
    <TopBar @toggle-simple="toggleSimpleMode" />
    <div class="app-layout">
      <SidePanel v-show="!simpleMode" />
      <main class="main-content">
        <CategoryNav v-show="!simpleMode" />
        <div v-if="loading" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
          <p>加载中...</p>
        </div>
        <div v-else-if="error" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
            <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p>加载数据失败：{{ error }}</p>
        </div>
        <CategorySection
          v-for="(cat, ci) in filteredData"
          :key="cat.category"
          :category="cat"
          :index="ci"
          @move="onMoveCategory"
        />
        <div v-if="!loading && !error && filteredData.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <p>没有找到相关网站</p>
        </div>
      </main>
    </div>
    <footer class="footer" v-show="!simpleMode">个人导航 &mdash; 快速访问常用网站</footer>

    <WallpaperPicker :visible="showWpPicker" @close="showWpPicker = false" />
    <ContextMenu />
    <SimpleModeOverlay v-if="simpleMode" @close="toggleSimpleMode" />
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide, watch } from 'vue'
import { useTheme } from './composables/useTheme'
import { useLinks } from './composables/useLinks'
import { useWallpaper } from './composables/useWallpaper'
import { useToast } from './composables/useToast'
import { fetchHolidays } from './utils/calendar'
import TopBar from './components/TopBar.vue'
import SidePanel from './components/SidePanel.vue'
import CategoryNav from './components/CategoryNav.vue'
import CategorySection from './components/CategorySection.vue'
import WallpaperPicker from './components/WallpaperPicker.vue'
import ContextMenu from './components/ContextMenu.vue'
import SimpleModeOverlay from './components/SimpleModeOverlay.vue'
import ToastContainer from './components/ToastContainer.vue'

const { theme, initTheme, toggleTheme } = useTheme()
const { allData, currentCategory, keyword, loading, error, filteredData, loadLinks, applyFilter, moveCategory, getCategoryIcon } = useLinks()
const { wallpapers, activeIndex, hasCustom: wallpaperActive, restoreWallpaper, selectWallpaper, uploadCustomWallpaper } = useWallpaper()
const { messages, show: showToast } = useToast()

const simpleMode = ref(false)
const showWpPicker = ref(false)

provide('theme', { theme, toggleTheme })
provide('links', { allData, currentCategory, keyword, filteredData, applyFilter, getCategoryIcon })
provide('wallpaper', { wallpapers, activeIndex, wallpaperActive, selectWallpaper, uploadCustomWallpaper })
provide('toast', { show: showToast })
provide('simpleMode', { simpleMode })
provide('wallpaperPicker', { showWpPicker })

function toggleSimpleMode() {
  simpleMode.value = !simpleMode.value
  localStorage.setItem('simpleMode', String(simpleMode.value))
}

function onMoveCategory({ fromIndex, toIndex }) {
  moveCategory(fromIndex, toIndex)
}

function loadSimpleMode() {
  if (localStorage.getItem('simpleMode') === 'true') {
    simpleMode.value = true
  }
}

watch(simpleMode, (value) => {
  document.body.classList.toggle('simple-mode', value)
}, { immediate: true })

onMounted(async () => {
  initTheme()
  loadSimpleMode()
  await restoreWallpaper()
  await loadLinks()
  applyFilter()
  const year = new Date().getFullYear()
  const ok = await fetchHolidays(year)
  if (ok) {
    // trigger calendar re-render via event
    window.dispatchEvent(new CustomEvent('holidays-updated'))
  }
})

onUnmounted(() => {
  document.body.classList.remove('simple-mode')
})
</script>

<style scoped>
.app-layout {
  display: flex;
  max-width: 1440px;
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  gap: 1.5rem;
  min-height: calc(100vh - 70px);
}

.main-content {
  flex: 1;
  min-width: 0;
}

@media (min-width: 1024px) {
  .main-content {
    margin-left: calc(270px + 1.5rem);
  }
}

@media (max-width: 1023px) {
  .app-layout {
    padding: 1rem;
  }
}

.footer {
  text-align: center;
  padding: 2rem 1.5rem;
  color: var(--text-muted);
  font-size: 0.78rem;
  max-width: 1440px;
  margin: 0 auto;
  letter-spacing: 0.02em;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.empty-state svg {
  margin-bottom: 0.75rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 0.9rem;
}
</style>
