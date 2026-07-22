// 分类图标与域名图标的统一映射，供 useLinks 和 CategorySection 等共用

// 各分类对应的 emoji 图标
export const categoryIcons = {
  'AI 工具': '🤖', '代码助手': '💻', '实用工具': '🔧', '学习资源': '📚',
  '视频平台': '🎬', '直播平台': '📺', '动漫视频': '🎨', '小说阅读': '📖',
  '有声资源': '🎧', '典藏资源': '💎', '娱乐休闲': '🎮', '云服务': '☁️',
  '电商购物': '🛒'
}

// 分类无匹配时的默认图标
export const DEFAULT_CATEGORY_ICON = '📁'

// 特殊域名到本地图标文件名的映射（含无法直接作为文件名的域名）
export const domainIconMap = {
  'www.融蜡.cn': 'www__rongla_cn',
  'www东方财富.com': 'www__eastmoney_com'
}

// 根据分类名获取图标
export function getCategoryIcon(category) {
  return categoryIcons[category] || DEFAULT_CATEGORY_ICON
}

// 从 url 中提取域名
export function getDomain(url) {
  return url.match(/:\/\/([^/]+)/)?.[1] || ''
}

// 根据 url 获取本地图标文件名（不含扩展名）
export function getIconName(url) {
  const domain = getDomain(url)
  return domainIconMap[domain] || domain
}
