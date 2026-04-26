import { useState } from 'react'
import t from '../utils/translations'

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  )
}

const inputCls = 'px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full'

export default function Settings({ lang, dark, onToggleDark, onToggleLang }) {
  const tr = t[lang] || t.en

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState(false)

  const handleChangePassword = () => {
    const stored = JSON.parse(localStorage.getItem('user') || 'null')
    if (!stored) return
    if (btoa(currentPw.trim()) !== stored.passwordHash) {
      setPwMsg(tr.passwordWrong); setPwError(true); return
    }
    if (newPw.trim().length < 4) {
      setPwMsg(tr.passwordShort); setPwError(true); return
    }
    if (newPw.trim() !== confirmPw.trim()) {
      setPwMsg(tr.passwordMismatch); setPwError(true); return
    }
    stored.passwordHash = btoa(newPw.trim())
    localStorage.setItem('user', JSON.stringify(stored))
    setPwMsg(tr.passwordChanged); setPwError(false)
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
  }

  const exportData = () => {
    const data = {
      user: JSON.parse(localStorage.getItem('user') || 'null'),
      transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
      stocks: JSON.parse(localStorage.getItem('stocks') || '[]'),
      savings: JSON.parse(localStorage.getItem('savings') || '[]'),
      pension: JSON.parse(localStorage.getItem('pension_settings') || 'null'),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ezfinance-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetAll = () => {
    if (window.confirm(tr.resetEverything + '?')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Appearance */}
      <Card>
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{tr.settings}</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{tr.darkMode}</p>
              <p className="text-xs text-gray-400">{dark ? 'Dark' : 'Light'} mode active</p>
            </div>
            <button
              onClick={onToggleDark}
              className={`relative w-12 h-6 rounded-full transition-colors ${dark ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${dark ? 'translate-x-6' : ''}`} />
            </button>
          </div>
          <div className="flex justify-between items-center py-3">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{tr.language}</p>
              <p className="text-xs text-gray-400">{lang === 'en' ? 'English' : 'עברית'}</p>
            </div>
            <button
              onClick={onToggleLang}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {lang === 'en' ? '🇮🇱 עברית' : '🇺🇸 English'}
            </button>
          </div>
        </div>
      </Card>

      {/* Change Password */}
      <Card>
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{tr.changePassword}</h2>
        <div className="space-y-3">
          <input className={inputCls} type="password" placeholder={tr.currentPassword} value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
          <input className={inputCls} type="password" placeholder={tr.newPassword} value={newPw} onChange={e => setNewPw(e.target.value)} />
          <input
            className={inputCls}
            type="password"
            placeholder={tr.confirmNewPassword}
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
          />
          {pwMsg && (
            <p className={`text-sm ${pwError ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>{pwMsg}</p>
          )}
          <button
            onClick={handleChangePassword}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
          >
            {tr.savePassword}
          </button>
        </div>
      </Card>

      {/* Data */}
      <Card>
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{tr.data}</h2>
        <div className="flex flex-col gap-3">
          <button
            onClick={exportData}
            className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition text-start"
          >
            📥 {tr.exportData}
          </button>
          <button
            onClick={resetAll}
            className="px-5 py-2.5 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium transition text-start"
          >
            🗑️ {tr.resetEverything}
          </button>
        </div>
      </Card>
    </div>
  )
}
