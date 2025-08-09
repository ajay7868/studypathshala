import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../lib/env.js'

export default function CatalogPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(API_URL + '/api/books')
        const data = await res.json()
        setBooks(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
    // live updates via SSE
    const es = new EventSource(API_URL.replace(/\/$/, '') + '/api/events')
    es.addEventListener('bookCreated', (e) => {
      try {
        const data = JSON.parse(e.data)
        // fetch the new book document to include full fields
        fetch(API_URL + '/api/books/' + data.id)
          .then(r => r.json())
          .then(doc => setBooks(prev => [doc, ...prev]))
      } catch {}
    })
    es.addEventListener('bookDeleted', (e) => {
      try {
        const data = JSON.parse(e.data)
        setBooks(prev => prev.filter(b => b._id !== data.id))
      } catch {}
    })
    return () => es.close()
  }, [])

  if (loading) return <div className="loading loading-dots loading-lg" />

  const srcFor = (url) => {
    if (!url) return ''
    return url.startsWith('/static/') ? (API_URL.replace(/\/$/, '') + url) : url
  }

  return (
    <section>
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-8 mb-8">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">📚 Interview Book Catalog</h1>
        <p className="text-xl opacity-90">Discover curated books to ace your tech interviews</p>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Filter by category</label>
            <div className="flex items-center gap-3">
              <select
                className="select select-bordered bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={category}
                onChange={(e)=>setCategory(e.target.value)}
              >
                {['All','Data Structures','Algorithms','System Design','Behavioral','Databases','SQL'].map(c=> (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <span className="badge badge-lg bg-indigo-50 text-indigo-700 border-none">
                {category}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-700">
            Showing {books.filter(b => category==='All' || (b.categories||[]).includes(category)).length} books
          </div>
        </div>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.filter(b => category==='All' || (b.categories||[]).includes(category)).map((b) => (
          <div key={b._id} className="card bg-white shadow-md hover:shadow-lg transition-all duration-200">
            <figure className="w-full h-48 md:h-56 overflow-hidden rounded-t-md">
              {b.coverUrl ? (
                <img
                  src={srcFor(b.coverUrl)}
                  alt={b.title}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={(e)=>{ e.currentTarget.src=''; }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-4xl text-gray-400">📖</div>
                </div>
              )}
            </figure>
            <div className="card-body p-4">
              <h2 className="card-title text-lg font-bold text-gray-800 line-clamp-2">{b.title}</h2>
              <p className="text-sm text-gray-600 mb-2">by {b.author}</p>
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{b.description}</p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-wrap gap-1">
                  {(b.categories || []).slice(0, 2).map(cat => (
                    <span key={cat} className="badge badge-sm bg-indigo-100 text-indigo-800 border-none">
                      {cat}
                    </span>
                  ))}
                </div>
                {b.isPremium && (
                  <div className="badge badge-warning gap-1">
                    ⭐ Premium
                  </div>
                )}
              </div>
              
              <div className="card-actions justify-end mt-2">
                <Link 
                  to={`/book/${b._id}`} 
                  className="btn btn-primary btn-sm bg-gradient-to-r from-indigo-500 to-purple-600 border-none shadow-lg hover:shadow-xl"
                >
                  📖 Read Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {books.filter(b => category==='All' || (b.categories||[]).includes(category)).length === 0 && (
        <div className="text-center py-16">
          <div className="text-8xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-2">No books found</h3>
          <p className="text-gray-500">Try selecting a different category</p>
        </div>
      )}
    </section>
  )
}

