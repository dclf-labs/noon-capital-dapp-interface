import { useDisableFieldAutocomplete } from '@/hooks/ui/useDisableFieldAutocomplete'

/** Mount once under app providers — enforces no autocomplete on all fields. */
export function DisableFieldAutocomplete() {
  useDisableFieldAutocomplete()
  return null
}
