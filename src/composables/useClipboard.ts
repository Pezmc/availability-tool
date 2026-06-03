import { ref } from 'vue'

export function useClipboard() {
  const copied = ref(false)
  const error = ref(false)

  async function copyText(text: string): Promise<void> {
    error.value = false
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
    } catch {
      if (fallbackCopy(text)) {
        copied.value = true
      } else {
        error.value = true
        return
      }
    }
    setTimeout(() => { copied.value = false }, 2000)
  }

  function fallbackCopy(text: string): boolean {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      return document.execCommand('copy')
    } catch {
      return false
    } finally {
      document.body.removeChild(textarea)
    }
  }

  return { copied, error, copyText }
}
