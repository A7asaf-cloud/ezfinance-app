import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './components/Auth'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Cash from './pages/Cash'
import Stocks from './pages/Stocks'
import Savings from './pages/Savings'
import Pension from './pages/Pension'
import Settings from './pages/Settings'

export default function App() {
  const [user, setUser] = useState(sessionStorage.getItem('loggedIn') || null)
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en')
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark')

  if (!user) {
    return (
      <Auth
        onLogin={(name) => {
          sessionStorage.setItem('loggedIn', name)
          setUser(name)
        }}
        lang={lang}
      />
    )
  }

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
  }

  const toggleLang = () => {
    const next = lang === 'en' ? 'he' : 'en'
    setLang(next)
    localStorage.setItem('lang', next)
  }

  const logout = () => {
    sessionStorage.clear()
    window.location.reload()
  }

  const dir = lang === 'he' ? 'rtl' : 'ltr'

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-black" dir={dir}>
        <Navbar
          user={user}
          lang={lang}
          dark={dark}
          onToggleDark={toggleDark}
          onToggleLang={toggleLang}
          onLogout={logout}
        />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard lang={lang} />} />
            <Route path="/cash" element={<Cash lang={lang} />} />
            <Route path="/stocks" element={<Stocks lang={lang} />} />
            <Route path="/savings" element={<Savings lang={lang} />} />
            <Route path="/pension" element={<Pension lang={lang} />} />
            <Route path="/settings" element={<Settings lang={lang} dark={dark} onToggleDark={toggleDark} onToggleLang={toggleLang} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
