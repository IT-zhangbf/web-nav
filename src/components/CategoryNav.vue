<template>
  <nav class="category-nav">
    <button
      class="cat-tab"
      :class="{ active: currentCategory === 'all' }"
      @click="selectCategory('all')"
    >全部</button>
    <button
      v-for="cat in allData"
      :key="cat.category"
      class="cat-tab"
      :class="{ active: currentCategory === cat.category }"
      @click="selectCategory(cat.category)"
    >{{ getCategoryIcon(cat.category) }} {{ cat.category }}</button>
  </nav>
</template>

<script setup>
import { inject } from 'vue'

const { allData, currentCategory, keyword, applyFilter, getCategoryIcon } = inject('links')

function selectCategory(cat) {
  currentCategory.value = cat
  applyFilter()
}
</script>

<style scoped>
.category-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.cat-tab {
  padding: 0.4rem 0.9rem;
  border-radius: var(--radius-full);
  background: var(--bg-glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 500;
  border: 1px solid var(--border);
  transition: all 0.25s ease;
  cursor: pointer;
  white-space: nowrap;
}

.cat-tab:hover {
  background: var(--bg-glass-strong);
  border-color: var(--primary-light);
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.cat-tab.active {
  background: var(--gradient-primary);
  color: #fff;
  border-color: transparent;
  box-shadow: var(--shadow-glow);
}
</style>
