<template>
  <div
    class="category-section"
    :class="{ dragging: isDragging }"
    :draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
  >
    <div class="cat-header">
      <span class="cat-drag-handle">☰</span>
      <div class="cat-icon">{{ icon }}</div>
      <h2 class="cat-title">{{ category.category }}</h2>
      <span class="cat-count">{{ category.links.length }}</span>
    </div>
    <div class="cards-grid">
      <a
        v-for="(link, li) in category.links"
        :key="link.url"
        class="link-card"
        :href="link.url"
        target="_blank"
        rel="noopener"
        :style="{ animationDelay: li * 0.03 + 's' }"
        @contextmenu.prevent="showContextMenu($event, link)"
      >
        <div class="link-icon">
          <img
            :src="iconUrl(link.url)"
            loading="lazy"
            @error="onIconError($event, link.url)"
            alt=""
          >
        </div>
        <div class="link-info">
          <div class="link-name">{{ link.name }}</div>
          <div class="link-desc">{{ link.desc || getDomain(link.url) }}</div>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLinks } from '../composables/useLinks'

const props = defineProps({
  category: { type: Object, required: true },
  index: { type: Number, required: true }
})

const emit = defineEmits(['move'])
const { getDomain } = useLinks()

const isDragging = ref(false)
const icon = computed(() => {
  const icons = {
    'AI 工具': '🤖', '代码助手': '💻', '实用工具': '🔧', '学习资源': '📚',
    '视频平台': '🎬', '直播平台': '📺', '动漫视频': '🎨', '小说阅读': '📖',
    '有声资源': '🎧', '典藏资源': '💎', '娱乐休闲': '🎮', '云服务': '☁️',
    '电商购物': '🛒'
  }
  return icons[props.category.category] || '📁'
})

function iconUrl(url) {
  const domain = getDomain(url)
  const map = {
    'www.融蜡.cn': 'www__rongla_cn',
    'www东方财富.com': 'www__eastmoney_com'
  }
  return `./icons/${map[domain] || domain}.png`
}

function onIconError(e, url) {
  const img = e.target
  const retry = parseInt(img.dataset.retry || '0')
  if (retry === 0) {
    img.dataset.retry = '1'
    const domain = getDomain(url)
    img.src = `./icons/${domain}.svg`
  } else if (retry === 1) {
    img.dataset.retry = '2'
    img.src = './icons/default.svg'
  } else {
    img.parentElement.innerHTML = '🔗'
  }
}

function showContextMenu(e, link) {
  if (window.__contextMenu) {
    window.__contextMenu.open(e, link)
  }
}

function onDragStart(e) {
  isDragging.value = true
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', String(props.index))
}

function onDragEnd() {
  isDragging.value = false
  document.querySelectorAll('.category-section').forEach(el => el.classList.remove('drag-over'))
}

function onDragOver(e) {
  e.currentTarget.classList.add('drag-over')
}

function onDrop(e) {
  e.currentTarget.classList.remove('drag-over')
  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
  if (!isNaN(fromIndex) && fromIndex !== props.index) {
    emit('move', { fromIndex, toIndex: props.index })
  }
  isDragging.value = false
}
</script>

<style scoped>
.category-section {
  margin-bottom: 2.75rem;
  transition: opacity 0.3s;
}

.category-section.dragging { opacity: 0.5; }

.cat-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.875rem;
  cursor: grab;
}

.cat-header:active { cursor: grabbing; }

.cat-drag-handle {
  opacity: 0;
  color: var(--text-muted);
  font-size: 0.85rem;
  transition: opacity 0.2s;
  cursor: grab;
}

.cat-header:hover .cat-drag-handle { opacity: 1; }

.cat-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.cat-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.cat-count {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg-glass);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 0.875rem;
}

.link-card {
  background: var(--bg-glass);
  backdrop-filter: blur(14px) saturate(1.4);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 1rem 1.125rem;
  display: flex;
  align-items: center;
  gap: 0.9375rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.3s backwards;
}

.link-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.link-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
  border-color: rgba(99, 102, 241, 0.3);
  background: var(--bg-glass-strong);
}

.link-card:hover::before { opacity: 1; }

.link-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.15rem;
  overflow: hidden;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}

.link-card:hover .link-icon {
  box-shadow: 0 0 12px var(--primary-glow);
  border-color: rgba(99, 102, 241, 0.2);
}

.link-icon img { width: 24px; height: 24px; border-radius: 4px; }

.link-info { flex: 1; min-width: 0; }

.link-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
}

.link-card:hover .link-name { color: var(--primary); }

.link-desc {
  font-size: 0.72rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 3px;
}

@media (max-width: 768px) {
  .cards-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem; }
}

@media (max-width: 480px) {
  .cards-grid { grid-template-columns: 1fr 1fr; gap: 0.625rem; }
  .link-card { padding: 0.75rem; gap: 0.625rem; }
  .link-icon { width: 38px; height: 38px; }
  .link-icon img { width: 20px; height: 20px; }
  .link-name { font-size: 0.85rem; }
  .link-desc { display: none; }
}
</style>
