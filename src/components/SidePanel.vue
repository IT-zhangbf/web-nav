<template>
  <aside class="side-panel">
    <div class="panel-scroll">
      <div class="widget">
        <div class="widget-title">时钟</div>
        <ClockWidget />
      </div>
      <div class="widget">
        <div class="widget-title">日历</div>
        <CalendarWidget />
      </div>
    </div>
  </aside>
</template>

<script setup>
import ClockWidget from './ClockWidget.vue'
import CalendarWidget from './CalendarWidget.vue'
</script>

<style scoped>
.side-panel {
  width: 270px;
  flex-shrink: 0;
  max-height: calc(100vh - 100px);
  overflow: hidden;
  border-radius: var(--radius-xl);
  background: var(--bg-glass);
  backdrop-filter: blur(var(--glass-blur-strong)) saturate(1.6);
  -webkit-backdrop-filter: blur(var(--glass-blur-strong)) saturate(1.6);
  border: 1px solid var(--border-glass);
  box-shadow: var(--shadow-md), inset 0 1px 0 rgba(255,255,255,0.3);
  transition: background 0.3s, box-shadow 0.3s;
}

.panel-scroll {
  padding: 0.875rem;
  overflow-y: auto;
  max-height: inherit;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.panel-scroll::-webkit-scrollbar { display: none; }

.widget {
  background: var(--bg-surface);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--radius-md);
  padding: 0.875rem;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  transition: all 0.25s ease;
}

.widget:hover {
  box-shadow: var(--shadow-md);
  border-color: rgba(99, 102, 241, 0.15);
}

.widget-title {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.625rem;
}

@media (min-width: 1024px) {
  .side-panel {
    position: fixed;
    top: var(--side-panel-viewport-top);
    left: max(1.5rem, calc((100vw - 1440px) / 2 + 1.5rem));
    z-index: 50;
    max-height: calc(100vh - var(--side-panel-viewport-top) - 1.25rem);
  }
}

@media (max-width: 1023px) {
  .side-panel {
    position: fixed;
    top: 0;
    left: -290px;
    width: 290px;
    height: 100vh;
    max-height: none;
    z-index: 200;
    border-radius: 0;
    transition: left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    padding-top: 0;
    backdrop-filter: blur(var(--glass-blur-strong)) saturate(1.6);
    -webkit-backdrop-filter: blur(var(--glass-blur-strong)) saturate(1.6);
    background: var(--bg-glass-strong);
    border-right: 1px solid var(--border-glass);
    box-shadow: var(--shadow-lg);
  }
}
</style>
