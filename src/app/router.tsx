import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { ROUTES } from '@/constants'
import { env } from '@/lib/env'
import { HomePage } from '@/pages/HomePage'
import { MarketsPage } from '@/pages/MarketsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { RouteErrorPage } from '@/pages/RouteErrorPage'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppLayout />,
      errorElement: <RouteErrorPage />,
      children: [
        { index: true, element: <HomePage /> },
        { path: ROUTES.markets.slice(1), element: <MarketsPage /> },
        { path: ROUTES.portfolio.slice(1), element: <PortfolioPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  {
    basename: env.BASE_URL === '/' ? undefined : env.BASE_URL.replace(/\/$/, ''),
  },
)
