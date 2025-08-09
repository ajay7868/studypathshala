import { useEffect, useState } from 'react'
import { API_URL } from '../lib/env.js'
import MultiSelect from '../components/MultiSelect.jsx'
import CategoryMultiNative from '../components/CategoryMultiNative.jsx'
import LoaderOverlay from '../components/LoaderOverlay.jsx'

export default function AdminPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
  const CATEGORY_OPTIONS = ['Data Structures','Algorithms','System Design','Behavioral','Databases','SQL']

  async function loadBooks() {
    const res = await fetch(API_URL + '/api/books')
    const data = await res.json()
    setBooks(data)
    setLoading(false)
  }

  useEffect(() => { loadBooks() }, [])

  async function onSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    setCreating(true)
    try {
      const res = await fetch(API_URL + '/api/books', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      })
      if (res.ok) {
        form.reset()
        await loadBooks()
        alert('Book created')
      } else {
        const err = await res.json().catch(()=>({}))
        alert('Failed to create: ' + (err.message || res.statusText))
      }
    } finally {
      setCreating(false)
    }
  }

  async function onDelete(id) {
    if (!confirm('Delete this book?')) return
    const res = await fetch(`${API_URL}/api/books/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      await loadBooks()
    } else {
      alert('Failed to delete')
    }
  }

  if (!token) return <div className="alert alert-info">Login as admin to manage books.</div>

  function fileNameFromUrl(url) {
    if (!url) return ''
    try {
      const u = url.startsWith('/static/') ? url : new URL(url, window.location.origin).pathname
      const parts = u.split('/')
      return parts[parts.length - 1] || ''
    } catch {
      const parts = url.split('/')
      return parts[parts.length - 1] || ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-base-200 rounded-2xl p-6 relative">
        {creating && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <LoaderOverlay message="Creating book…" />
          </div>
        )}
        <h1 className="text-2xl font-bold mb-4">Admin • Manage Books</h1>
        <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
          <input name="title" className="input input-bordered" placeholder="Title" required />
          <input name="author" className="input input-bordered" placeholder="Author" required />
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Categories</label>
            <CategoryMultiNative name="categories" options={CATEGORY_OPTIONS} />
          </div>
          <select name="isPremium" className="select select-bordered">
            <option value="false">Free</option>
            <option value="true">Premium</option>
          </select>
          <input name="cover" type="file" accept="image/*" className="file-input file-input-bordered" />
          <input name="pdf" type="file" accept="application/pdf" className="file-input file-input-bordered" />
          <textarea name="description" className="textarea textarea-bordered sm:col-span-2" placeholder="Description" />
          <textarea name="content" className="textarea textarea-bordered sm:col-span-2" placeholder="Content (for free books without PDF)" />
          <button className="btn btn-primary sm:col-span-2" disabled={creating}>
            {creating ? (
              <span className="inline-flex items-center gap-2">
                <span className="loader-ring" aria-hidden="true"></span>
                <span>Creating…</span>
              </span>
            ) : (
              'Create Book'
            )}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Existing Books</h2>
        {loading ? (
          <div className="loading loading-dots" />
        ) : (
          <div className="space-y-3">
            {books.map(b => (
              <div key={b._id} className="p-3 bg-base-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {b.coverUrl && (
                      <img
                        src={b.coverUrl.startsWith('/static/') ? (API_URL + b.coverUrl) : b.coverUrl}
                        alt=""
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium">{b.title}</div>
                      <div className="text-sm text-base-content/70">{b.author}</div>
                      <div className="text-xs text-base-content/60 mt-1">
                        <span className="mr-3">{b.coverUrl ? `cover: ${fileNameFromUrl(b.coverUrl)}` : 'cover: —'}</span>
                        <span>{b.pdfUrl ? `pdf: ${fileNameFromUrl(b.pdfUrl)}` : 'pdf: —'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(b)}>
                      Edit
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => onDelete(b._id)}>Delete</button>
                  </div>
                </div>

                {editing && editing._id === b._id && (
                  <details open className="mt-3">
                    <summary className="cursor-pointer text-sm opacity-70">Edit Book</summary>
                    <form className="grid sm:grid-cols-2 gap-4 mt-3" onSubmit={async (e) => {
                      e.preventDefault()
                      const form = e.currentTarget
                      const fd = new FormData(form)
                      const res = await fetch(`${API_URL}/api/books/${b._id}`, {
                        method: 'PUT',
                        headers: { Authorization: `Bearer ${token}` },
                        body: fd,
                      })
                      if (res.ok) {
                        await loadBooks()
                        setEditing(null)
                      } else {
                        const err = await res.json().catch(()=>({}))
                        alert('Failed to update: ' + (err.message || res.statusText))
                      }
                    }}>
                      <input name="title" className="input input-bordered" defaultValue={b.title} />
                      <input name="author" className="input input-bordered" defaultValue={b.author} />
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Categories</label>
                        <CategoryMultiNative name="categories" options={CATEGORY_OPTIONS} defaultValue={(b.categories||[])} />
                      </div>
                      <select name="isPremium" className="select select-bordered" defaultValue={String(b.isPremium)}>
                        <option value="false">Free</option>
                        <option value="true">Premium</option>
                      </select>
                      <input name="cover" type="file" accept="image/*" className="file-input file-input-bordered" />
                      <input name="pdf" type="file" accept="application/pdf" className="file-input file-input-bordered" />
                      <textarea name="description" className="textarea textarea-bordered sm:col-span-2" defaultValue={b.description} />
                      <textarea name="content" className="textarea textarea-bordered sm:col-span-2" defaultValue={b.content} />
                      <div className="sm:col-span-2 flex gap-2">
                        <button className="btn btn-primary">Save</button>
                        <button type="button" className="btn" onClick={()=>setEditing(null)}>Cancel</button>
                      </div>
                    </form>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


