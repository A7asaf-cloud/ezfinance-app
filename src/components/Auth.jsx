import { useState } from 'react'
import t from '../utils/translations'

export default function Auth({ onLogin, lang }) {
  const tr = t[lang] || t.en
  const stored = JSON.parse(localStorage.getItem('user') || 'null')
  const isReturning = !!stored

  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  const handleSignup = () => {
    if (!fullName.trim()) { setError('Please enter your name.'); return }
    if (password.trim().length < 4) { setError('Password must be at least 4 characters.'); return }
    if (password.trim() !== confirm.trim()) { setError(tr.passwordMismatch); return }
    localStorage.setItem('user', JSON.stringify({
      name: fullName.trim(),
      passwordHash: btoa(password.trim())
    }))
    onLogin(fullName.trim())
  }

  const handleLogin = () => {
    if (!stored) return
    if (btoa(password.trim()) === stored.passwordHash) {
      onLogin(stored.name)
    } else {
      setError(tr.wrongPassword)
    }
  }

  const handleReset = () => {
    if (window.confirm(tr.resetAll + '?')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const inputCls = 'w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
  const btnCls = 'w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">EZFinance 💰</h1>

        {isReturning ? (
          <>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              {tr.welcome}, <span className="font-semibold text-gray-900 dark:text-white">{stored.name}</span> 👋
            </p>
            <div className="space-y-4">
              <input
                className={inputCls}
                type="password"
                placeholder={tr.password}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button className={btnCls} onClick={handleLogin}>{tr.login}</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">Create your account</p>
            <div className="space-y-4">
              <input className={inputCls} type="text" placeholder={tr.fullName} value={fullName} onChange={e => setFullName(e.target.value)} />
              <input className={inputCls} type="password" placeholder={tr.password} value={password} onChange={e => setPassword(e.target.value)} />
              <input
                className={inputCls}
                type="password"
                placeholder={tr.confirmPassword}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button className={btnCls} onClick={handleSignup}>{tr.createAccount}</button>
            </div>
          </>
        )}

        {isReturning && (
          <button
            className="mt-6 w-full text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
            onClick={handleReset}
          >
            🗑️ {tr.resetAll}
          </button>
        )}
      </div>
    </div>
  )
}
