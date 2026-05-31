import { ref } from 'vue'

const MAX_HISTORY = 20
const historyList = ref([])

export function useSearchHistory() {
  function load() {
    try {
      historyList.value = JSON.parse(localStorage.getItem('searchHistory')) || []
    } catch {
      historyList.value = []
    }
  }

  function save() {
    localStorage.setItem('searchHistory', JSON.stringify(historyList.value))
  }

  function add(keyword) {
    if (!keyword || keyword.trim().length === 0) return
    historyList.value = historyList.value.filter(item => item.keyword !== keyword)
    historyList.value.unshift({ keyword, time: Date.now() })
    if (historyList.value.length > MAX_HISTORY) {
      historyList.value = historyList.value.slice(0, MAX_HISTORY)
    }
    save()
  }

  function clear() {
    historyList.value = []
    localStorage.removeItem('searchHistory')
  }

  load()

  return { historyList, add, clear, load }
}
