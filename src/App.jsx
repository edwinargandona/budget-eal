import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import BottomNav from './components/BottomNav'
import SplashScreen from './components/SplashScreen'
import Home from './pages/Home'
import Registro from './pages/Registro'
import Resumen from './pages/Resumen'
import IA from './pages/IA'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [session, setSession] = useState(undefined)

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        sessionStorage.setItem('lastActiveTime', Date.now().toString())
      } else {
        const last = sessionStorage.getItem('lastActiveTime')
        if (last) {
          const minutesPassed = (Date.now() - Number(last)) / 60000
          if (minutesPassed > 60) {
            supabase.auth.signOut()
          }
        }
      }
    }

    function handleBeforeUnload() {
      supabase.auth.signOut()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  if (session === undefined) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/resumen" element={<Resumen />} />
        <Route path="/ia" element={<IA />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </>
  )
}
