import { isRouteErrorResponse, useRouteError, Link } from 'react-router-dom'

export default function ErrorPage() {
  const error = useRouteError()
  let title = 'Unexpected Application Error'
  let message = 'Something went wrong.'
  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`
    message = error.data || ''
  }
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 opacity-70">{message}</p>
      <Link to="/" className="btn btn-primary mt-6">Go Home</Link>
    </div>
  )
}

