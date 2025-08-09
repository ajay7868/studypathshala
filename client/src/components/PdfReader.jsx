import { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker'
import LoaderOverlay from './LoaderOverlay.jsx'

// Use dedicated web worker instance (recommended for Vite)
pdfjs.GlobalWorkerOptions.workerPort = new PdfWorker()

export default function PdfReader({ fileUrl }) {
  const [numPages, setNumPages] = useState()
  const [error, setError] = useState('')
  useEffect(() => {
    // Disable right-click context menu to discourage easy saving
    const handler = (e) => e.preventDefault()
    document.addEventListener('contextmenu', handler)
    return () => document.removeEventListener('contextmenu', handler)
  }, [])

  return (
    <div className="not-prose select-none" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
      <style>
        {`@media print { body { display: none !important; } }`}
      </style>
      <Document
        file={{ url: fileUrl, withCredentials: false }}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={(e) => setError('Failed to load PDF')}
        loading={
          <div className="relative min-h-[300px]">
            <LoaderOverlay message="Loading PDF…" />
          </div>
        }
      > 
        <Page 
          pageNumber={1} 
          width={900} 
          renderTextLayer 
          renderAnnotationLayer 
          loading={
            <div className="relative min-h-[300px]">
              <LoaderOverlay message="Rendering page…" />
            </div>
          }
        />
      </Document>
      {numPages && <p className="mt-2 text-xs opacity-60">Pages: {numPages} (preview page 1 shown)</p>}
      {error && <p className="mt-2 text-error text-sm">{error}</p>}
      <p className="mt-2 text-sm opacity-70">Preview only. Printing and downloading are disabled.</p>
    </div>
  )
}

