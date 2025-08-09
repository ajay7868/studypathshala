import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { API_URL } from '../lib/env.js'
import { useAuth } from '../store/useAuth.js'
import ImageReader from '../components/ImageReader.jsx'

export default function BookPage() {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState(null)
  const [subscribing, setSubscribing] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [copied, setCopied] = useState(false)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/books/${id}`)
        const data = await res.json()
        setBook(data)
        
        if (token) {
          const subRes = await fetch(`${API_URL}/api/subscriptions/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (subRes.ok) {
            const subData = await subRes.json()
            setSubscription(subData)
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, token])

  const handleSubscribe = async () => {
    if (!token) return
    setSubscribing(true)
    try {
      const res = await fetch(`${API_URL}/api/subscriptions/activate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ months: 1 })
      })
      if (res.ok) {
        const data = await res.json()
        setSubscription(data)
        alert('🎉 Premium subscription activated!')
      }
    } catch (e) {
      console.error(e)
      alert('Subscription failed. Please try again.')
    } finally {
      setSubscribing(false)
    }
  }

  const toggleBookmark = () => setBookmarked((b) => !b)

  const handleShare = async () => {
    try {
      const href = window.location.href
      await navigator.clipboard.writeText(href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="loading loading-dots loading-lg"></div>
    </div>
  )
  
  if (!book) return (
    <div className="text-center py-16">
      <div className="text-8xl mb-4">📚</div>
      <h2 className="text-2xl font-bold text-gray-600 mb-4">Book Not Found</h2>
      <Link to="/catalog" className="btn btn-primary">Back to Catalog</Link>
    </div>
  )

  const hasAccess = !book.isPremium || (subscription && subscription.active)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="breadcrumbs text-sm">
          <ul>
            <li><Link to="/catalog">Catalog</Link></li>
            <li className="text-gray-500">{book.title}</li>
          </ul>
        </div>
        <Link to="/catalog" className="btn btn-ghost btn-sm">← Back</Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card bg-white shadow-xl hover:shadow-2xl transition-transform duration-200 hover:-translate-y-0.5">
            <figure className="relative aspect-[3/4] overflow-hidden rounded-lg">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl.startsWith('/static/') ? (API_URL + book.coverUrl) : book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-8xl text-gray-400">📖</div>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent"></div>
              {book.isPremium && (
                <span className="absolute top-3 left-3 badge badge-warning shadow">⭐ Premium</span>
              )}
            </figure>
            <div className="card-body p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="card-title text-2xl leading-tight font-bold text-gray-900">{book.title}</h1>
                  <p className="text-sm text-gray-600">by {book.author}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className={`btn btn-sm ${bookmarked ? 'btn-primary' : 'btn-ghost'}`} onClick={toggleBookmark} title="Save">
                    {bookmarked ? '🔖 Saved' : '🔖 Save'}
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={handleShare} title="Copy link">
                    {copied ? '✅ Copied' : '🔗 Share'}
                  </button>
                </div>
              </div>
              <div className="divider my-1"></div>

              {(book.categories || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(book.categories || []).map(cat => (
                    <span
                      key={cat}
                      className="badge badge-sm bg-indigo-100 text-indigo-800 border-none transition-transform duration-150 hover:scale-105"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}

              {book.isPremium && (
                <div className="badge badge-warning gap-1 w-fit animate-pulse">⭐ Premium Content</div>
              )}

              {!hasAccess && book.isPremium && (
                <div className="space-y-4">
                  {!token ? (
                    <div className="alert alert-info">
                      <div>
                        <h3 className="font-bold">Login Required</h3>
                        <div className="text-xs">Sign in to access premium content</div>
                      </div>
                      <Link to="/login" className="btn btn-sm">Login</Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="alert alert-warning">
                        <div>
                          <h3 className="font-bold">Premium Access Required</h3>
                          <div className="text-xs">Subscribe to unlock this book</div>
                        </div>
                      </div>
                      <button 
                        onClick={handleSubscribe}
                        disabled={subscribing}
                        className="btn btn-primary w-full bg-gradient-to-r from-indigo-600 to-purple-600 border-none shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-purple-700"
                      >
                        {subscribing ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          '🚀 Subscribe Now'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {hasAccess && (
                <div className="alert alert-success">
                  <div>
                    <span className="font-semibold">✅ Full Access</span>
                    <div className="text-xs">You can read this book</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div className="card bg-white shadow p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-3 text-gray-900">About This Book</h2>
              <p className="text-base md:text-lg text-gray-800 leading-7 md:leading-8 whitespace-pre-line">
                {book.description || 'No description available.'}
              </p>
            </div>

            {book.pdfUrl && hasAccess && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Read Online</h2>
                <div className="bg-gray-50 rounded-2xl p-5">
                  <ImageReader bookId={id} token={token} />
                </div>
              </div>
            )}

            {!book.isPremium && book.content && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Content Preview</h2>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <pre className="whitespace-pre-wrap text-sm">{book.content}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

