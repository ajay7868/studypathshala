import { useCallback, useEffect, useState } from 'react'
import { API_URL } from '../lib/env.js'
import LoaderOverlay from './LoaderOverlay.jsx'

export default function ImageReader({ bookId, token }) {
  const [page, setPage] = useState(1)
  const [imgUrl, setImgUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (p) => {
    setLoading(true)
    setError('')
    const url = `${API_URL}/api/books/${bookId}/page/${p}.png`
    const src = `${url}?t=${encodeURIComponent(token || '')}&_=${Date.now()}`
    setImgUrl(src)
  }, [bookId, token])

  useEffect(() => { load(page) }, [page, load])

  return (
    <div className="not-prose select-none">
      <style>{`@media print { body { display:none !important } }`}</style>
      <div className="flex items-center gap-2 mb-2">
        <button className="btn btn-sm" onClick={()=> setPage(p=> Math.max(1, p-1))}>Prev</button>
        <span>Page {page}</span>
        <button className="btn btn-sm" onClick={()=> setPage(p=> p+1)}>Next</button>
      </div>
      <div className="relative bg-white border rounded-lg p-2 min-h-[300px]">
        {loading && <LoaderOverlay message="Rendering page…" />}
        {error && <div className="text-error text-sm">{error}</div>}
        {imgUrl && (
          <img
            src={imgUrl}
            alt="page"
            className="w-full max-w-[900px] mx-auto block rounded bg-white pointer-events-none select-none"
            draggable={false}
            crossOrigin="anonymous"
            onLoad={() => setLoading(false)}
            onError={() => { setError('Failed to load image'); setLoading(false) }}
          />
        )}
        <div className="absolute bottom-2 right-4 text-xs opacity-60">Preview • {new Date().toLocaleDateString()}</div>
      </div>
      {/* <p className="text-sm opacity-70 mt-2">Watermarked preview. Download/print disabled.</p> */}
      {/* {imgUrl && (
        <div className="mt-1 text-xs text-gray-500 break-all">Source: {imgUrl}</div>
      )} */}
    </div>
  )
}

