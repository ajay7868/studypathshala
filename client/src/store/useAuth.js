import { create } from 'zustand'
import { API_URL } from '../lib/env.js'

export const useAuth = create((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('token', token)
      else localStorage.removeItem('token')
    }
    set({ token })
  },
  fetchMe: async () => {
    const token = get().token
    if (!token) return null
    const res = await fetch(API_URL + '/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const user = await res.json()
    set({ user })
    return user
  },
  updateProfile: async (payload) => {
    const token = get().token
    const res = await fetch(API_URL + '/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Failed to update')
    const user = await res.json()
    set({ user })
    return user
  },
  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('token')
    set({ token: null, user: null })
  },
}))

