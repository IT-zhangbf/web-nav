// ==================== 主题管理 ====================
(function initTheme() {
  const saved = localStorage.getItem('themeMode');
  if (saved === 'dark' || (saved !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('themeMode', next);
}
document.getElementById('themeBtn')?.addEventListener('click', toggleTheme);

// ==================== 搜索历史记录 ====================
const MAX_HISTORY = 20;

function getSearchHistory() {
  try {
    return JSON.parse(localStorage.getItem('searchHistory')) || [];
  } catch {
    return [];
  }
}

function saveSearchHistory(history) {
  localStorage.setItem('searchHistory', JSON.stringify(history));
}

function addSearchHistory(keyword) {
  if (!keyword || keyword.trim().length === 0) return;
  const history = getSearchHistory();
  const filtered = history.filter(item => item.keyword !== keyword);
  filtered.unshift({ keyword: keyword, time: Date.now() });
  if (filtered.length > MAX_HISTORY) {
    filtered.pop();
  }
  saveSearchHistory(filtered);
}

function renderSearchHistory() {
  const history = getSearchHistory();
  const container = document.getElementById('searchHistoryList');
  
  if (history.length === 0) {
    container.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.82rem;">暂无搜索记录</div>';
    return;
  }

  container.innerHTML = history.map(item => {
    const date = new Date(item.time);
    const timeStr = date.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return `<div class="search-history-item" data-keyword="${item.keyword}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span class="search-history-text">${item.keyword}</span>
      <span class="search-history-time">${timeStr}</span>
    </div>`;
  }).join('');

  container.querySelectorAll('.search-history-item').forEach(item => {
    item.addEventListener('click', () => {
      const keyword = item.dataset.keyword;
      document.getElementById('searchInput').value = keyword;
      document.getElementById('searchHistory').classList.remove('show');
      applyFilter();
    });
  });
}

function clearSearchHistory() {
  localStorage.removeItem('searchHistory');
  renderSearchHistory();
}

document.getElementById('clearHistory')?.addEventListener('click', clearSearchHistory);

const searchInput = document.getElementById('searchInput');
const searchHistory = document.getElementById('searchHistory');

searchInput?.addEventListener('focus', () => {
  if (searchInput.value.trim().length === 0) {
    renderSearchHistory();
    searchHistory.classList.add('show');
  }
});

searchInput?.addEventListener('input', () => {
  if (searchInput.value.trim().length > 0) {
    searchHistory.classList.remove('show');
  } else {
    renderSearchHistory();
    searchHistory.classList.add('show');
  }
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-box')) {
    searchHistory?.classList.remove('show');
  }
});

// ==================== 右键菜单 ====================
let currentContextLink = null;

function showContextMenu(e, linkData) {
  e.preventDefault();
  currentContextLink = linkData;
  const menu = document.getElementById('contextMenu');
  menu.style.left = `${e.clientX}px`;
  menu.style.top = `${e.clientY}px`;
  menu.classList.add('show');
  
  // 调整菜单位置避免超出屏幕
  const rect = menu.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    menu.style.left = `${e.clientX - rect.width}px`;
  }
  if (rect.bottom > window.innerHeight) {
    menu.style.top = `${e.clientY - rect.height}px`;
  }
}

function hideContextMenu() {
  const menu = document.getElementById('contextMenu');
  menu.classList.remove('show');
  currentContextLink = null;
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.context-menu')) {
    hideContextMenu();
  }
});

document.getElementById('contextMenu')?.addEventListener('click', (e) => {
  const item = e.target.closest('.context-menu-item');
  if (!item || !currentContextLink) return;
  
  const action = item.dataset.action;
  
  switch(action) {
    case 'copy':
      navigator.clipboard.writeText(currentContextLink.url).then(() => {
        showToast('链接已复制');
      });
      break;
    case 'open-new':
      window.open(currentContextLink.url, '_blank', 'noopener,noreferrer');
      break;
    case 'favorite':
      addFavorite(currentContextLink);
      break;
  }
  
  hideContextMenu();
});

// ==================== 收藏功能 ====================
function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('favorites')) || [];
  } catch {
    return [];
  }
}

