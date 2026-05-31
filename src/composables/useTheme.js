import { ref, watch } from 'vue'

const theme = ref('light')

export function useTheme() {
  function initTheme() {
    const saved = localStorage.getItem('themeMode')
    if (saved === 'dark' || (saved !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      theme.value = 'dark'
    } else {
      theme.value = 'light'
    }
    applyTheme()
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem('themeMode', theme.value)
    applyTheme()
  }

  watch(theme, applyTheme)

  return { theme, initTheme, toggleTheme }
}
