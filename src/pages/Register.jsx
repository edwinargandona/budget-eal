import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Logo from '../components/Logo'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function set(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
    })

    if (error) {
      setError(error.message === 'User already registered'
        ? 'Este email ya está registrado.'
        : 'Error al crear la cuenta. Intentá de nuevo.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '52px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ fontSize: '22px', color: 'var(--text-h)', marginBottom: '10px' }}>
          ¡Cuenta creada!
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '300px' }}>
          Revisá tu email y confirmá tu cuenta para poder iniciar sesión.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '28px',
            padding: '13px 32px',
            borderRadius: '12px',
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Ir al login
        </button>
      </div>
    )
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
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Logo size={80} showText={true} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-h)' }}>
          Crear cuenta
        </h1>
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
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChange={e => set('password', e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div>
          <p className="label" style={{ marginBottom: '6px' }}>Confirmar contraseña</p>
          <input
            type="password"
            placeholder="••••••••"
            value={form.confirm}
            onChange={e => set('confirm', e.target.value)}
            required
            autoComplete="new-password"
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
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      {/* Link a login */}
      <p style={{ marginTop: '28px', fontSize: '14px', color: 'var(--text-muted)' }}>
        ¿Ya tenés cuenta?{' '}
        <button
          type="button"
          onClick={() => navigate('/')}
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
          Iniciar sesión
        </button>
      </p>
    </div>
  )
}
