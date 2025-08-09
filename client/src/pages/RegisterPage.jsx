import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_URL } from '../lib/env.js'
import { useAuth } from '../store/useAuth.js'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const setToken = useAuth(s => s.setToken)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }
      const res = await fetch(API_URL + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')
      setToken(data.token)
      navigate('/account')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const emailValid = /.+@.+\..+/.test(email)
  const strongPassword = password.length >= 8
  const passwordsMatch = password.length > 0 && password === confirmPassword

  return (
    <section className="min-h-[calc(100dvh-120px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md relative z-10 text-gray-900" data-theme="studypathshala">
        {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}
        <form onSubmit={handleSubmit} className="card bg-white shadow-xl border overflow-hidden text-gray-900">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-4 px-6">
            <h1 className="text-2xl font-extrabold">Create your account</h1>
            <p className="text-white/90 text-sm mt-1">Start learning with StudyPathshala</p>
          </div>
          <div className="p-6 space-y-4">
          <label className="form-control">
            <span className="label-text">Name</span>
            <input className="input input-bordered w-full bg-white text-gray-900 placeholder-gray-400 border-gray-300" placeholder="Your name" value={name} onChange={(e)=>setName(e.target.value)} />
          </label>
          <label className="form-control">
            <span className="label-text">Email</span>
            <input className="input input-bordered w-full bg-white text-gray-900 placeholder-gray-400 border-gray-300" placeholder="you@example.com" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            {!emailValid && email.length > 0 && (<span className="label-text-alt text-error">Enter a valid email</span>)}
          </label>
          <label className="form-control">
            <span className="label-text">Password</span>
            <input className="input input-bordered w-full bg-white text-gray-900 placeholder-gray-400 border-gray-300" placeholder="At least 8 characters" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          </label>
          <label className="form-control">
            <label className="label"><span className="label-text">Confirm Password</span></label>
            <input className="input input-bordered w-full bg-white text-gray-900 placeholder-gray-400 border-gray-300" placeholder="Re-enter password" type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} />
            <label className="label">
              <span className={`label-text-alt ${confirmPassword.length>0 ? (passwordsMatch ? 'text-success' : 'text-error') : 'opacity-0'}`}>
                {confirmPassword.length>0 ? (passwordsMatch ? 'Passwords match' : 'Passwords do not match') : 'placeholder'}
              </span>
            </label>
          </label>
          <button className="btn w-full bg-blue-600 text-white hover:bg-blue-700 border-none" disabled={loading || !emailValid || !strongPassword || !passwordsMatch}>
            {loading ? 'Creating...' : 'Create account'}
          </button>
          </div>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          <span>Have an account?</span>
          <Link to="/login" className="ml-1 font-medium text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </section>
  )
}

