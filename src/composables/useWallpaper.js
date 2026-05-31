import { ref } from 'vue'

const DB_NAME = 'WebNavDB'
const DB_VERSION = 1
const STORE_NAME = 'wallpapers'

const wallpapers = [
  { name: '无', bg: '' },
  { name: '极光幻境', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' },
  { name: '深海蓝调', bg: 'linear-gradient(135deg, #0c3483 0%, #a2b6df 50%, #6b8cce 100%)' },
  { name: '暖阳落日', bg: 'linear-gradient(135deg, #f5af19 0%, #f12711 50%, #c62128 100%)' },
  { name: '薄荷清风', bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 50%, #a8e6cf 100%)' },
  { name: '樱花物语', bg: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 50%, #f8c3cd 100%)' },
  { name: '星空紫夜', bg: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }
]

const activeIndex = ref(0)
const hasCustom = ref(false)

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = (e) => reject(e.target.error)
  })
}

function saveWallpaperToDB(dataUrl) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(dataUrl, 'custom')
    tx.oncomplete = () => resolve()
    tx.onerror = (e) => reject(e.target.error)
  }))
}

function loadWallpaperFromDB() {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get('custom')
    req.onsuccess = () => resolve(req.result)
    req.onerror = (e) => reject(e.target.error)
  }))
}

function applyWallpaper(index) {
  const wp = wallpapers[index]
  if (!wp.bg) {
    document.body.classList.remove('has-wallpaper')
    document.body.style.removeProperty('--bg-wallpaper')
    document.body.style.background = ''
  } else if (wp.bg.startsWith('linear-gradient')) {
    document.body.classList.remove('has-wallpaper')
    document.body.style.background = wp.bg
    document.body.style.backgroundAttachment = 'fixed'
  } else {
    document.body.style.setProperty('--bg-wallpaper', wp.bg)
    document.body.classList.add('has-wallpaper')
  }
}

export function useWallpaper() {
  async function restoreWallpaper() {
    try {
      const dbUrl = await loadWallpaperFromDB()
      if (dbUrl) {
        document.body.style.setProperty('--bg-wallpaper', `url(${dbUrl})`)
        document.body.classList.add('has-wallpaper')
        hasCustom.value = true
        return
      }
    } catch {}
    const custom = localStorage.getItem('wallpaperCustom')
    if (custom) {
      document.body.style.setProperty('--bg-wallpaper', `url(${custom})`)
      document.body.classList.add('has-wallpaper')
      hasCustom.value = true
      return
    }
    const saved = localStorage.getItem('wallpaperIndex')
    if (saved !== null) {
      activeIndex.value = parseInt(saved)
      applyWallpaper(activeIndex.value)
    } else {
      activeIndex.value = 0
      applyWallpaper(0)
    }
  }

  function selectWallpaper(index) {
    activeIndex.value = index
    hasCustom.value = false
    applyWallpaper(index)
    localStorage.setItem('wallpaperIndex', String(index))
    localStorage.removeItem('wallpaperCustom')
    saveWallpaperToDB('').catch(() => {})
  }

  function uploadCustomWallpaper(dataUrl) {
    document.body.style.setProperty('--bg-wallpaper', `url(${dataUrl})`)
    document.body.classList.add('has-wallpaper')
    hasCustom.value = true
    saveWallpaperToDB(dataUrl).catch(() => {
      localStorage.setItem('wallpaperCustom', dataUrl)
    })
    localStorage.removeItem('wallpaperIndex')
  }

  return { wallpapers, activeIndex, hasCustom, restoreWallpaper, selectWallpaper, uploadCustomWallpaper }
}
