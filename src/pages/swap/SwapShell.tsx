import { Outlet } from 'react-router-dom'

/**
 * Buy / Sell route shell. Product chrome (hero tabs) lives in each page view;
 * app chrome comes from `AppShell`.
 */
export function SwapShell() {
  return <Outlet />
}
