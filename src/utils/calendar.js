import { Solar } from 'lunar-javascript'

export const WEEKDAYS = ['日','一','二','三','四','五','六']

// 使用 lunar-javascript 自动计算农历，支持任意年份，无需硬编码数据表
export function getLunarDate(year, month, day) {
  const lunar = Solar.fromYmd(year, month, day).getLunar()
  return {
    yearName: `${lunar.getYearInGanZhi()}年`,
    month: `${lunar.getMonthInChinese()}月`,
    day: lunar.getDayInChinese()
  }
}

let holidays = {}
let workdays = {}

const fallbackHolidays = {
  '2026-01-01': '元旦', '2026-01-02': '元旦', '2026-01-03': '元旦',
  '2026-02-15': '春节', '2026-02-16': '除夕', '2026-02-17': '春节', '2026-02-18': '春节',
  '2026-02-19': '春节', '2026-02-20': '春节', '2026-02-21': '春节', '2026-02-22': '春节', '2026-02-23': '春节',
  '2026-04-04': '清明', '2026-04-05': '清明', '2026-04-06': '清明',
  '2026-05-01': '劳动节', '2026-05-02': '劳动节', '2026-05-03': '劳动节', '2026-05-04': '劳动节', '2026-05-05': '劳动节',
  '2026-06-19': '端午', '2026-06-20': '端午', '2026-06-21': '端午',
  '2026-09-25': '中秋', '2026-09-26': '中秋', '2026-09-27': '中秋',
  '2026-10-01': '国庆', '2026-10-02': '国庆', '2026-10-03': '国庆', '2026-10-04': '国庆',
  '2026-10-05': '国庆', '2026-10-06': '国庆', '2026-10-07': '国庆'
}

const fallbackWorkdays = {
  '2026-01-04': '元旦调休上班',
  '2026-02-14': '春节调休上班', '2026-02-28': '春节调休上班',
  '2026-05-09': '劳动节调休上班',
  '2026-09-20': '国庆调休上班', '2026-10-10': '国庆调休上班'
}

holidays = { ...fallbackHolidays }
workdays = { ...fallbackWorkdays }

export async function fetchHolidays(year) {
  try {
    const res = await fetch(`https://timor.tech/api/holiday/year/${year}`, { cache: 'no-cache' })
    if (!res.ok) throw new Error('API unavailable')
    const data = await res.json()
    if (data.code === 0 && data.holiday) {
      const h = {}, w = {}
      for (const [date, info] of Object.entries(data.holiday)) {
        if (info.holiday) {
          h[date] = info.name
        } else {
          w[date] = info.name + '调休上班'
        }
      }
      holidays = h
      workdays = w
      return true
    }
  } catch {
    // use fallback
  }
  return false
}

export function getHoliday(dateStr) {
  return holidays[dateStr] || null
}

export function getWorkday(dateStr) {
  return workdays[dateStr] || null
}