function addFavorite(linkData) {
  const favorites = getFavorites();
  const exists = favorites.some(fav => fav.url === linkData.url);
  
  if (exists) {
    showToast('该网站已在收藏夹中');
    return;
  }
  
  favorites.unshift(linkData);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  showToast('已添加到收藏夹');
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
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
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ==================== 分类排序功能 ====================
let draggedCategory = null;

function initCategorySort() {
  const contentArea = document.getElementById('contentArea');
  
  contentArea.addEventListener('dragstart', (e) => {
    const categorySection = e.target.closest('.category-section');
    if (!categorySection) return;
    
    draggedCategory = categorySection;
    categorySection.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  contentArea.addEventListener('dragend', (e) => {
    if (draggedCategory) {
      draggedCategory.classList.remove('dragging');
      draggedCategory = null;
    }
    
    document.querySelectorAll('.category-section').forEach(section => {
      section.classList.remove('drag-over');
    });
  });

  contentArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const categorySection = e.target.closest('.category-section');
    if (!categorySection || categorySection === draggedCategory) return;
    
    document.querySelectorAll('.category-section').forEach(section => {
      section.classList.remove('drag-over');
    });
    
    categorySection.classList.add('drag-over');
  });

  contentArea.addEventListener('drop', (e) => {
    e.preventDefault();
    
    const targetSection = e.target.closest('.category-section');
    if (!targetSection || !draggedCategory || targetSection === draggedCategory) return;
    
    const contentArea = document.getElementById('contentArea');
    const sections = Array.from(contentArea.querySelectorAll('.category-section'));
    const draggedIndex = sections.indexOf(draggedCategory);
    const targetIndex = sections.indexOf(targetSection);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // 重新排序 allData
    const draggedData = allData[draggedIndex];
    allData.splice(draggedIndex, 1);
    allData.splice(targetIndex, 0, draggedData);
    
    // 保存排序到 localStorage
    const order = allData.map(cat => cat.category);
    localStorage.setItem('categoryOrder', JSON.stringify(order));
    
    // 重新渲染
    renderContent(allData);
  });
}

// ==================== 搜索引擎 ====================
const searchEngines = {
  baidu: 'https://www.baidu.com/s?wd=',
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  sogou: 'https://www.sogou.com/web?query=',
  duckduckgo: 'https://duckduckgo.com/?q='
};

(function initEngine() {
  const saved = localStorage.getItem('searchEngine') || 'baidu';
  document.querySelectorAll('.engine-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.engine === saved);
  });
})();

document.querySelector('.search-engine-select').addEventListener('click', e => {
  const btn = e.target.closest('.engine-btn');
  if (!btn) return;
  document.querySelectorAll('.engine-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  localStorage.setItem('searchEngine', btn.dataset.engine);
});

function doSearch() {
  const engine = document.querySelector('.engine-btn.active').dataset.engine;
  const keyword = document.getElementById('searchInput').value.trim();
  if (!keyword) return;
  
  if (engine === 'local') {
    addSearchHistory(keyword);
    applyFilter();
  } else {
    addSearchHistory(keyword);
    window.open(searchEngines[engine] + encodeURIComponent(keyword), '_blank');
  }
}

document.getElementById('searchBtn').addEventListener('click', doSearch);
document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    if (document.body.classList.contains('simple-mode')) {
      document.getElementById('simpleSearchInput').focus();
    } else {
      document.getElementById('searchInput').focus();
    }
  }
  if (e.key === 'Escape') {
    if (document.body.classList.contains('simple-mode')) {
      toggleSimpleMode();
    } else {
      document.getElementById('searchInput').value = '';
      document.getElementById('searchInput').blur();
      applyFilter();
    }
  }
});

// ==================== 面板切换（移动端） ====================
function togglePanel() {
  const panel = document.getElementById('sidePanel');
  const overlay = document.getElementById('panelOverlay');
  panel.classList.toggle('open');
  overlay.classList.toggle('show');
}

