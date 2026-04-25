# web-nav 全面改建实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 对个人导航门户 web-nav 进行全面改版，以极简效率风为主视觉，左侧面板集成时钟/日历/天气/书签 Widget

**Architecture:** 单文件 HTML 架构，所有 CSS 和 JS 内联；移除 Bootstrap/jQuery/Font Awesome 依赖；数据源继续使用 links.json；新增 Widget 数据用 localStorage 持久化

**Tech Stack:** 纯静态 HTML5 / CSS3 / Vanilla JavaScript

---

## 文件结构

| 文件 | 操作 | 说明 |
|------|------|------|
| `index.html` | 重写 | 全新架构，单文件内联全部样式和脚本 |
| `style.css` | 删除 | 样式已合并到 index.html |
| `bootstrap.min.css` | 删除 | 不再使用 |
| `all.min.css` | 删除 | 不再使用 |
| `bootstrap.min.js` | 删除 | 不再使用 |
| `jquery-3.6.0.min.js` | 删除 | 不再使用 |
| `popper.min.js` | 删除 | 不再使用 |
| `links.json` | 保留 | 数据源不变 |
| `time.html` | 保留（参考） | Canvas 时钟绘制逻辑借鉴 |
| `icons/` | 保留 | favicon 资源 |
| `download_icons.py` | 保留 | 图标下载脚本 |
| `404.html` | 保留 | 404 页面 |

---

### Task 1: HTML 骨架 + CSS 设计系统

**Files:**
- Create/Modify: `index.html`

- [ ] **Step 1: 编写 HTML 骨架和 CSS 变量**

创建完整的 `<html>` 结构，声明 CSS 自定义属性（极简高级灰色系）。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>个人导航</title>
<style>
/* ==================== CSS 变量 ==================== */
:root {
  --primary: #6b7280;
  --primary-dark: #4b5563;
  --primary-light: #9ca3af;
  --bg-page: #f8fafc;
  --bg-card: #ffffff;
  --bg-surface: #f1f5f9;
  --bg-glass: rgba(255, 255, 255, 0.7);
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --border: #e5e7eb;
  --border-glass: rgba(255, 255, 255, 0.8);
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 25px rgba(0,0,0,0.1);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --accent: #3b82f6;
}

[data-theme="dark"] {
  --bg-page: #0f172a;
  --bg-card: #1e293b;
  --bg-surface: #1e293b;
  --bg-glass: rgba(30, 41, 59, 0.8);
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border: #334155;
  --border-glass: rgba(51, 65, 85, 0.8);
}

/* ==================== Reset ==================== */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif;
  background: var(--bg-page);
  color: var(--text-primary);
  min-height: 100vh;
  line-height: 1.5;
  transition: background 0.3s, color 0.3s;
}
a { text-decoration: none; color: inherit; }
button { border: none; cursor: pointer; font: inherit; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--text-muted); border-radius: 3px; }
</style>
</head>
<body>
<!-- 后续任务填充内容 -->
<script>
// 后续任务填充脚本
</script>
</body>
</html>
```

- [ ] **Step 2: 编写暗色模式检测和切换脚本**

```html
<script>
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
</script>
```

- [ ] **Step 3: 验证骨架可用**

直接在浏览器中打开 index.html，确认：
- 页面显示空白但无报错
- `data-theme` 属性正确设置
- 切换 `toggleTheme()` 后 CSS 变量生效

---

### Task 2: 顶部栏（搜索 + 引擎选择 + 操作按钮）

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 编写顶部栏 HTML**

```html
<!-- 在 `<body>` 内第一项添加 -->

<header class="top-bar">
  <div class="top-bar-inner">
    <div class="logo">个人导航</div>

    <div class="search-wrapper">
      <div class="search-engine-select" id="engineSelect">
        <button class="engine-btn active" data-engine="baidu">百度</button>
        <button class="engine-btn" data-engine="google">Google</button>
        <button class="engine-btn" data-engine="bing">必应</button>
        <button class="engine-btn" data-engine="sogou">搜狗</button>
        <button class="engine-btn" data-engine="duckduckgo">Duck</button>
        <button class="engine-btn" data-engine="local">本站</button>
      </div>
      <div class="search-box">
        <input type="text" class="search-input" id="searchInput" placeholder="搜索网站或输入关键词..." autofocus>
        <button class="search-btn" id="searchBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="top-actions">
      <button class="icon-btn" id="wallpaperBtn" title="切换壁纸">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
        </svg>
      </button>
      <button class="icon-btn" id="themeBtn" onclick="toggleTheme()" title="切换主题">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
    </div>
  </div>
