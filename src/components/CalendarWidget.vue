<template>
  <div class="cal-compact">
    <div class="cal-header">
      <button class="cal-nav-btn" @click="changeMonth(-1)">‹</button>
      <span class="cal-title cal-title-clickable" @click="showPicker = !showPicker">{{ calYear }}年{{ calMonth + 1 }}月</span>
      <button class="cal-nav-btn" @click="changeMonth(1)">›</button>
      <button class="cal-today-btn" @click="goToToday">↻ 今天</button>
    </div>
    <div class="cal-grid">
      <span v-for="w in weekdays" :key="w" class="weekday">{{ w }}</span>
      <span
        v-for="(day, i) in days"
        :key="i"
        class="day"
        :class="day.class"
        @click="selectDay(day)"
      >{{ day.label }}<span v-if="day.lunar" class="day-lunar">{{ day.lunar }}</span></span>
    </div>
    <div v-if="selected" class="cal-detail">
      <div class="cal-detail-date">{{ selected.year }}年{{ selected.month }}月{{ selected.day }}日 星期{{ weekdays[selected.dow] }}</div>
      <div v-if="selected.lunar" class="cal-detail-lunar">{{ selected.lunar.yearName }} {{ selected.lunar.month }}月{{ selected.lunar.day }}</div>
      <span class="cal-detail-holiday">{{ selected.holidayText }}</span>
    </div>
    <div v-else class="cal-detail-today">{{ todayLunarText }}</div>
    <div v-if="todayHolidayText" class="cal-detail-today-holiday">{{ todayHolidayText }}</div>
  </div>

  <Teleport to="body">
    <div v-if="showPicker" class="cal-overlay" @click.self="showPicker = false">
      <div class="cal-popup">
        <div class="cal-picker-header">
          <button class="cal-picker-nav" @click="pickerYear--">‹‹</button>
          <span class="cal-picker-year">{{ pickerYear }}</span>
          <button class="cal-picker-nav" @click="pickerYear++">››</button>
        </div>
        <div class="cal-picker-grid">
          <span
            v-for="m in 12"
            :key="m"
            class="cal-picker-month"
            :class="{ active: m === calMonth + 1 && pickerYear === calYear }"
            @click="setYearMonth(pickerYear, m)"
          >{{ m }}月</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { getLunarDate, getHoliday, getWorkday, WEEKDAYS, fetchHolidays } from '../utils/calendar'

const today = new Date()
const calYear = ref(today.getFullYear())
const calMonth = ref(today.getMonth())
const selected = ref(null)
const showPicker = ref(false)
const pickerYear = ref(today.getFullYear())
const weekdays = WEEKDAYS

const todayStr = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
})

const todayLunarText = computed(() => {
  const d = new Date()
  const lunar = getLunarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
  return lunar ? `${lunar.yearName} ${lunar.month}月${lunar.day}` : ''
})

const todayHolidayText = computed(() => {
  const h = getHoliday(todayStr.value)
  if (h) return `🎉 ${h}`
  const w = getWorkday(todayStr.value)
  if (w) return `⚠️ ${w}`
  return ''
})

const days = computed(() => {
  const y = calYear.value, m = calMonth.value
  const first = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const prevDays = new Date(y, m, 0).getDate()
  const result = []

  for (let i = first - 1; i >= 0; i--) {
    result.push({ label: String(prevDays - i), class: 'day other', lunar: null })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const isToday = ds === todayStr.value
    const h = getHoliday(ds)
    const w = getWorkday(ds)
    const dow = new Date(y, m, d).getDay()
    const lunar = getLunarDate(y, m + 1, d)
    let cls = 'day'
    if (isToday) cls += ' today'
    if (h) cls += ' holiday'
    else if (w) cls += ' workday'
    else if (dow === 0 || dow === 6) cls += ' weekend'
    if (selected.value && selected.value.year === y && selected.value.month === m + 1 && selected.value.day === d) cls += ' selected'
    result.push({ label: String(d), class: cls, lunar: lunar ? lunar.day : null, fullDate: ds, holiday: h, workday: w, year: y, month: m + 1, day: d, dow })
  }

  const total = first + daysInMonth
  const rem = total <= 35 ? 35 - total : 42 - total
  for (let i = 1; i <= rem; i++) {
    result.push({ label: String(i), class: 'day other', lunar: null })
  }

  return result
})

function changeMonth(delta) {
  calMonth.value += delta
  if (calMonth.value > 11) { calMonth.value = 0; calYear.value++ }
  if (calMonth.value < 0) { calMonth.value = 11; calYear.value-- }
  selected.value = null
}

function selectDay(day) {
  if (day.class.includes('other')) return
  const lunar = getLunarDate(day.year, day.month, day.day)
  const h = day.holiday || getHoliday(day.fullDate)
  const w = day.workday || getWorkday(day.fullDate)
  let holidayText = '无'
  if (h) holidayText = `🎉 ${h}`
  else if (w) holidayText = `⚠️ ${w}`
  selected.value = { year: day.year, month: day.month, day: day.day, dow: day.dow, lunar, holidayText }
}

