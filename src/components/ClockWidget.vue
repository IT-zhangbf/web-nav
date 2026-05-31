<template>
  <div class="clock-container">
    <canvas ref="canvasRef" width="200" height="200"></canvas>
    <div class="clock-date" ref="dateRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const dateRef = ref(null)
let timer = null

function drawClock() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const W = 200, H = 200, CX = 100, CY = 100, R = 85
  const now = new Date()
  const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds()

  ctx.clearRect(0, 0, W, H)

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  const bg = isDark ? 'rgba(30, 27, 60, 0.5)' : 'rgba(255, 255, 255, 0.3)'
  const border = isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'
  const tick = isDark ? 'rgba(155, 151, 176, 0.5)' : 'rgba(99, 102, 241, 0.25)'
  const text = isDark ? '#e8e6f0' : '#1e1b4b'
  const hourHand = isDark ? '#c7c4e0' : '#3730a3'
  const minHand = isDark ? '#9b97b0' : '#6366f1'

  ctx.beginPath()
  ctx.arc(CX, CY, R, 0, Math.PI * 2)
  ctx.fillStyle = bg
  ctx.fill()
  ctx.strokeStyle = border
  ctx.lineWidth = 1.5
  ctx.stroke()

  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2 - Math.PI / 2
    const len = i % 5 === 0 ? 10 : 5
    const outer = R - 3
    ctx.strokeStyle = tick
    ctx.lineWidth = i % 5 === 0 ? 2 : 1
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(CX + Math.cos(angle) * (outer - len), CY + Math.sin(angle) * (outer - len))
    ctx.lineTo(CX + Math.cos(angle) * outer, CY + Math.sin(angle) * outer)
    ctx.stroke()
  }

  ctx.fillStyle = text
  ctx.font = 'bold 12px -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 1; i <= 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
    ctx.fillText(i, CX + Math.cos(angle) * (R - 17), CY + Math.sin(angle) * (R - 17))
  }

  const hAngle = ((h + m / 60) / 12) * Math.PI * 2 - Math.PI / 2
  ctx.strokeStyle = hourHand
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(CX, CY)
  ctx.lineTo(CX + Math.cos(hAngle) * 38, CY + Math.sin(hAngle) * 38)
  ctx.stroke()

  const mAngle = (m / 60) * Math.PI * 2 - Math.PI / 2
  ctx.strokeStyle = minHand
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(CX, CY)
  ctx.lineTo(CX + Math.cos(mAngle) * 55, CY + Math.sin(mAngle) * 55)
  ctx.stroke()

  const sAngle = (s / 60) * Math.PI * 2 - Math.PI / 2
  ctx.strokeStyle = '#06b6d4'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(CX - Math.cos(sAngle) * 12, CY - Math.sin(sAngle) * 12)
  ctx.lineTo(CX + Math.cos(sAngle) * 65, CY + Math.sin(sAngle) * 65)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(CX, CY, 3, 0, Math.PI * 2)
  ctx.fillStyle = '#6366f1'
  ctx.fill()

  if (dateRef.value) {
    const ds = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
    dateRef.value.textContent = ds
  }
}

onMounted(() => {
  drawClock()
  timer = setInterval(drawClock, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.clock-container { text-align: center; }

canvas {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  display: block;
  margin: 0 auto;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.08), inset 0 0 15px rgba(99, 102, 241, 0.04);
}

.clock-date {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 0.375rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}
</style>