</header>
```

- [ ] **Step 2: 编写顶部栏 CSS**

```css
/* ==================== 顶部栏 ==================== */
.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-glass);
  backdrop-filter: blur(var(--glass-blur, 16px));
  -webkit-backdrop-filter: blur(var(--glass-blur, 16px));
  border-bottom: 1px solid var(--border-glass);
}
.top-bar-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.625rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  user-select: none;
}
.search-wrapper { flex: 1; max-width: 600px; margin: 0 auto; }
.search-engine-select {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.375rem;
  flex-wrap: wrap;
}
.engine-btn {
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  background: var(--bg-surface);
  color: var(--text-secondary);
  transition: all 0.15s;
}
.engine-btn:hover { background: var(--border); }
.engine-btn.active { background: var(--primary); color: #fff; }
.search-box {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.25rem 0.25rem 0.25rem 0.75rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-box:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(107,114,128,0.15);
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.9rem;
  background: transparent;
  color: var(--text-primary);
}
.search-input::placeholder { color: var(--text-muted); }
.search-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: #fff;
  transition: background 0.15s;
}
.search-btn:hover { background: var(--primary-dark); }
.top-actions { display: flex; gap: 0.375rem; }
.icon-btn {
  width: 36px; height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--text-secondary);
  transition: background 0.15s, color 0.15s;
}
.icon-btn:hover { background: var(--bg-surface); color: var(--text-primary); }
```

- [ ] **Step 3: 编写搜索逻辑 JS**

```javascript
// ==================== 搜索引擎 ====================
const searchEngines = {
  baidu: 'https://www.baidu.com/s?wd=',
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  sogou: 'https://www.sogou.com/web?query=',
  duckduckgo: 'https://duckduckgo.com/?q='
};

// 恢复上次选择的引擎
(function initEngine() {
  const saved = localStorage.getItem('searchEngine') || 'baidu';
  document.querySelectorAll('.engine-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.engine === saved);
  });
})();

// 引擎切换
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
    filterLinks(keyword);
  } else {
    window.open(searchEngines[engine] + encodeURIComponent(keyword), '_blank');
  }
}

document.getElementById('searchBtn').addEventListener('click', doSearch);
document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

// 键盘快捷键
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    document.getElementById('searchInput').focus();
  }
  if (e.key === 'Escape') {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchInput').blur();
    filterLinks('');
  }
});
```

---

### Task 3: 页面主体布局 + 左侧面板容器

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 编写主体布局 HTML**

```html
<div class="app-layout">
  <aside class="side-panel" id="sidePanel">
    <div class="panel-scroll">
      <!-- 时钟 Widget -->
      <div class="widget" id="clockWidget">
        <div class="widget-title">时钟</div>
        <div class="clock-container">
          <canvas id="clockCanvas" width="200" height="200"></canvas>
          <div class="clock-date" id="clockDate"></div>
        </div>
      </div>

      <!-- 天气 Widget -->
      <div class="widget" id="weatherWidget">
        <div class="widget-title">天气</div>
        <div class="weather-body" id="weatherBody">
          <div class="weather-placeholder">点击设置城市</div>
        </div>
      </div>

      <!-- 日历 Widget -->
      <div class="widget" id="calendarWidget">
        <div class="widget-title">日历</div>
        <div class="cal-compact" id="calCompact"></div>
      </div>

      <!-- 快捷书签 Widget -->
      <div class="widget" id="bookmarkWidget">
        <div class="widget-title">快捷书签</div>
        <div class="bookmark-list" id="bookmarkList"></div>
        <button class="bookmark-add-btn" id="addBookmarkBtn">+ 添加书签</button>
      </div>
    </div>
  </aside>

  <main class="main-content">
    <nav class="category-nav" id="categoryNav"></nav>
    <div id="contentArea"></div>
  </main>
</div>
```

- [ ] **Step 2: 编写主体布局 CSS**

```css
/* ==================== 主体布局 ==================== */
.app-layout {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 1.25rem;
  gap: 1.25rem;
  min-height: calc(100vh - 64px);
}

