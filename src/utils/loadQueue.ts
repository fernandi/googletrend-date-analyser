type Task = () => Promise<void> | void

let running = false
const queue: Task[] = []
let spacingMs = 1500

export function configureQueue(options: { spacingMs?: number } = {}) {
  if (typeof options.spacingMs === 'number') spacingMs = options.spacingMs
}

export function schedule(task: Task) {
  queue.push(task)
  runNext()
}

async function runNext() {
  if (running) return
  const next = queue.shift()
  if (!next) return
  running = true
  try {
    await next()
  } finally {
    setTimeout(() => {
      running = false
      runNext()
    }, spacingMs)
  }
}



