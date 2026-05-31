<template>
  <Teleport to="body">
    <div
      v-for="msg in messages"
      :key="msg.id"
      class="toast"
    >{{ msg.message }}</div>
  </Teleport>
</template>

<script setup>
import { inject } from 'vue'

const { messages } = inject('toast')
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-glass-strong);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  color: var(--text-primary);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-lg);
  z-index: 9999;
  font-size: 0.85rem;
  border: 1px solid var(--border-glass);
  animation: toastIn 0.3s ease;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(1rem); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>
