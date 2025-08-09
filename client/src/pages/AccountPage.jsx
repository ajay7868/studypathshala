import { useEffect, useState } from 'react'
import { API_URL } from '../lib/env.js'
import { useAuth } from '../store/useAuth.js'

export default function AccountPage() {
  const { user, fetchMe, updateProfile } = useAuth()
  const [sub, setSub] = useState(null)
  const [loading, setLoading] = useState(true)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  async function load() {
    try {
      const res = await fetch(API_URL + '/api/subscriptions/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setSub(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    fetchMe().then((u) => { if (u?.name) setName(u.name) })
  }, [])

  async function activate(months = 1) {
    setLoading(true)
    try {
      await fetch(API_URL + '/api/subscriptions/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ months }),
      })
      await load()
    } finally {
      setLoading(false)
    }
  }

  async function cancel() {
    setLoading(true)
    try {
      await fetch(API_URL + '/api/subscriptions/cancel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      await load()
    } finally {
      setLoading(false)
    }
  }

  if (!token) return <div className="alert alert-info">Please login to view your account.</div>
  if (loading) return <div className="loading loading-dots loading-lg" />

  return (
    <section className="max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Profile & Subscription</h1>
      <div className="card bg-base-200 mb-6 shadow">
        <div className="card-body">
          <h2 className="card-title">Profile</h2>
          <div className="grid gap-3">
            <label className="form-control">
              <span className="label-text">Name</span>
              <input className="input input-bordered" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" />
            </label>
            <label className="form-control">
              <span className="label-text">Email</span>
              <input className="input input-bordered" value={user?.email || ''} readOnly />
            </label>
            <label className="form-control">
              <span className="label-text">New Password (optional)</span>
              <input className="input input-bordered" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" />
            </label>
            <button className="btn btn-primary w-fit" onClick={async ()=>{ await updateProfile({ name, password: password || undefined }); setPassword('') }}>Save changes</button>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Your Subscription</h2>
      {sub?.active ? (
        <div className="alert alert-success mb-4">
          <span>Active premium plan until {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '—'}</span>
        </div>
      ) : (
        <div className="alert alert-info mb-4">
          <span>Free plan. Upgrade for full access.</span>
        </div>
      )}

      <div className="join mt-2">
        <button className="btn btn-primary join-item" onClick={() => activate(1)}>Activate 1 month</button>
        <button className="btn join-item" onClick={() => activate(12)}>Activate 12 months</button>
        {sub?.active && <button className="btn btn-outline join-item" onClick={cancel}>Cancel</button>}
      </div>
    </section>
  )
}

