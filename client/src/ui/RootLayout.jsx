import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/useAuth.js'

export default function RootLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const { user, fetchMe, logout } = useAuth()
  if (token && !user) {
    // lazy fetch on first render
    fetchMe()
  }
  // default theme can be set once if desired
  if (typeof window !== 'undefined' && !document.documentElement.getAttribute('data-theme')) {
    document.documentElement.setAttribute('data-theme', 'studypathshala')
  }
  return (
    <div className="min-h-dvh flex flex-col bg-base-100 text-base-content">
      <div className="navbar bg-base-100 border-b text-base-content">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost px-2 normal-case">
            <span className="group relative inline-block select-none">
              <span className="block text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 group-hover:from-pink-600 group-hover:to-indigo-500 transition-all duration-300">
                <span className="pr-1">Study</span>
                <span className="pl-1">Pathshala</span>
              </span>
              <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 transition-all duration-300 group-hover:w-full" />
            </span>
          </Link>
        </div>
        <div className="flex-none gap-2">
          <nav className="hidden md:flex gap-2">
            <NavLink to="/catalog" className="btn btn-ghost">Catalog</NavLink>
            {user?.role === 'admin' && <NavLink to="/admin" className="btn btn-ghost">Admin</NavLink>}
            {token ? (
              <>
                <span className="btn btn-ghost">{user?.name || 'Account'}</span>
                <NavLink to="/account" className="btn btn-ghost">Settings</NavLink>
                <button className="btn btn-outline" onClick={() => { logout(); navigate('/'); }}>Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-ghost">Login</NavLink>
                <NavLink to="/register" className="btn btn-primary">Register</NavLink>
              </>
            )}
          </nav>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost md:hidden">Menu</div>
            <ul tabIndex={0} className="menu dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow">
              <li><NavLink to="/catalog">Catalog</NavLink></li>
              {token ? (
                <>
                  <li><span className="opacity-70 px-4 py-2">{user?.email || 'Account'}</span></li>
                  <li><NavLink to="/account">Settings</NavLink></li>
                  <li><button onClick={() => { logout(); navigate('/'); }}>Logout</button></li>
                </>
              ) : (
                <>
                  <li><NavLink to="/login">Login</NavLink></li>
                  <li><NavLink to="/register">Register</NavLink></li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      <main className="container mx-auto p-4 flex-1">
        <Outlet />
      </main>

      <footer className="footer footer-center bg-base-200 text-base-content p-6">
        <aside>
          <p>© {new Date().getFullYear()} StudyPathshala. Learn by reading.</p>
        </aside>
      </footer>
    </div>
  )
}

