import { useEffect } from 'react'
import Logo from './Logo'

const styles = `
@keyframes splashFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes splashPulse {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
}
`

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const t = setTimeout(onFinish, 2000)
    return () => clearTimeout(t)
  }, [onFinish])

  return (
    <>
      <style>{styles}</style>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#080C0B',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        animation: 'splashFadeIn 0.5s ease forwards',
      }}>
        <Logo size={120} showText={true} />
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          color: '#34D399',
          opacity: 0.7,
          margin: 0,
          animation: 'splashPulse 1.5s ease-in-out infinite',
        }}>
          Cargando datos...
        </p>
      </div>
    </>
  )
}