// ==================== 时钟 ====================
function initClock() {
  const canvas = document.getElementById('clockCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 200, H = 200, CX = 100, CY = 100, R = 85;

  function drawClock() {
    const now = new Date();
    const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();
    ctx.clearRect(0, 0, W, H);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bg = isDark ? 'rgba(30, 27, 60, 0.5)' : 'rgba(255, 255, 255, 0.3)';
    const border = isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)';
    const tick = isDark ? 'rgba(155, 151, 176, 0.5)' : 'rgba(99, 102, 241, 0.25)';
    const text = isDark ? '#e8e6f0' : '#1e1b4b';
    const hourHand = isDark ? '#c7c4e0' : '#3730a3';
    const minHand = isDark ? '#9b97b0' : '#6366f1';

    // 表盘
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 刻度
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
      const len = i % 5 === 0 ? 10 : 5;
      const outer = R - 3;
      ctx.strokeStyle = tick;
      ctx.lineWidth = i % 5 === 0 ? 2 : 1;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(angle) * (outer - len), CY + Math.sin(angle) * (outer - len));
      ctx.lineTo(CX + Math.cos(angle) * outer, CY + Math.sin(angle) * outer);
      ctx.stroke();
    }

    // 数字
    ctx.fillStyle = text;
    ctx.font = 'bold 12px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      ctx.fillText(i, CX + Math.cos(angle) * (R - 17), CY + Math.sin(angle) * (R - 17));
    }

    // 时针
    const hAngle = ((h + m / 60) / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = hourHand;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(CX + Math.cos(hAngle) * 38, CY + Math.sin(hAngle) * 38);
    ctx.stroke();

    // 分针
    const mAngle = (m / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = minHand;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(CX + Math.cos(mAngle) * 55, CY + Math.sin(mAngle) * 55);
    ctx.stroke();

    // 秒针
    const sAngle = (s / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(CX - Math.cos(sAngle) * 12, CY - Math.sin(sAngle) * 12);
    ctx.lineTo(CX + Math.cos(sAngle) * 65, CY + Math.sin(sAngle) * 65);
    ctx.stroke();

    // 中心点
    ctx.beginPath();
    ctx.arc(CX, CY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#6366f1';
    ctx.fill();

    // 日期
    const ds = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    document.getElementById('clockDate').textContent = ds;
  }

  drawClock();
  setInterval(drawClock, 1000);
}

// ==================== 日历 ====================

// 法定节假日（由 API 自动获取，失败时使用内置备降数据）
let holidays = {};
let workdays = {};

async function fetchHolidays(year) {
  try {
    const res = await fetch(`https://timor.tech/api/holiday/year/${year}`, { cache: 'no-cache' });
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    if (data.code === 0 && data.holiday) {
      const h = {}, w = {};
      for (const [date, info] of Object.entries(data.holiday)) {
        if (info.holiday) {
          h[date] = info.name;
        } else {
          w[date] = info.name + '调休上班';
        }
      }
      holidays = h;
      workdays = w;
      return true;
    }
  } catch (e) {
    // API 失败，使用内置备降
  }
  return false;
}

function loadFallbackHolidays() {
  // 内置备降数据（2026）
  holidays = {
    '2026-01-01': '元旦', '2026-01-02': '元旦', '2026-01-03': '元旦',
    '2026-02-15': '春节', '2026-02-16': '除夕', '2026-02-17': '春节', '2026-02-18': '春节',
    '2026-02-19': '春节', '2026-02-20': '春节', '2026-02-21': '春节', '2026-02-22': '春节', '2026-02-23': '春节',
    '2026-04-04': '清明', '2026-04-05': '清明', '2026-04-06': '清明',
    '2026-05-01': '劳动节', '2026-05-02': '劳动节', '2026-05-03': '劳动节', '2026-05-04': '劳动节', '2026-05-05': '劳动节',
    '2026-06-19': '端午', '2026-06-20': '端午', '2026-06-21': '端午',
    '2026-09-25': '中秋', '2026-09-26': '中秋', '2026-09-27': '中秋',
    '2026-10-01': '国庆', '2026-10-02': '国庆', '2026-10-03': '国庆', '2026-10-04': '国庆',
    '2026-10-05': '国庆', '2026-10-06': '国庆', '2026-10-07': '国庆'
  };
  workdays = {
    '2026-01-04': '元旦调休上班',
    '2026-02-14': '春节调休上班', '2026-02-28': '春节调休上班',
    '2026-05-09': '劳动节调休上班',
    '2026-09-20': '国庆调休上班', '2026-10-10': '国庆调休上班'
  };
}
loadFallbackHolidays();

const lunarDays = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];

// 农历月份数据: [年,月,日,年号,月名,天数]  覆盖2025-2027
const LUNAR_DATA = [
  [2025,1,29,'乙巳年','正月',30],[2025,2,28,'','二月',29],[2025,3,29,'','三月',30],
  [2025,4,28,'','四月',29],[2025,5,27,'','五月',30],[2025,6,25,'','闰六月',29],
  [2025,7,25,'','六月',30],[2025,8,23,'','七月',29],[2025,9,22,'','八月',30],
  [2025,10,21,'','九月',29],[2025,11,20,'','十月',30],[2025,12,20,'','冬月',29],
  [2026,1,18,'','腊月',30],
  [2026,2,17,'丙午年','正月',29],[2026,3,19,'','二月',30],[2026,4,17,'','三月',29],
  [2026,5,17,'','四月',30],[2026,6,15,'','五月',29],[2026,7,14,'','六月',30],
  [2026,8,13,'','七月',29],[2026,9,11,'','八月',30],[2026,10,11,'','九月',29],
  [2026,11,9,'','十月',30],[2026,12,9,'','冬月',30],
  [2027,1,8,'','腊月',29],
  [2027,2,6,'丁未年','正月',30],[2027,3,8,'','二月',29],[2027,4,7,'','三月',30],
  [2027,5,7,'','四月',29],[2027,6,5,'','五月',30],[2027,7,5,'','六月',29],
  [2027,8,3,'','七月',30],[2027,9,2,'','八月',29],[2027,10,1,'','九月',30],
  [2027,10,31,'','十月',29],[2027,11,29,'','冬月',30],[2027,12,29,'','腊月',29],
];

const WEEKDAYS = ['日','一','二','三','四','五','六'];
let calDate = new Date();
let calSelected = null;

/** 每日宜忌（依赖 lunar-javascript CDN） */
function getDayYiJi(year, month, day) {
  if (typeof Solar === 'undefined') return null;
  try {
    const lunar = Solar.fromYmd(year, month, day).getLunar();
    const yi = lunar.getDayYi() || [];
    const ji = lunar.getDayJi() || [];
    return { yi, ji };
  } catch (e) {
    return null;
  }
}

function formatYiJiBlock(yiji, extraClass) {
  if (!yiji || ((!yiji.yi || !yiji.yi.length) && (!yiji.ji || !yiji.ji.length))) return '';
  const yiStr = (yiji.yi && yiji.yi.length) ? yiji.yi.join('、') : '—';
  const jiStr = (yiji.ji && yiji.ji.length) ? yiji.ji.join('、') : '—';
  const cls = extraClass ? ` cal-detail-yiji ${extraClass}` : ' cal-detail-yiji';
  return `<div class="${cls.trim()}">
    <div class="cal-yi"><span class="label">宜</span><span>${yiStr}</span></div>
    <div class="cal-ji"><span class="label">忌</span><span>${jiStr}</span></div>
  </div>`;
}

function getLunarDate(year, month, day) {
  const date = new Date(year, month - 1, day);
  for (let i = LUNAR_DATA.length - 1; i >= 0; i--) {
    const [y, m, d, yrName, monName, days] = LUNAR_DATA[i];
    const start = new Date(y, m - 1, d);
    if (date >= start) {
      const diff = Math.floor((date - start) / 86400000);
      if (diff < days) {
        let yearName = yrName;
        if (!yearName) {
          for (let j = i; j >= 0; j--) {
            if (LUNAR_DATA[j][3]) { yearName = LUNAR_DATA[j][3]; break; }
          }
        }
        return { yearName, month: monName, day: lunarDays[diff] };
      }
    }
  }
  return null;
}

function renderCal() {
  const y = calDate.getFullYear(), m = calDate.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  let html = `<div class="cal-header">
    <button class="cal-nav-btn" onclick="changeCal(-1)">‹</button>
    <span class="cal-title cal-title-clickable" onclick="toggleCalPicker()">${y}年${m+1}月</span>
    <button class="cal-nav-btn" onclick="changeCal(1)">›</button>
    <button class="cal-today-btn" onclick="goToToday()">↻ 今天</button>
  </div>
  <div class="cal-grid">`;

  const wkds = ['日','一','二','三','四','五','六'];
  wkds.forEach(d => { html += `<span class="weekday">${d}</span>`; });

  for (let i = first - 1; i >= 0; i--) {
    html += `<span class="day other">${prevDays - i}</span>`;
  }
  for (let d = 1; d <= days; d++) {
    const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = ds === todayStr;
    const h = holidays[ds];
    const w = workdays[ds];
    const dow = new Date(y, m, d).getDay();
    const lunar = getLunarDate(y, m + 1, d);
    let cls = 'day';
    if (isToday) cls += ' today';
    if (h) cls += ' holiday';
    else if (w) cls += ' workday';
    else if (dow === 0 || dow === 6) cls += ' weekend';
    if (calSelected && calSelected.y === y && calSelected.m === m && calSelected.d === d) cls += ' selected';
    const lunarLabel = lunar ? `<span class="day-lunar">${lunar.day}</span>` : '';
    html += `<span class="${cls}" onclick="onDayClick(${y},${m+1},${d})">${d}${lunarLabel}</span>`;
  }
  const total = first + days;
  const rem = total <= 35 ? 35 - total : 42 - total;
  for (let i = 1; i <= rem; i++) html += `<span class="day other">${i}</span>`;
  html += '</div>';

  // 内联详情：选中日期或今日信息
  if (calSelected) {
    const { y: sy, m: sm, d: sd } = calSelected;
    const lunar = getLunarDate(sy, sm + 1, sd);
    if (lunar) {
      const date = new Date(sy, sm, sd);
      const weekday = WEEKDAYS[date.getDay()];
      const dateStr = `${sy}-${String(sm+1).padStart(2,'0')}-${String(sd).padStart(2,'0')}`;
      const h = holidays[dateStr];
      const w = workdays[dateStr];
      let holidayText = '无';
      if (h) holidayText = `🎉 ${h}`;
      else if (w) holidayText = `⚠️ ${w}`;
      const yiji = getDayYiJi(sy, sm + 1, sd);
      html += `<div class="cal-detail">
        <div class="cal-detail-date">${sy}年${sm+1}月${sd}日 星期${weekday}</div>
        <div class="cal-detail-lunar">${lunar.yearName} ${lunar.month}月${lunar.day}</div>
        <span class="cal-detail-holiday">${holidayText}</span>
        ${formatYiJiBlock(yiji, '')}
      </div>`;
    }
  } else {
    // 未选中时显示今日信息
    const todayLunar = getLunarDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
    if (todayLunar) {
      html += `<div class="cal-detail-today">${todayLunar.yearName} ${todayLunar.month}月${todayLunar.day}</div>`;
    }
    if (holidays[todayStr]) {
      html += `<div class="cal-detail-today-holiday">🎉 ${holidays[todayStr]}</div>`;
    } else if (workdays[todayStr]) {
      html += `<div class="cal-detail-today-holiday">⚠️ ${workdays[todayStr]}</div>`;
    }
    const todayYiji = getDayYiJi(today.getFullYear(), today.getMonth() + 1, today.getDate());
    html += formatYiJiBlock(todayYiji, 'cal-detail-today-yiji');
  }

  document.getElementById('calCompact').innerHTML = html;
}

// 点击日期
function onDayClick(year, month, day) {
  calSelected = { y: year, m: month - 1, d: day };
  renderCal();
}

// 回到今日
function goToToday() {
  const today = new Date();
  calDate = new Date(today.getFullYear(), today.getMonth(), 1);
  calSelected = { y: today.getFullYear(), m: today.getMonth(), d: today.getDate() };
  renderCal();
}

// 点击年月标题 -> 弹出年份月份选择器
let pickerYear = calDate.getFullYear();

function toggleCalPicker() {
  const existing = document.querySelector('.cal-overlay');
  if (existing) { existing.remove(); return; }

  pickerYear = calDate.getFullYear();
  const overlay = document.createElement('div');
  overlay.className = 'cal-overlay';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `<div class="cal-popup">
    <div class="cal-picker-header">
      <button class="cal-picker-nav" onclick="pickerYear--;renderCalPicker()">‹‹</button>
      <span class="cal-picker-year" id="pickerYear">${pickerYear}</span>
      <button class="cal-picker-nav" onclick="pickerYear++;renderCalPicker()">››</button>
    </div>
    <div class="cal-picker-grid" id="pickerGrid">
      ${[1,2,3,4,5,6,7,8,9,10,11,12].map(m =>
        `<span class="cal-picker-month${m === calDate.getMonth()+1 && pickerYear === calDate.getFullYear() ? ' active' : ''}" onclick="setCalYearMonth(${pickerYear},${m})">${m}月</span>`
      ).join('')}
    </div>
  </div>`;
  document.body.appendChild(overlay);
}

function renderCalPicker() {
  document.getElementById('pickerYear').textContent = pickerYear;
  document.getElementById('pickerGrid').innerHTML =
    [1,2,3,4,5,6,7,8,9,10,11,12].map(m =>
      `<span class="cal-picker-month${m === calDate.getMonth()+1 && pickerYear === calDate.getFullYear() ? ' active' : ''}" onclick="setCalYearMonth(${pickerYear},${m})">${m}月</span>`
    ).join('');
}

function setCalYearMonth(year, month) {
  calDate = new Date(year, month - 1);
  calSelected = null;
  renderCal();
  document.querySelector('.cal-overlay')?.remove();
}

function changeCal(delta) {
  calDate.setMonth(calDate.getMonth() + delta);
  calSelected = null;
  renderCal();
}

// ==================== 分类与链接 ====================
const categoryIcons = {
  'AI 工具': '🤖', '代码助手': '💻', '实用工具': '🔧', '学习资源': '📚',
  '视频平台': '🎬', '直播平台': '📺', '动漫视频': '🎨', '小说阅读': '📖',
  '有声小说': '🎧', '典藏资源': '💎', '娱乐休闲': '🎮', '云服务': '☁️',
  '电商购物': '🛒'
};

const domainIconMap = {
  'www.融蜡.cn': 'www__rongla_cn',
  'www东方财富.com': 'www__eastmoney_com'
};

let allData = [];
let currentCategory = 'all';

async function loadLinks() {
  try {
    const res = await fetch('links.json', { cache: 'reload' });
    const data = await res.json();
    allData = data.categories;
    
    // 应用保存的分类排序
    const savedOrder = localStorage.getItem('categoryOrder');
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder);
        const orderMap = {};
        order.forEach((cat, idx) => orderMap[cat] = idx);
        allData.sort((a, b) => (orderMap[a.category] ?? 999) - (orderMap[b.category] ?? 999));
      } catch (e) {
        console.warn('Failed to apply category order:', e);
      }
    }
    
    renderCategoryNav();
    renderContent(allData);
    initCategorySort();
  } catch (e) {
    document.getElementById('contentArea').innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
        </svg>
        <p>加载数据失败：${e.message}</p>
      </div>`;
  }
}

function renderCategoryNav() {
  const nav = document.getElementById('categoryNav');
  let html = `<button class="cat-tab active" data-cat="all">全部</button>`;
  allData.forEach(c => {
    const icon = categoryIcons[c.category] || '📁';
    html += `<button class="cat-tab" data-cat="${c.category}">${icon} ${c.category}</button>`;
  });
  nav.innerHTML = html;

  nav.addEventListener('click', e => {
    const btn = e.target.closest('.cat-tab');
    if (!btn) return;
    currentCategory = btn.dataset.cat;
    nav.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter();
  });
}

// ==================== 图标错误处理 ====================
function handleIconError(img) {
  const retry = parseInt(img.dataset.retry || '0');
  if (retry === 0) {
    img.dataset.retry = '1';
    img.src = `icons/${img.dataset.domain}.svg`;
  } else if (retry === 1) {
    img.dataset.retry = '2';
    img.src = 'icons/default.svg';
  } else {
    img.parentElement.innerHTML = '🔗';
  }
}

function renderContent(categories) {
  const container = document.getElementById('contentArea');
  if (!categories.length) {
    container.innerHTML = `<div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <p>没有找到相关网站</p>
    </div>`;
    return;
  }

  container.innerHTML = categories.map((cat, ci) => {
    const icon = categoryIcons[cat.category] || '📁';
    const links = cat.links;

    const cards = links.map((link, li) => {
      const domain = link.url.match(/:\/\/([^/]+)/)?.[1] || '';
      const iconName = domainIconMap[domain] || domain;
      return `<a class="link-card" href="${link.url}" target="_blank" rel="noopener" 
        data-link='${JSON.stringify(link)}'
        style="animation:fadeInUp 0.3s backwards;animation-delay:${li * 0.03}s"
        oncontextmenu="showContextMenu(event, ${JSON.stringify(link).replace(/"/g, '&quot;')})">
        <div class="link-icon">
          <img src="icons/${iconName}.png" loading="lazy" data-domain="${iconName}" data-retry="0" onerror="handleIconError(this)" alt="">
        </div>
        <div class="link-info">
          <div class="link-name">${link.name}</div>
          <div class="link-desc">${link.desc || domain}</div>
        </div>
      </a>`;
    }).join('');

    return `<div class="category-section" draggable="true" style="animation:fadeInUp 0.4s backwards;animation-delay:${ci * 0.08}s">
      <div class="cat-header draggable">
        <div class="cat-drag-handle">☰</div>
        <div class="cat-icon">${icon}</div>
        <h2 class="cat-title">${cat.category}</h2>
        <span class="cat-count">${cat.links.length}</span>
      </div>
      <div class="cards-grid">${cards}</div>
    </div>`;
  }).join('');

}

function applyFilter() {
  const keyword = document.getElementById('searchInput').value.toLowerCase().trim();
  let filtered = allData;

  if (currentCategory !== 'all') {
    filtered = allData.filter(c => c.category === currentCategory);
  }

  if (keyword) {
    filtered = filtered.map(c => ({
      category: c.category,
      links: c.links.filter(l =>
        l.name.toLowerCase().includes(keyword) ||
        (l.desc || '').toLowerCase().includes(keyword)
      )
    })).filter(c => c.links.length > 0);
  }

  renderContent(filtered);
}

document.getElementById('searchInput').addEventListener('input', () => {
  const engine = document.querySelector('.engine-btn.active').dataset.engine;
  if (engine === 'local') applyFilter();
});

// ==================== 壁纸切换 ====================
const wallpapers = [
  { name: '无', bg: '' },
  { name: '极光幻境', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' },
  { name: '深海蓝调', bg: 'linear-gradient(135deg, #0c3483 0%, #a2b6df 50%, #6b8cce 100%)' },
  { name: '暖阳落日', bg: 'linear-gradient(135deg, #f5af19 0%, #f12711 50%, #c62128 100%)' },
  { name: '薄荷清风', bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 50%, #a8e6cf 100%)' },
  { name: '樱花物语', bg: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 50%, #f8c3cd 100%)' },
  { name: '星空紫夜', bg: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }
];

function initWallpaper() {
  const saved = localStorage.getItem('wallpaperIndex');
  let activeIdx = -1;

  if (localStorage.getItem('wallpaperCustom')) {
    activeIdx = -1;
  } else if (saved !== null) {
    activeIdx = parseInt(saved);
    applyWallpaper(activeIdx);
  } else {
    activeIdx = 0;
    applyWallpaper(0);
  }

  const grid = document.getElementById('wpGrid');
  grid.innerHTML = wallpapers.map((wp, i) =>
    `<div class="wp-option${i === activeIdx ? ' active' : ''}" data-idx="${i}" style="background:${wp.bg || '#f1f5f9'}"></div>`
  ).join('');

  grid.addEventListener('click', e => {
    const opt = e.target.closest('.wp-option');
    if (!opt) return;
    const i = parseInt(opt.dataset.idx);
    grid.querySelectorAll('.wp-option').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    applyWallpaper(i);
    localStorage.setItem('wallpaperIndex', String(i));
    localStorage.removeItem('wallpaperCustom');
    saveWallpaperToDB('').catch(() => {});
  });

  document.getElementById('wallpaperBtn').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('wpPicker').classList.toggle('open');
    document.getElementById('wpOverlay').classList.toggle('open');
  });

  document.getElementById('wpUpload').addEventListener('click', () => {
    document.getElementById('wpFileInput').click();
  });

  document.getElementById('wpFileInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      document.body.style.setProperty('--bg-wallpaper', `url(${dataUrl})`);
      document.body.classList.add('has-wallpaper');
      saveWallpaperToDB(dataUrl).catch(() => {
        // IndexedDB 失败时 fallback 到 localStorage
        localStorage.setItem('wallpaperCustom', dataUrl);
      });
      localStorage.removeItem('wallpaperIndex');
      closeWallpaperPicker();
    };
    reader.readAsDataURL(file);
  });
}

function applyWallpaper(index) {
  const wp = wallpapers[index];
  if (!wp.bg) {
    document.body.classList.remove('has-wallpaper');
    document.body.style.removeProperty('--bg-wallpaper');
    document.body.style.background = '';
  } else if (wp.bg.startsWith('linear-gradient')) {
    document.body.classList.remove('has-wallpaper');
    document.body.style.background = wp.bg;
    document.body.style.backgroundAttachment = 'fixed';
  } else {
    document.body.style.setProperty('--bg-wallpaper', wp.bg);
    document.body.classList.add('has-wallpaper');
  }
}

function closeWallpaperPicker() {
  document.getElementById('wpPicker').classList.remove('open');
  document.getElementById('wpOverlay').classList.remove('open');
}

// ==================== IndexedDB 壁纸存储（支持大图） ====================
const DB_NAME = 'WebNavDB';
const DB_VERSION = 1;
const STORE_NAME = 'wallpapers';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function saveWallpaperToDB(dataUrl) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(dataUrl, 'custom');
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  }));
}

function loadWallpaperFromDB() {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get('custom');
    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(e.target.error);
  }));
}

// 恢复自定义壁纸（优先 IndexedDB，降级 localStorage）
(async function restoreWallpaper() {
  try {
    const dbUrl = await loadWallpaperFromDB();
    if (dbUrl) {
      document.body.style.setProperty('--bg-wallpaper', `url(${dbUrl})`);
      document.body.classList.add('has-wallpaper');
      return;
    }
  } catch (e) {
    // IndexedDB 不可用
  }
  const custom = localStorage.getItem('wallpaperCustom');
  if (custom) {
    document.body.style.setProperty('--bg-wallpaper', `url(${custom})`);
    document.body.classList.add('has-wallpaper');
  }
})();

// ==================== 移动端汉堡菜单按钮 ====================
(function addMobileToggle() {
  // 在移动端顶部栏添加面板切换按钮
  if (window.innerWidth <= 1023) {
    const actions = document.querySelector('.top-actions');
    const btn = document.createElement('button');
    btn.className = 'icon-btn';
    btn.id = 'mobilePanelBtn';
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    btn.title = '打开面板';
    btn.addEventListener('click', togglePanel);
    actions.insertBefore(btn, actions.firstChild);
  }
})();

// ==================== 简洁模式 ====================
let simpleClockTimer = null;

function toggleSimpleMode() {
  const isSimple = document.body.classList.contains('simple-mode');
  if (isSimple) {
    document.body.classList.remove('simple-mode');
    document.getElementById('simpleSearchInput').blur();
    if (simpleClockTimer) {
      clearInterval(simpleClockTimer);
      simpleClockTimer = null;
    }
    localStorage.setItem('simpleMode', 'false');
  } else {
    document.body.classList.add('simple-mode');
    updateSimpleClock();
    simpleClockTimer = setInterval(updateSimpleClock, 1000);
    setTimeout(() => document.getElementById('simpleSearchInput').focus(), 400);
    localStorage.setItem('simpleMode', 'true');
  }
}

function restoreSimpleMode() {
  if (localStorage.getItem('simpleMode') === 'true') {
    document.body.classList.add('simple-mode');
    updateSimpleClock();
    simpleClockTimer = setInterval(updateSimpleClock, 1000);
    setTimeout(() => document.getElementById('simpleSearchInput').focus(), 400);
  }
}

function updateSimpleClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  });
  document.getElementById('simpleTime').textContent = timeStr;
  document.getElementById('simpleDate').textContent = dateStr;
}

document.getElementById('simpleSearchBtn')?.addEventListener('click', doSimpleSearch);
document.getElementById('simpleSearchInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') doSimpleSearch();
});

function doSimpleSearch() {
  const keyword = document.getElementById('simpleSearchInput').value.trim();
  if (!keyword) return;
  const engine = document.querySelector('.engine-btn.active')?.dataset?.engine;
  const url = (engine && engine !== 'local' && searchEngines[engine])
    ? searchEngines[engine] + encodeURIComponent(keyword)
    : searchEngines.baidu + encodeURIComponent(keyword);
  addSearchHistory(keyword);
  window.open(url, '_blank');
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  renderCal();
  initWallpaper();
  loadLinks();
  restoreSimpleMode();
  // 异步获取当年节假日，成功后刷新日历
  const year = new Date().getFullYear();
  fetchHolidays(year).then(ok => {
    if (ok) { renderCal(); }
  });
});
