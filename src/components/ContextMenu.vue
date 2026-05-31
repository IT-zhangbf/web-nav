<template>
  <Teleport to="body">
    <div v-if="visible" class="ctx-backdrop" @click="close" @contextmenu.prevent="close"></div>
    <div
      v-if="visible"
      class="ctx-menu"
      :style="{ top: pos.y + 'px', left: pos.x + 'px' }"
    >
      <button class="ctx-item" @click="openNewTab">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        新标签页打开
      </button>
      <button class="ctx-item" @click="copyLink">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        复制链接
      </button>
      <button class="ctx-item" @click="addFavorite">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        添加收藏
      </button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide, inject } from 'vue'

const { show: showToast } = inject('toast')

const visible = ref(false)
const pos = ref({ x: 0, y: 0 })
const currentLink = ref(null)

function open(event, link) {
  currentLink.value = link
  const x = Math.min(event.clientX, window.innerWidth - 180)
  const y = Math.min(event.clientY, window.innerHeight - 140)
  pos.value = { x, y }
  visible.value = true
}

function close() {
  visible.value = false
  currentLink.value = null
}

function openNewTab() {
  if (currentLink.value) {
    window.open(currentLink.value.url, '_blank', 'noopener,noreferrer')
  }
  close()
}

function copyLink() {
  if (currentLink.value) {
    navigator.clipboard.writeText(currentLink.value.url).then(() => {
      showToast('链接已复制')
    })
  }
  close()
}

function addFavorite() {
  if (!currentLink.value) return
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
  const exists = favorites.some(fav => fav.url === currentLink.value.url)
  if (exists) {
    showToast('该网站已在收藏夹中')
  } else {
    favorites.unshift(currentLink.value)
    localStorage.setItem('favorites', JSON.stringify(favorites))
    showToast('已添加到收藏夹')
  }
  close()
}

function onKeydown(e) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.__contextMenu = { open }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  delete window.__contextMenu
})
</script>

<style scoped>
.ctx-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.ctx-menu {
  position: fixed;
  z-index: 1000;
  min-width: 160px;
  background: var(--bg-glass-strong);
  backdrop-filter: blur(var(--glass-blur-strong)) saturate(1.6);
  -webkit-backdrop-filter: blur(var(--glass-blur-strong)) saturate(1.6);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 0.375rem;
  animation: ctxIn 0.15s ease;
}

.ctx-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  color: var(--text-primary);
  background: transparent;
  transition: all 0.15s ease;
}

.ctx-item:hover {
  background: var(--bg-surface);
  color: var(--primary);
}

@keyframes ctxIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
