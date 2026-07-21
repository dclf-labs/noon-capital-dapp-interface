import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants'

export function RouteErrorPage() {
  const error = useRouteError()

  let title = 'Unexpected error'
  let description = 'An unexpected error occurred while loading this page.'

  if (isRouteErrorResponse(error)) {
    title = error.status === 404 ? 'Page not found' : `Error ${error.status}`
    description = error.statusText || description
  } else if (error instanceof Error) {
    description = error.message
  }

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button asChild>
        <Link to={ROUTES.home}>Back to home</Link>
      </Button>
    </div>
  )
}
