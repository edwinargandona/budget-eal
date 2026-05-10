import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const ERRORES = {
  'Invalid login credentials': 'Email o contraseña incorrectos.',
  'Email not confirmed': 'Confirmá tu email antes de iniciar sesión.',
}

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    })

    if (error) {
      setError(ERRORES[error.message] ?? 'Error al iniciar sesión. Intentá de nuevo.')
      setLoading(false)
    }
    // Si login OK, onAuthStateChange en App.jsx actualiza la sesión automáticamente
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          width: '72px', height: '72px',
          borderRadius: '22px',
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          fontSize: '34px',
          margin: '0 auto 16px',
          boxShadow: '0 8px 32px rgba(16,185,129,0.35)',
        }}>
          💰
        </div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--text-h)',
          letterSpacing: '-0.5px',
        }}>
          Budget EAL
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Controlá tus gastos
        </p>
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '380px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '12px',
            padding: '12px 14px',
            color: 'var(--danger)',
            fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        <div>
          <p className="label" style={{ marginBottom: '6px' }}>Email</p>
          <input
            type="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            required
            autoComplete="email"
            inputMode="email"
          />
        </div>

        <div>
          <p className="label" style={{ marginBottom: '6px' }}>Contraseña</p>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => set('password', e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '4px',
            width: '100%',
            padding: '15px',
            borderRadius: '14px',
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </button>
      </form>

      {/* Link a registro */}
      <p style={{
        marginTop: '28px',
        fontSize: '14px',
        color: 'var(--text-muted)',
      }}>
        ¿No tenés cuenta?{' '}
        <button
          type="button"
          onClick={() => navigate('/register')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent)',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Crear cuenta
        </button>
      </p>
    </div>
  )
}