function goToToday() {
  const d = new Date()
  calYear.value = d.getFullYear()
  calMonth.value = d.getMonth()
  selected.value = null
  showPicker.value = false
}

function setYearMonth(year, month) {
  calYear.value = year
  calMonth.value = month - 1
  selected.value = null
  showPicker.value = false
}

function onHolidaysUpdate() {
  // force re-render by triggering reactivity
  calYear.value = calYear.value
}

onMounted(() => {
  window.addEventListener('holidays-updated', onHolidaysUpdate)
})

onUnmounted(() => {
  window.removeEventListener('holidays-updated', onHolidaysUpdate)
})
</script>

<style scoped>
.cal-compact { font-size: 0.78rem; }

.cal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.cal-title { font-weight: 600; font-size: 0.85rem; color: var(--text-primary); letter-spacing: -0.01em; }
.cal-title-clickable { cursor: pointer; transition: color 0.2s; }
.cal-title-clickable:hover { color: var(--primary); }

.cal-today-btn {
  font-size: 0.62rem;
  padding: 0.2rem 0.45rem;
  border-radius: var(--radius-full);
  background: var(--bg-glass);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1.4;
  border: 1px solid var(--border);
}

.cal-today-btn:hover { background: var(--primary); color: #fff; border-color: var(--primary); }

.cal-nav-btn {
  width: 24px; height: 24px;
  border-radius: var(--radius-full);
  background: var(--bg-glass);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: var(--text-secondary);
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  line-height: 1;
  border: 1px solid var(--border);
}

.cal-nav-btn:hover { background: var(--primary); color: #fff; border-color: var(--primary); }

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  text-align: center;
}

.cal-grid .weekday {
  font-size: 0.68rem;
  color: var(--text-muted);
  padding: 3px 0;
  font-weight: 500;
}

.cal-grid .day {
  padding: 3px 0;
  border-radius: 6px;
  font-size: 0.73rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  line-height: 1.3;
}

.cal-grid .day:hover { background: var(--bg-glass); }
.cal-grid .day.other { color: var(--text-muted); opacity: 0.3; cursor: default; }
.cal-grid .day.other:hover { background: transparent; }

.cal-grid .day.today {
  background: var(--gradient-primary);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 8px var(--primary-glow);
}

.cal-grid .day.holiday { color: #ef4444; }
.cal-grid .day.holiday.today { color: #fff; }
.cal-grid .day.weekend:not(.holiday):not(.today) { color: #10b981; }
.cal-grid .day.workday { background: rgba(239,68,68,0.08); }

.cal-grid .day.selected {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
  border-radius: 6px;
  box-shadow: 0 0 8px var(--primary-glow);
}

.day-lunar {
  display: block;
  font-size: 0.52rem;
  opacity: 0.55;
  line-height: 1;
  margin-top: 0.5px;
}

.day.today .day-lunar { opacity: 0.85; }

.cal-detail {
  margin-top: 0.625rem;
  padding-top: 0.625rem;
  border-top: 1px solid var(--border);
  text-align: center;
}

.cal-detail-date {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.cal-detail-lunar {
  font-size: 0.78rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-top: 0.2rem;
  font-weight: 500;
}

.cal-detail-holiday {
  font-size: 0.72rem;
  color: var(--text-secondary);
  margin-top: 0.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  background: var(--bg-glass);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: inline-block;
  border: 1px solid var(--border);
}

.cal-detail-today {
  font-size: 0.72rem;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 0.375rem;
  padding-top: 0.375rem;
  border-top: 1px solid var(--border);
}

.cal-detail-today-holiday {
  font-size: 0.7rem;
  color: #ef4444;
  text-align: center;
  margin-top: 0.125rem;
}

.cal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.25);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cal-popup {
  background: var(--bg-glass-strong);
  backdrop-filter: blur(var(--glass-blur-strong)) saturate(1.6);
  -webkit-backdrop-filter: blur(var(--glass-blur-strong)) saturate(1.6);
  border-radius: var(--radius-lg);
  padding: 1.5rem 1.75rem;
  min-width: 220px;
  box-shadow: var(--shadow-lg), var(--shadow-glow);
  text-align: center;
  border: 1px solid var(--border-glass);
}

.cal-picker-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.cal-picker-year {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  min-width: 3rem;
  text-align: center;
}

.cal-picker-nav {
  width: 28px; height: 28px;
  border-radius: var(--radius-full);
  background: var(--bg-glass);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: var(--text-secondary);
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid var(--border);
  transition: all 0.2s;
}

.cal-picker-nav:hover { background: var(--primary); color: #fff; border-color: var(--primary); }

.cal-picker-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.cal-picker-month {
  padding: 0.4rem 0;
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  border: 1px solid var(--border);
}

.cal-picker-month:hover { background: var(--bg-glass); border-color: var(--primary-light); color: var(--primary); }

.cal-picker-month.active {
  background: var(--gradient-primary);
  color: #fff;
  border-color: transparent;
  box-shadow: var(--shadow-glow);
}
</style>
