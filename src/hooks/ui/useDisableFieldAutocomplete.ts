import { useEffect } from 'react'

const FIELD_SELECTOR = 'input, textarea, select'

function isField(
  node: EventTarget | Node | null,
): node is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  return (
    node instanceof HTMLInputElement ||
    node instanceof HTMLTextAreaElement ||
    node instanceof HTMLSelectElement
  )
}

/** Strip browser autocomplete / suggestion affordances from a field. */
export function disableFieldAutocomplete(el: Element): void {
  if (!isField(el)) return

  el.setAttribute('autocomplete', 'off')
  el.setAttribute('autocorrect', 'off')
  el.setAttribute('autocapitalize', 'off')
  el.setAttribute('spellcheck', 'false')

  // Password managers sometimes ignore `off` unless the name is non-standard.
  if (el instanceof HTMLInputElement) {
    const type = (el.getAttribute('type') || 'text').toLowerCase()
    if (type === 'password') {
      el.setAttribute('autocomplete', 'new-password')
    }
  }
}

function disableFormAutocomplete(el: Element): void {
  if (el instanceof HTMLFormElement) {
    el.setAttribute('autocomplete', 'off')
  }
}

function applyTree(root: ParentNode): void {
  if (root instanceof Element) {
    disableFormAutocomplete(root)
    disableFieldAutocomplete(root)
  }
  root.querySelectorAll?.('form').forEach(disableFormAutocomplete)
  root.querySelectorAll?.(FIELD_SELECTOR).forEach(disableFieldAutocomplete)
}

/**
 * App-wide: every current and future input/textarea/select gets
 * autocomplete / autocorrect / suggestions disabled.
 */
export function useDisableFieldAutocomplete(): void {
  useEffect(() => {
    applyTree(document)

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element || node instanceof DocumentFragment) {
            applyTree(node)
          }
        }
      }
    })

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    })

    // Re-assert on focus in case a library rewrites attributes after mount.
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target
      if (isField(target)) disableFieldAutocomplete(target)
      if (target instanceof Element) {
        const form = target.closest('form')
        if (form) disableFormAutocomplete(form)
      }
    }
    document.addEventListener('focusin', onFocusIn, true)

    return () => {
      observer.disconnect()
      document.removeEventListener('focusin', onFocusIn, true)
    }
  }, [])
}
