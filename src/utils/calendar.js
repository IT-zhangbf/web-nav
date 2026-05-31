export const WEEKDAYS = ['日','一','二','三','四','五','六']

export const lunarDays = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十']

export const LUNAR_DATA = [
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
]

export function getLunarDate(year, month, day) {
  const date = new Date(year, month - 1, day)
  for (let i = LUNAR_DATA.length - 1; i >= 0; i--) {
    const [y, m, d, yrName, monName, days] = LUNAR_DATA[i]
    const start = new Date(y, m - 1, d)
    if (date >= start) {
      const diff = Math.floor((date - start) / 86400000)
      if (diff < days) {
        let yearName = yrName
        if (!yearName) {
          for (let j = i; j >= 0; j--) {
            if (LUNAR_DATA[j][3]) { yearName = LUNAR_DATA[j][3]; break }
          }
        }
        return { yearName, month: monName, day: lunarDays[diff] }
      }
    }
  }
  return null
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
