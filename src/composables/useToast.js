import { ref } from 'vue'

const messages = ref([])
let id = 0

export function useToast() {
  function show(message, duration = 2000) {
    const toastId = ++id
    messages.value.push({ id: toastId, message })
    setTimeout(() => {
      messages.value = messages.value.filter(m => m.id !== toastId)
    }, duration)
  }

  return { messages, show }
}
