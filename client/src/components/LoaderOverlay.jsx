import React from 'react'

export default function LoaderOverlay({ message = 'Loading…' }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/70 backdrop-blur-[1px] z-10" role="alert" aria-busy="true">
      <div className="flex items-center gap-3">
        <span className="loader-ring" aria-hidden="true"></span>
        <span className="text-sm font-medium text-gray-700">{message}</span>
      </div>
      <div className="w-48 h-2 rounded-full overflow-hidden bg-gray-200">
        <div className="h-full w-1/2 shimmer rounded-full"></div>
      </div>
      <div className="text-[11px] text-gray-500">Optimizing preview • secure rendering</div>
    </div>
  )
}


