import { Link, useLocation } from 'react-router-dom'
import t from '../utils/translations'

export default function Navbar({ user, lang, dark, onToggleDark, onToggleLang, onLogout }) {
  const tr = t[lang] || t.en
  const location = useLocation()

  const links = [
    { path: '/', label: tr.dashboard },
    { path: '/cash', label: tr.cash },
    { path: '/stocks', label: tr.stocks },
    { path: '/savings', label: tr.savings },
    { path: '/pension', label: tr.pension },
    { path: '/settings', label: tr.settings },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 h-14 flex-wrap">
        {/* Logo */}
        <Link to="/" className="font-bold text-lg text-blue-600 dark:text-blue-400 shrink-0">
          EZFinance 💰
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1 flex-1 flex-wrap">
          {links.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                isActive(path)
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {lang === 'en' ? 'עב' : 'EN'}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDark}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title={tr.darkMode}
          >
            {dark ? '☀️' : '🌙'}
          </button>

          {/* User Greeting */}
          <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
            {tr.hi}, <span className="font-semibold text-gray-900 dark:text-white">{user}</span> 👋
          </span>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition"
          >
            {tr.logout}
          </button>
        </div>
      </div>
    </nav>
  )
}
