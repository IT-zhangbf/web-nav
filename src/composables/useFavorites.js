import { ref } from 'vue'

const favorites = ref([])

export function useFavorites() {
  function load() {
    try {
      favorites.value = JSON.parse(localStorage.getItem('favorites')) || []
    } catch {
      favorites.value = []
    }
  }

  function add(link) {
    const exists = favorites.value.some(fav => fav.url === link.url)
    if (exists) return false
    favorites.value.unshift(link)
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
    return true
  }

  load()

  return { favorites, add }
}
