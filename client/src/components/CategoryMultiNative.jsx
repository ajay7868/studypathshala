import React, { useEffect, useMemo, useState } from 'react'

export default function CategoryMultiNative({ name = 'categories', options = [], defaultValue }) {
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState(() => (Array.isArray(defaultValue) ? defaultValue.filter(v => options.includes(v)) : []))
  const [otherChecked, setOtherChecked] = useState(false)
  const [otherValue, setOtherValue] = useState('')

  // Sync only when provided defaultValue meaningfully changes
  useEffect(() => {
    if (!Array.isArray(defaultValue)) return
    const inOptions = defaultValue.filter(v => options.includes(v))
    const unknown = defaultValue.filter(v => !options.includes(v))
    setSelected((prev) => {
      const prevKey = prev.join('\u001F')
      const nextKey = inOptions.join('\u001F')
      return prevKey !== nextKey ? [...inOptions] : prev
    })
    if (unknown.length > 0) {
      setOtherChecked(true)
      setOtherValue(unknown[0])
    }
  }, [JSON.stringify(defaultValue), JSON.stringify(options)])

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    return q ? options.filter(o => o.toLowerCase().includes(q)) : options
  }, [filter, options])

  const effectiveSelected = useMemo(() => {
    const out = [...selected]
    const custom = otherValue.trim()
    if (otherChecked && custom.length > 0) out.push(custom)
    return out
  }, [selected, otherChecked, otherValue])

  return (
    <div className="w-full">
      <input type="hidden" name={name} value={effectiveSelected.join(',')} />
      <div className="flex items-center gap-2 mb-2">
        <input
          className="input input-bordered input-sm w-full"
          placeholder="Search categories…"
          value={filter}
          onChange={(e)=> setFilter(e.target.value)}
        />
        <button type="button" className="btn btn-sm" onClick={()=> setFilter('')}>Clear</button>
      </div>
      <div className="flex items-center gap-2 mb-2 text-xs">
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={() => setSelected(prev => Array.from(new Set([...prev, ...filtered])))}
        >
          Select all (filtered)
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={() => { setSelected([]); setOtherChecked(false); setOtherValue('') }}
        >
          Clear all
        </button>
        <span className="opacity-60">Selected: {effectiveSelected.length}</span>
      </div>
      <div className="max-h-56 overflow-auto rounded-lg border border-base-300 p-2 space-y-1">
        {/* Other option */}
        <div className="px-2 py-1 rounded">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={otherChecked}
              onChange={(e) => setOtherChecked(e.target.checked)}
            />
            <span className="text-sm font-medium">Other</span>
          </label>
          {otherChecked && (
            <div className="mt-2 pl-7">
              <input
                className="input input-bordered input-sm w-full"
                placeholder="Custom category name"
                value={otherValue}
                onChange={(e) => setOtherValue(e.target.value)}
              />
            </div>
          )}
        </div>
        {filtered.length === 0 ? (
          <div className="px-2 py-3 text-sm opacity-70">No matches</div>
        ) : (
          filtered.map(opt => (
            <label key={opt} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-base-200 cursor-pointer select-none">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={selected.includes(opt)}
                onChange={() => setSelected(prev => prev.includes(opt) ? prev.filter(v => v !== opt) : [...prev, opt])}
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))
        )}
      </div>
    </div>
  )
}


