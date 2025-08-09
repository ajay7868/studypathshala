import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_URL } from '../lib/env.js'
import { useAuth } from '../store/useAuth.js'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const setToken = useAuth(s => s.setToken)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(API_URL + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')
      setToken(data.token)
      navigate('/account')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-[calc(100dvh-120px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md relative z-10 text-gray-900" data-theme="studypathshala">
        {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}

        <form onSubmit={handleSubmit} className="card bg-white shadow-xl border overflow-hidden text-gray-900">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-5 px-6">
            <h1 className="text-2xl font-extrabold">Welcome back</h1>
            <p className="text-white/90 text-sm mt-1">Sign in to continue</p>
          </div>
          <div className="px-6 py-8 space-y-6 md:space-y-8">
            <label className="form-control">
              <label className="label mb-2"><span className="label-text tracking-wide">Email</span></label>
              <input className="input input-bordered input-lg w-full bg-white text-gray-900 placeholder-gray-400 border-gray-300" placeholder="you@example.com" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            </label>
            <label className="form-control">
              <label className="label mb-2"><span className="label-text tracking-wide">Password</span></label>
              <div className="join w-full">
                <input className="input input-bordered input-lg join-item w-full bg-white text-gray-900 placeholder-gray-400 border-gray-300" placeholder="At least 8 characters" type={showPassword ? 'text' : 'password'} value={password} onChange={(e)=>setPassword(e.target.value)} />
                <button type="button" className="btn btn-lg join-item" onClick={()=>setShowPassword(s=>!s)}>{showPassword ? 'Hide' : 'Show'}</button>
              </div>
            </label>
            <button className="btn btn-lg w-full bg-blue-600 text-white hover:bg-blue-700 border-none" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <span>No account?</span>
          <Link to="/register" className="ml-1 font-medium text-blue-600 hover:underline">
            Create one
          </Link>
        </div>
      </div>
    </section>
  )
}

