import React, { useEffect, useMemo, useRef, useState } from 'react'

export default function MultiSelect({ name, options = [], defaultValue = [], placeholder = 'Select…' }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(Array.isArray(defaultValue) ? [...defaultValue] : [])
  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setSelected(Array.isArray(defaultValue) ? [...defaultValue] : [])
  }, [defaultValue])

  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return options
      .filter(o => !selected.includes(o))
      .filter(o => (q ? o.toLowerCase().includes(q) : true))
  }, [options, query, selected])

  function add(value) {
    if (!selected.includes(value)) setSelected(prev => [...prev, value])
    setQuery('')
    setOpen(true)
    inputRef.current?.focus()
  }

  function remove(value) {
    setSelected(prev => prev.filter(v => v !== value))
    inputRef.current?.focus()
  }

  function onKeyDown(e) {
    if (e.key === 'Backspace' && query === '' && selected.length > 0) {
      e.preventDefault()
      setSelected(prev => prev.slice(0, -1))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[0]) add(filtered[0])
    }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="relative w-full" ref={wrapRef} onMouseDownCapture={(e)=> e.stopPropagation()}>
      <input type="hidden" name={name} value={selected.join(',')} />
      <div
        tabIndex={0}
        className="input input-bordered min-h-12 flex items-center gap-2 w-full cursor-text"
        onClick={() => { setOpen(true); inputRef.current?.focus() }}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className="flex flex-wrap items-center gap-1">
          {selected.map(v => (
            <span key={v} className="badge badge-primary gap-1">
              {v}
              <button type="button" className="ml-1 opacity-80 hover:opacity-100" onClick={() => remove(v)} aria-label={`Remove ${v}`}>
                ✕
              </button>
            </span>
          ))}
        </div>
        <input
          ref={inputRef}
          className="grow bg-transparent outline-none"
          placeholder={selected.length === 0 ? placeholder : ''}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          aria-autocomplete="list"
          aria-controls={`${name}-listbox`}
          autoComplete="off"
        />
        <button
          type="button"
          className="btn btn-ghost btn-xs ml-auto"
          onMouseDown={(e)=>{ e.preventDefault(); setOpen(o=>!o) }}
          aria-label={open ? 'Close options' : 'Open options'}
        >
          ▼
        </button>
      </div>
      <ul id={`${name}-listbox`} role="listbox" className={`absolute left-0 top-full z-[1000] mt-1 w-full max-h-60 overflow-auto rounded-box bg-base-100 p-1 shadow-xl ${open ? '' : 'hidden'}`}>
        {filtered.length === 0 ? (
          <li className="disabled opacity-60 px-2 py-2 text-sm">No matches</li>
        ) : (
          filtered.map(o => (
            <li key={o}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); add(o) }}
                onPointerDown={(e) => { e.preventDefault(); add(o) }}
                onTouchStart={(e) => { e.preventDefault(); add(o) }}
                onClick={(e) => { e.preventDefault(); add(o) }}
                className="justify-between w-full"
              >
                {o}
                <span className="badge">Add</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}


