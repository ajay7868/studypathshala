import { Link, useRouteError } from 'react-router-dom'

export default function NotFound() {
  const err = useRouteError?.() || {}
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold">404 Not Found</h1>
      <p className="mt-2 opacity-70">The page you are looking for does not exist.</p>
      {err?.statusText && <p className="mt-2 text-sm opacity-60">{err.statusText}</p>}
      <Link to="/" className="btn btn-primary mt-6">Go Home</Link>
    </div>
  )
}

