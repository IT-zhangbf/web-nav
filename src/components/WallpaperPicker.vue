<template>
  <Teleport to="body">
    <div v-if="visible" class="wp-overlay" @click.self="close"></div>
    <div v-if="visible" class="wallpaper-picker">
      <h3>选择壁纸</h3>
      <div class="wp-grid">
        <div
          v-for="(wp, i) in wallpapers"
          :key="i"
          class="wp-option"
          :class="{ active: activeIndex === i && !hasCustom }"
          :style="{ background: wp.bg || '#f1f5f9' }"
          @click="selectWallpaper(i)"
        ></div>
      </div>
      <div class="wp-upload" @click="triggerUpload">
        + 上传自定义图片
        <input type="file" accept="image/*" ref="fileInput" style="display:none" @change="onFileChange">
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useWallpaper } from '../composables/useWallpaper'

const props = defineProps({
  visible: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

const { wallpapers, activeIndex, hasCustom, selectWallpaper, uploadCustomWallpaper } = useWallpaper()
const fileInput = ref(null)

function close() { emit('close') }
function triggerUpload() { fileInput.value?.click() }

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    uploadCustomWallpaper(ev.target.result)
    close()
  }
  reader.readAsDataURL(file)
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.visible) close()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.wallpaper-picker {
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-glass-strong);
  backdrop-filter: blur(var(--glass-blur-strong)) saturate(1.6);
  -webkit-backdrop-filter: blur(var(--glass-blur-strong)) saturate(1.6);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: var(--shadow-lg), var(--shadow-glow);
  z-index: 300;
  width: 340px;
  border: 1px solid var(--border-glass);
}

.wallpaper-picker h3 {
  font-size: 0.95rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-weight: 600;
}

.wp-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.625rem;
}

.wp-option {
  aspect-ratio: 16/9;
  border-radius: var(--radius-sm);
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.25s ease;
  background-size: cover;
  background-position: center;
}

.wp-option:hover { border-color: var(--primary-light); transform: scale(1.03); }
.wp-option.active { border-color: var(--primary); box-shadow: var(--shadow-glow); }

.wp-upload {
  margin-top: 1rem;
  padding: 0.6rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  text-align: center;
  font-size: 0.78rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.25s ease;
}

.wp-upload:hover {
  background: var(--bg-glass);
  border-color: var(--primary-light);
  color: var(--primary);
}

.wp-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.25);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 299;
}
</style>
