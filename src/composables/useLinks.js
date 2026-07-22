import { ref } from 'vue'
import { getCategoryIcon, getDomain, getIconName } from '../utils/icons'

const allData = ref([])
const currentCategory = ref('all')
const keyword = ref('')
const loading = ref(true)
const error = ref(null)

export function useLinks() {
  async function loadLinks() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`./links.json?v=${__APP_VERSION__}`, { cache: 'no-store' })
      const data = await res.json()
      allData.value = data.categories
      const savedOrder = localStorage.getItem('categoryOrder')
      if (savedOrder) {
        try {
          const order = JSON.parse(savedOrder)
          const orderMap = {}
          order.forEach((cat, idx) => orderMap[cat] = idx)
          allData.value.sort((a, b) => (orderMap[a.category] ?? 999) - (orderMap[b.category] ?? 999))
        } catch (e) {
          console.warn('Failed to apply category order:', e)
        }
      }
    } catch (e) {
      error.value = e.message || '加载数据失败'
    } finally {
      loading.value = false
    }
  }

  function saveCategoryOrder() {
    const order = allData.value.map(cat => cat.category)
    localStorage.setItem('categoryOrder', JSON.stringify(order))
  }

  const filteredData = ref([])

  function applyFilter() {
    const kw = keyword.value.toLowerCase().trim()
    let filtered = allData.value

    if (currentCategory.value !== 'all') {
      filtered = filtered.filter(c => c.category === currentCategory.value)
    }

    if (kw) {
      filtered = filtered.map(c => ({
        category: c.category,
        links: c.links.filter(l =>
          l.name.toLowerCase().includes(kw) ||
          (l.desc || '').toLowerCase().includes(kw)
        )
      })).filter(c => c.links.length > 0)
    }

    filteredData.value = filtered
  }

  function moveCategory(fromIndex, toIndex) {
    if (fromIndex === toIndex) return
    const item = allData.value.splice(fromIndex, 1)[0]
    allData.value.splice(toIndex, 0, item)
    saveCategoryOrder()
    applyFilter()
  }

  return {
    allData, currentCategory, keyword, loading, error,
    filteredData, loadLinks, applyFilter, moveCategory,
    getDomain, getIconName, getCategoryIcon
  }
}