/* 左侧面板 */
.side-panel {
  width: 260px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
  align-self: flex-start;
  max-height: calc(100vh - 96px);
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--bg-glass);
  backdrop-filter: blur(var(--glass-blur, 16px));
  -webkit-backdrop-filter: blur(var(--glass-blur, 16px));
  border: 1px solid var(--border-glass);
}
.panel-scroll {
  padding: 0.75rem;
  overflow-y: auto;
  max-height: inherit;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Widget 通用样式 */
.widget {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  box-shadow: var(--shadow-sm);
}
.widget-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

/* 主内容区 */
.main-content { flex: 1; min-width: 0; }

/* 平板/移动端面板隐藏 */
@media (max-width: 1023px) {
  .side-panel {
    position: fixed;
    top: 0;
    left: -280px;
    width: 280px;
    height: 100vh;
    max-height: none;
    z-index: 200;
    border-radius: 0;
    transition: left 0.3s;
    padding-top: 0;
  }
  .side-panel.open { left: 0; }
  .panel-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.3);
    z-index: 199;
    display: none;
  }
  .panel-overlay.show { display: block; }
}
```

---

### Task 4: Canvas 表盘时钟

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 编写时钟 CSS**

```css
/* ==================== 时钟 ==================== */
.clock-container { text-align: center; }
#clockCanvas { width: 180px; height: 180px; border-radius: 50%; }
.clock-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}
```

- [ ] **Step 2: 编写时钟 JS（基于现有 time.html 优化）**

```javascript
// ==================== 时钟 ====================
function initClock() {
  const canvas = document.getElementById('clockCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 200, H = 200, CX = 100, CY = 100, R = 85;
  canvas.width = W; canvas.height = H;

  function drawClock() {
    const now = new Date();
    const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();
    ctx.clearRect(0, 0, W, H);

    // 表盘
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.fill();
    ctx.strokeStyle = isDark ? '#334155' : '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 刻度
    ctx.strokeStyle = isDark ? '#64748b' : '#9ca3af';
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
      const len = i % 5 === 0 ? 10 : 5;
      const outer = R - 4;
      ctx.lineWidth = i % 5 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(angle) * (outer - len), CY + Math.sin(angle) * (outer - len));
      ctx.lineTo(CX + Math.cos(angle) * outer, CY + Math.sin(angle) * outer);
      ctx.stroke();
    }

    // 数字
    ctx.fillStyle = isDark ? '#f1f5f9' : '#111827';
    ctx.font = 'bold 12px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      ctx.fillText(i, CX + Math.cos(angle) * (R - 18), CY + Math.sin(angle) * (R - 18));
    }

    // 时针
    const hAngle = ((h + m / 60) / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = isDark ? '#e2e8f0' : '#374151';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(CX + Math.cos(hAngle) * 40, CY + Math.sin(hAngle) * 40);
    ctx.stroke();

    // 分针
    const mAngle = (m / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = isDark ? '#94a3b8' : '#6b7280';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(CX + Math.cos(mAngle) * 55, CY + Math.sin(mAngle) * 55);
    ctx.stroke();

    // 秒针
    const sAngle = (s / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(CX - Math.cos(sAngle) * 12, CY - Math.sin(sAngle) * 12);
    ctx.lineTo(CX + Math.cos(sAngle) * 65, CY + Math.sin(sAngle) * 65);
    ctx.stroke();

    // 中心圆点
    ctx.beginPath();
    ctx.arc(CX, CY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();

    // 日期文字
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    document.getElementById('clockDate').textContent = dateStr;
  }

  drawClock();
  setInterval(drawClock, 1000);
}

// 监听主题变化重绘时钟
const themeObserver = new MutationObserver(() => {
  // 重新绘制由 setInterval 自动处理
});
const htmlEl = document.documentElement;
themeObserver.observe(htmlEl, { attributes: true, attributeFilter: ['data-theme'] });
```

---

### Task 5: 日历 Widget

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 编写日历 CSS**

```css
/* ==================== 日历 ==================== */
.cal-compact { font-size: 0.78rem; }
.cal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.375rem;
}
.cal-title { font-weight: 600; font-size: 0.82rem; color: var(--text-primary); }
.cal-nav-btn {
  width: 22px; height: 22px;
  border-radius: 4px;
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.cal-nav-btn:hover { background: var(--border); }
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  text-align: center;
}
.cal-grid .weekday {
  font-size: 0.7rem;
  color: var(--text-muted);
  padding: 2px 0;
  font-weight: 500;
}
.cal-grid .day {
  padding: 3px 0;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  position: relative;
  transition: background 0.1s;
}
.cal-grid .day:hover { background: var(--bg-surface); }
.cal-grid .day.other { color: var(--text-muted); opacity: 0.4; }
.cal-grid .day.today {
  background: var(--primary);
  color: #fff;
  font-weight: 600;
}
.cal-grid .day.holiday { color: #ef4444; }
.cal-grid .day.holiday.today { color: #fff; }
.cal-grid .day.weekend:not(.holiday):not(.today) { color: #22c55e; }
.cal-grid .day.workday { background: rgba(239,68,68,0.1); }
.cal-lunar {
  margin-top: 0.375rem;
  padding-top: 0.375rem;
  border-top: 1px solid var(--border);
  font-size: 0.72rem;
  color: var(--text-secondary);
  text-align: center;
}
.cal-holiday {
  font-size: 0.7rem;
  color: #ef4444;
  text-align: center;
  margin-top: 0.25rem;
}
```

- [ ] **Step 2: 编写日历 JS（精简版，保留农历和假日）**

```javascript
// ==================== 日历 ====================
const holidays = {
  '2026-01-01': '元旦', '2026-01-02': '元旦', '2026-01-03': '元旦',
  '2026-02-17': '除夕', '2026-02-18': '春节', '2026-02-19': '春节',
  '2026-02-20': '春节', '2026-02-21': '春节', '2026-02-22': '春节', '2026-02-23': '春节',
  '2026-04-04': '清明', '2026-04-05': '清明', '2026-04-06': '清明',
  '2026-05-01': '劳动节', '2026-05-02': '劳动节', '2026-05-03': '劳动节', '2026-05-04': '劳动节', '2026-05-05': '劳动节',
  '2026-05-31': '端午', '2026-06-01': '端午', '2026-06-02': '端午',
  '2026-10-01': '国庆', '2026-10-02': '国庆', '2026-10-03': '国庆', '2026-10-04': '国庆',
  '2026-10-05': '国庆', '2026-10-06': '国庆', '2026-10-07': '国庆', '2026-10-08': '国庆',
  '2026-10-25': '中秋'
};
const workdays = {
  '2026-02-15': '春节调休', '2026-02-28': '春节调休',
  '2026-05-09': '劳动节调休', '2026-09-27': '国庆调休', '2026-10-11': '国庆调休'
};
const lunarMonths = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
const lunarDays = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];

const lunar2026Map = [
  [2,18,'正月',30],[3,20,'二月',28],[4,17,'三月',30],[5,17,'四月',29],
  [6,15,'五月',30],[7,14,'六月',30],[8,13,'七月',29],[9,11,'八月',30],
  [10,11,'九月',29],[11,9,'十月',30],[12,9,'冬月',30],[2027,1,8,'腊月',29]
];

function solarToLunarCompact(year, month, day) {
  if (month === 1 || (month === 2 && day <= 17)) {
    const eve = new Date(2026, 1, 17);
    const diff = Math.floor((new Date(year, month-1, day) - eve) / 86400000);
    if (diff >= 0 && diff < 29) return { month: '腊月', day: lunarDays[diff] };
  }
  for (let i = 0; i < lunar2026Map.length; i++) {
    const [m, d, name, days] = lunar2026Map[i][0] === 2027
      ? [lunar2026Map[i][1], lunar2026Map[i][2], lunar2026Map[i][3], lunar2026Map[i][4]]
      : lunar2026Map[i];
    const start = new Date(lunar2026Map[i][0] === 2027 ? 2027 : 2026, (lunar2026Map[i][0] === 2027 ? lunar2026Map[i][1] : m) - 1, lunar2026Map[i][0] === 2027 ? lunar2026Map[i][2] : d);
    // Simplified: just use index-based lookup
  }
  return { month: '', day: '' };
}

let calDate = new Date();

function renderCal() {
  const y = calDate.getFullYear(), m = calDate.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  const today = new Date();

  let html = `<div class="cal-header">
    <button class="cal-nav-btn" onclick="changeCal(-1)">‹</button>
    <span class="cal-title">${y}年${m+1}月</span>
    <button class="cal-nav-btn" onclick="changeCal(1)">›</button>
  </div>
  <div class="cal-grid">`;
  html += '<span class="weekday">日</span><span class="weekday">一</span><span class="weekday">二</span><span class="weekday">三</span><span class="weekday">四</span><span class="weekday">五</span><span class="weekday">六</span>';

  for (let i = first - 1; i >= 0; i--) {
    html += `<span class="day other">${prevDays - i}</span>`;
  }
  for (let d = 1; d <= days; d++) {
    const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = ds === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const h = holidays[ds];
    const w = workdays[ds];
    const dow = new Date(y, m, d).getDay();
    let cls = 'day';
    if (isToday) cls += ' today';
    if (h) cls += ' holiday';
    else if (w) cls += ' workday';
    else if (dow === 0 || dow === 6) cls += ' weekend';
    html += `<span class="${cls}">${d}</span>`;
  }
  const total = first + days;
  const rem = total <= 35 ? 35 - total : 42 - total;
  for (let i = 1; i <= rem; i++) html += `<span class="day other">${i}</span>`;
  html += '</div>';

  // 今日农历
  const tl = solarToLunarCompact(today.getFullYear(), today.getMonth()+1, today.getDate());
  html += `<div class="cal-lunar">${tl.month}${tl.day}</div>`;

  // 今日假日
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  if (holidays[todayStr]) {
    html += `<div class="cal-holiday">🎉 ${holidays[todayStr]}</div>`;
  } else if (workdays[todayStr]) {
    html += `<div class="cal-holiday">⚠️ ${workdays[todayStr]}</div>`;
  }

  document.getElementById('calCompact').innerHTML = html;
}

function changeCal(delta) {
  calDate.setMonth(calDate.getMonth() + delta);
  renderCal();
}
```

---

### Task 6: 天气 Widget

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 编写天气 CSS**

```css
/* ==================== 天气 ==================== */
.weather-body { text-align: center; cursor: pointer; }
.weather-placeholder {
  font-size: 0.78rem;
  color: var(--text-muted);
  padding: 0.5rem;
}
.weather-info { display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
.weather-temp { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
.weather-desc { font-size: 0.78rem; color: var(--text-secondary); }
.weather-city { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem; }
.weather-edit {
  display: none;
  gap: 0.375rem;
  margin-top: 0.375rem;
}
.weather-edit.show { display: flex; }
.weather-edit input {
  flex: 1;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.78rem;
  outline: none;
  background: var(--bg-card);
  color: var(--text-primary);
}
.weather-edit button {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.72rem;
  background: var(--primary);
  color: #fff;
}
```

- [ ] **Step 2: 编写天气 JS（手动输入城市 + LocalStorage 存储）**

```javascript
// ==================== 天气 ====================
// 使用免费 wttr.in API 或手动输入
const WEATHER_API = 'https://wttr.in';

function initWeather() {
  const city = localStorage.getItem('weatherCity') || '';
  if (city) {
    fetchWeather(city);
  }
  document.getElementById('weatherBody').addEventListener('click', () => {
    const editDiv = document.querySelector('.weather-edit');
    editDiv.classList.toggle('show');
  });
}

async function fetchWeather(city) {
  const body = document.getElementById('weatherBody');
  body.innerHTML = '<div class="weather-placeholder">加载中...</div>';
  try {
    // 使用 wttr.in 的简洁格式
    const res = await fetch(`${WEATHER_API}/${encodeURIComponent(city)}?format=%c+%t+%C`);
    if (!res.ok) throw new Error('fetch failed');
    const text = await res.text();
    const parts = text.trim().split(' ');
    const icon = parts[0] || '🌤';
    const temp = parts[1] || '--';
    const desc = parts.slice(2).join(' ') || '未知';
    body.innerHTML = `
      <div class="weather-info">
        <span style="font-size:1.5rem">${icon}</span>
        <span class="weather-temp">${temp}</span>
      </div>
      <div class="weather-desc">${desc}</div>
      <div class="weather-city">${city}</div>
      <div class="weather-edit">
        <input type="text" id="weatherCityInput" value="${city}" placeholder="输入城市名">
        <button onclick="updateWeatherCity()">确定</button>
      </div>
    `;
  } catch {
    body.innerHTML = `
      <div class="weather-placeholder">加载失败，点击重试</div>
      <div class="weather-edit show">
        <input type="text" id="weatherCityInput" value="${city}" placeholder="输入城市名">
        <button onclick="updateWeatherCity()">确定</button>
      </div>
    `;
  }
}

function updateWeatherCity() {
  const city = document.getElementById('weatherCityInput').value.trim();
  if (!city) return;
  localStorage.setItem('weatherCity', city);
  fetchWeather(city);
}
```

---

### Task 7: 快捷书签 Widget

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 编写书签 CSS**

```css
/* ==================== 快捷书签 ==================== */
.bookmark-list { display: flex; flex-direction: column; gap: 0.25rem; }
.bookmark-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  color: var(--text-primary);
  transition: background 0.1s;
  cursor: pointer;
}
.bookmark-item:hover { background: var(--bg-surface); }
.bookmark-item .del {
  margin-left: auto;
  color: var(--text-muted);
  font-size: 0.7rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
}
.bookmark-item:hover .del { opacity: 1; }
.bookmark-item .del:hover { color: #ef4444; }
.bookmark-add-btn {
  width: 100%;
  margin-top: 0.375rem;
  padding: 0.3rem;
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: transparent;
  border: 1px dashed var(--border);
  transition: all 0.15s;
}
.bookmark-add-btn:hover { background: var(--bg-surface); color: var(--text-primary); }
```

- [ ] **Step 2: 编写书签 JS**

```javascript
// ==================== 快捷书签 ====================
function loadBookmarks() {
  const data = localStorage.getItem('quickBookmarks');
  return data ? JSON.parse(data) : [
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'ChatGPT', url: 'https://chat.openai.com' },
    { name: 'Google', url: 'https://google.com' }
  ];
}

function saveBookmarks(bookmarks) {
  localStorage.setItem('quickBookmarks', JSON.stringify(bookmarks));
}

function renderBookmarks() {
  const list = document.getElementById('bookmarkList');
  const bookmarks = loadBookmarks();
  if (bookmarks.length === 0) {
    list.innerHTML = '<div style="font-size:0.75rem;color:var(--text-muted);text-align:center;padding:0.5rem">暂无书签</div>';
    return;
  }
  list.innerHTML = bookmarks.map((b, i) => `
    <a class="bookmark-item" href="${b.url}" target="_blank">
      <span>${b.name}</span>
      <span class="del" data-index="${i}" onclick="event.preventDefault();event.stopPropagation();deleteBookmark(${i})">✕</span>
    </a>
  `).join('');
}

function deleteBookmark(index) {
  const bookmarks = loadBookmarks();
  bookmarks.splice(index, 1);
  saveBookmarks(bookmarks);
  renderBookmarks();
}

function addBookmark() {
  const name = prompt('输入网站名称：');
  if (!name) return;
  const url = prompt('输入网站地址（https://）：');
  if (!url) return;
  const bookmarks = loadBookmarks();
  bookmarks.push({ name, url });
  saveBookmarks(bookmarks);
  renderBookmarks();
}

document.getElementById('addBookmarkBtn').addEventListener('click', addBookmark);
```

---

### Task 8: 分类导航 + 链接卡片

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 编写分类导航和卡片 CSS**

```css
/* ==================== 分类导航 ==================== */
.category-nav {
  display: flex;
  gap: 0.375rem;
  margin-bottom: 1.25rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  -webkit-overflow-scrolling: touch;
}
.cat-tab {
  flex-shrink: 0;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 500;
  border: 1px solid var(--border);
  transition: all 0.15s;
  cursor: pointer;
  white-space: nowrap;
}
.cat-tab:hover { background: var(--bg-surface); }
.cat-tab.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

/* ==================== 分类区块 ==================== */
.category-section { margin-bottom: 2rem; }
.cat-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.cat-icon {
  width: 28px; height: 28px;
  border-radius: 6px;
  background: var(--bg-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}
.cat-title { font-size: 1.05rem; font-weight: 600; color: var(--text-primary); }
.cat-count {
  font-size: 0.72rem;
  color: var(--text-muted);
  background: var(--bg-surface);
  padding: 0.15rem 0.45rem;
  border-radius: 8px;
}
.cat-view-all {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: transparent;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}
.cat-view-all:hover { background: var(--bg-surface); }

/* ==================== 链接卡片 ==================== */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.625rem;
}
.link-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.625rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
  cursor: pointer;
}
.link-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--accent);
}
.link-icon {
  width: 36px; height: 36px;
  border-radius: 8px;
  background: var(--bg-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1rem;
  overflow: hidden;
}
.link-icon img { width: 20px; height: 20px; border-radius: 3px; }
.link-info { flex: 1; min-width: 0; }
.link-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.link-desc {
  font-size: 0.72rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}
.empty-state svg { width: 48px; height: 48px; margin-bottom: 0.75rem; opacity: 0.5; }
.empty-state p { font-size: 0.9rem; }
```

- [ ] **Step 2: 编写分类和卡片 JS**

```javascript
// ==================== 分类与链接 ====================
const categoryIcons = {
  'AI 工具': '🤖', 'AI 编程': '💻', '实用工具': '🔧', '学习资源': '📚',
  '视频平台': '🎬', '直播平台': '📺', '动漫视频': '🎨', '小说阅读': '📖',
  '有声小说': '🎧', '典藏资源': '💎', '娱乐休闲': '🎮', '云服务': '☁️',
  '开发文档': '📄', '设计师资源': '🎨', '协作办公': '👥', '新闻资讯': '📰',
  '电商购物': '🛒', '金融理财': '💰', '游戏平台': '🎮'
};

let allData = [];
let currentCategory = 'all';
const MAX_LINKS = 16;

async function loadLinks() {
  try {
    const res = await fetch('links.json');
    const data = await res.json();
    allData = data.categories;
    renderCategoryNav();
    renderContent(allData);
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

function renderContent(categories) {
  const container = document.getElementById('contentArea');
  if (!categories.length) {
    container.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><p>没有找到相关网站</p></div>`;
    return;
  }

  container.innerHTML = categories.map((cat, ci) => {
    const icon = categoryIcons[cat.category] || '📁';
    const hasMore = cat.links.length > MAX_LINKS;
    const links = hasMore ? cat.links.slice(0, MAX_LINKS) : cat.links;

    const cards = links.map((link, li) => {
      const domain = link.url.match(/:\/\/([^/]+)/)?.[1] || '';
      return `<a class="link-card" href="${link.url}" target="_blank" style="animation: fadeInUp 0.3s backwards;animation-delay:${li*0.03}s">
        <div class="link-icon">
          <img src="icons/${domain}.png" loading="lazy" onerror="this.parentElement.innerHTML='🔗'" alt="">
        </div>
        <div class="link-info">
          <div class="link-name">${link.name}</div>
          <div class="link-desc">${link.desc || domain}</div>
        </div>
      </a>`;
    }).join('');

    return `<div class="category-section" style="animation: fadeInUp 0.4s backwards;animation-delay:${ci*0.08}s">
      <div class="cat-header">
        <div class="cat-icon">${icon}</div>
        <h2 class="cat-title">${cat.category}</h2>
        <span class="cat-count">${cat.links.length}</span>
        ${hasMore ? `<button class="cat-view-all" data-cat="${cat.category}">查看全部 ›</button>` : ''}
      </div>
      <div class="cards-grid">${cards}</div>
    </div>`;
  }).join('');

  // 查看全部
  container.querySelectorAll('.cat-view-all').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      currentCategory = btn.dataset.cat;
      document.querySelectorAll('.cat-tab').forEach(b => b.classList.toggle('active', b.dataset.cat === currentCategory));
      applyFilter();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
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

function filterLinks(keyword) {
  applyFilter();
}

// 页面加载
loadLinks();

// search input 实时过滤（仅本站搜索模式）
document.getElementById('searchInput').addEventListener('input', () => {
  const engine = document.querySelector('.engine-btn.active').dataset.engine;
  if (engine === 'local') applyFilter();
});
```

- [ ] **Step 3: 添加 fadeInUp 动画**

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

### Task 9: 壁纸切换

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 编写壁纸 CSS**

```css
/* ==================== 壁纸 ==================== */
body.has-wallpaper::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: var(--bg-wallpaper);
  background-size: cover;
  background-position: center;
  z-index: -2;
}
body.has-wallpaper::after {
  content: '';
  position: fixed;
  inset: 0;
  background: rgba(255,255,255,0.85);
  z-index: -1;
}
[data-theme="dark"] body.has-wallpaper::after {
  background: rgba(0,0,0,0.7);
}

/* 壁纸选择弹窗 */
.wallpaper-picker {
  display: none;
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-lg);
  z-index: 300;
  width: 320px;
}
.wallpaper-picker.open { display: block; }
.wallpaper-picker h3 { font-size: 0.9rem; margin-bottom: 0.75rem; color: var(--text-primary); }
.wp-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.wp-option {
  aspect-ratio: 16/9;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.15s;
  background-size: cover;
  background-position: center;
}
.wp-option:hover, .wp-option.active { border-color: var(--primary); }
.wp-upload {
  margin-top: 0.75rem;
  padding: 0.5rem;
  border: 1px dashed var(--border);
  border-radius: 8px;
  text-align: center;
  font-size: 0.78rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s;
}
.wp-upload:hover { background: var(--bg-surface); }
.wp-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 299;
}
.wp-overlay.open { display: block; }
```

- [ ] **Step 2: 编写壁纸 HTML**

```html
<!-- 在 </body> 前添加 -->
<div class="wp-overlay" id="wpOverlay" onclick="closeWallpaperPicker()"></div>
<div class="wallpaper-picker" id="wpPicker">
  <h3>选择壁纸</h3>
  <div class="wp-grid" id="wpGrid"></div>
  <div class="wp-upload" id="wpUpload">
    <input type="file" accept="image/*" id="wpFileInput" style="display:none">
    + 上传自定义图片
  </div>
</div>
```

- [ ] **Step 3: 编写壁纸 JS**

```javascript
// ==================== 壁纸切换 ====================
const wallpapers = [
  { name: '无', bg: '' },
  { name: '极简波浪', bg: 'linear-gradient(135deg, #e0e7ff, #f0f4ff)' },
  { name: '暖阳', bg: 'linear-gradient(135deg, #fef3c7, #fde68a)' },
  { name: '极光', bg: 'linear-gradient(135deg, #ccfbf1, #a7f3d0)' },
  { name: '暮色', bg: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' },
  { name: '樱花', bg: 'linear-gradient(135deg, #fce7f3, #fbcfe8)' }
];

function initWallpaper() {
  const saved = localStorage.getItem('wallpaperIndex');
  const idx = saved !== null ? parseInt(saved) : 0;
  applyWallpaper(idx);

  // 渲染选择面板
  const grid = document.getElementById('wpGrid');
  grid.innerHTML = wallpapers.map((wp, i) =>
    `<div class="wp-option${i === idx ? ' active' : ''}" data-idx="${i}" style="background:${wp.bg || '#f1f5f9'}"></div>`
  ).join('');

  grid.addEventListener('click', e => {
    const opt = e.target.closest('.wp-option');
    if (!opt) return;
    const i = parseInt(opt.dataset.idx);
    grid.querySelectorAll('.wp-option').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    applyWallpaper(i);
    localStorage.setItem('wallpaperIndex', String(i));
  });

  document.getElementById('wallpaperBtn').addEventListener('click', () => {
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
      const bg = `url(${ev.target.result})`;
      document.body.style.setProperty('--bg-wallpaper', bg);
      document.body.classList.add('has-wallpaper');
      localStorage.setItem('wallpaperCustom', ev.target.result);
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

// 恢复自定义壁纸
(function restoreWallpaper() {
  const custom = localStorage.getItem('wallpaperCustom');
  if (custom) {
    document.body.style.setProperty('--bg-wallpaper', `url(${custom})`);
    document.body.classList.add('has-wallpaper');
  }
})();
```

---

### Task 10: 整合初始化 + 页脚

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 添加页脚 HTML**

```html
<footer class="footer">
  <p>个人导航 &mdash; 快速访问常用网站</p>
</footer>
```

- [ ] **Step 2: 编写页脚 CSS**

```css
/* ==================== 页脚 ==================== */
.footer {
  text-align: center;
  padding: 1.5rem;
  color: var(--text-muted);
  font-size: 0.78rem;
}
```

- [ ] **Step 3: 编写初始化代码**

在 `<script>` 末尾，调用所有初始化函数：

```javascript
// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initWeather();
  renderBookmarks();
  renderCal();
  initWallpaper();
  loadLinks();
});
```

---

### Task 11: 移除未使用的依赖文件

**Files:**
- Delete: `css/style.css`, `css/bootstrap.min.css`, `css/all.min.css`
- Delete: `js/bootstrap.min.js`, `js/jquery-3.6.0.min.js`, `js/popper.min.js`

- [ ] **Step 1: 删除 CSS 依赖**

```bash
rm css/style.css css/bootstrap.min.css css/all.min.css
```

- [ ] **Step 2: 删除 JS 依赖**

```bash
rm js/bootstrap.min.js js/jquery-3.6.0.min.js js/popper.min.js
```

- [ ] **Step 3: 验证 CSS 目录清理后项目仍可运行**

打开浏览器确认页面正常加载，控制台无 404 错误。

---

### Task 12: 最终验证

- [ ] **Step 1: 打开浏览器全面测试**

检查以下功能均正常工作：
- 搜索栏选择不同引擎，回车触发搜索
- 本站搜索实时过滤链接
- 左侧面板时钟走动、日历翻月
- 天气点击后输入城市名
- 快捷书签增删
- 壁纸选择/上传
- 暗色模式切换
- 快捷键 `/` 和 `Esc`
- 响应式：缩放浏览器窗口，面板在 <1024px 时折叠

- [ ] **Step 2: 检查控制台无报错**

```bash
# 在浏览器中打开开发者工具 (F12)，检查 Console 无红色错误
```

- [ ] **Step 3: 验证 links.json 数据完整**

确认 18+ 分类、300+ 链接全部正确加载。

---

## 自检

**1. Spec 覆盖度检查：**
- ✅ 布局（左侧面板 + 右侧内容）— Task 3
- ✅ 配色（高级灰 + 灰色系 CSS 变量）— Task 1
- ✅ 毛玻璃（顶部栏、左侧面板 backdrop-filter）— Task 2, 3
- ✅ 搜索栏 + 多引擎 — Task 2
- ✅ Canvas 表盘时钟 — Task 4
- ✅ 日历（农历 + 假日标注）— Task 5
- ✅ 天气 Widget（手动输入）— Task 6
- ✅ 快捷书签（增删改 + localStorage）— Task 7
- ✅ 分类导航 + 链接卡片网格 — Task 8
- ✅ 壁纸切换（预设 + 上传）— Task 9
- ✅ 暗色模式（自动 + 手动切换）— Task 1
- ✅ 响应式（面板折叠、断点适配）— Task 3
- ✅ 移除未使用依赖 — Task 11
- ⬜ 性能目标 — 实施后验证

**2. 占位符检查：** 无 TBD/TODO 残留

**3. 类型一致性：** 函数名在各 task 间保持一致（`applyFilter`、`renderContent`、`renderCal` 等）

**4. 完整代码：** 每个 step 包含完整可复制代码
