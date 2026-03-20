
function createToastStore() {
  let toasts = $state([])

  function add(message, type = 'info', duration = 3500) {
    const id = Date.now()
    toasts = [...toasts, { id, message, type }]
    setTimeout(() => remove(id), duration)
  }

  function remove(id) {
    toasts = toasts.filter(t => t.id !== id)
  }

  return {
    get list() { return toasts },
    success: (msg) => add(msg, 'success'),
    error: (msg) => add(msg, 'error'),
    info: (msg) => add(msg, 'info'),
    remove
  }
}

export const toasts = createToastStore()
