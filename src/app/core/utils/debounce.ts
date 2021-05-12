const memory = new Map<Function, number>()

export const clear = (fn: (...args: any[]) => any) => {
  if (memory.has(fn)) {
    const id = memory.get(fn)
    if (!id) {
      throw new Error('No timer!')
    }
    clearTimeout(id)
  }
}

export default (
  fn: (...args: any[]) => any | void,
  ms: number = 100,
  setTimeout: any = global.setTimeout,
) => {
  return (...args: any[]) => {
    clear(fn)
    const id: any = setTimeout(() => {
      fn(...args)
      memory.delete(fn)
    }, ms)
    memory.set(fn, id)
  }
}
