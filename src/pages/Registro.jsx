import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import { CATEGORIAS, getFechaHoy } from '../utils'

const ESTADO = { idle: 'idle', loading: 'loading', ok: 'ok', error: 'error' }

export default function Registro() {
  const navigate = useNavigate()
  const location = useLocation()
  const gastoExistente = location.state?.gasto ?? null
  const modoEdicion = gastoExistente !== null

  const [estado, setEstado] = useState(ESTADO.idle)
  const [form, setForm] = useState(
    modoEdicion
      ? {
          fecha: gastoExistente.fecha,
          monto: String(gastoExistente.monto),
          moneda: gastoExistente.moneda,
          categoria: gastoExistente.categoria,
          descripcion: gastoExistente.descripcion ?? '',
        }
      : {
          fecha: getFechaHoy(),
          monto: '',
          moneda: 'Bs',
          categoria: '',
          descripcion: '',
        }
  )

  function set(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.monto || !form.categoria) return
    setEstado(ESTADO.loading)

    const payload = {
      fecha: form.fecha,
      monto: parseFloat(form.monto),
      moneda: form.moneda,
      categoria: form.categoria,
      descripcion: form.descripcion.trim() || null,
    }

    let error, data
    if (modoEdicion) {
      ;({ error, data } = await supabase
        .from('Gastos')
        .update(payload)
        .eq('id', gastoExistente.id)
        .select())
    } else {
      ;({ error, data } = await supabase
        .from('Gastos')
        .insert([payload])
        .select())
    }

    if (error) {
      console.error(`Error al ${modoEdicion ? 'actualizar' : 'insertar'} gasto:`, error)
      setEstado(ESTADO.error)
      return
    }

    setEstado(ESTADO.ok)

    if (modoEdicion) {
      setTimeout(() => navigate('/'), 900)
    } else {
      setForm({ fecha: getFechaHoy(), monto: '', moneda: 'Bs', categoria: '', descripcion: '' })
      setTimeout(() => setEstado(ESTADO.idle), 2500)
    }
  }

  return (
    <div className="page">
      <header className="page-header" style={{ gap: '12px' }}>
        {modoEdicion && (
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-muted)',
              padding: '0', fontSize: '22px', lineHeight: 1,
              display: 'flex', alignItems: 'center',
            }}
          >
            ‹
          </button>
        )}
        <h1>{modoEdicion ? 'Editar gasto' : 'Registrar gasto'}</h1>
        {modoEdicion && (
          <span style={{
            marginLeft: 'auto',
            fontSize: '11px', fontWeight: 500,
            padding: '3px 10px',
            borderRadius: '20px',
            background: 'var(--accent-bg)',
            color: 'var(--accent)',
            border: '1px solid var(--accent-border)',
          }}>
            Editando
          </span>
        )}
      </header>

      {estado === ESTADO.ok && (
        <div style={{
          background: 'rgba(16,185,129,0.12)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '12px',
          padding: '14px 16px',
          marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '10px',
          color: 'var(--accent)', fontSize: '14px', fontWeight: 500,
        }}>
          <span style={{ fontSize: '20px' }}>✓</span>
          {modoEdicion ? 'Gasto actualizado correctamente' : 'Gasto registrado correctamente'}
        </div>
      )}

      {estado === ESTADO.error && (
        <div style={{
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '12px',
          padding: '14px 16px',
          marginBottom: '16px',
          color: 'var(--danger)', fontSize: '14px',
        }}>
          Error al guardar. Intenta de nuevo.
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Monto + Moneda */}
        <div className="card" style={{ padding: '20px' }}>
          <p className="label" style={{ marginBottom: '10px' }}>Monto</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ display: 'flex', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              {['Bs', 'USD'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set('moneda', m)}
                  style={{
                    padding: '12px 16px', border: 'none',
                    background: form.moneda === m ? 'var(--accent)' : 'var(--bg-surface)',
                    color: form.moneda === m ? '#fff' : 'var(--text)',
                    fontWeight: form.moneda === m ? 700 : 400,
                    fontSize: '14px', transition: 'all 0.2s', cursor: 'pointer',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={form.monto}
              onChange={e => set('monto', e.target.value)}
              required
              style={{
                flex: 1, fontSize: '20px', fontWeight: 700,
                textAlign: 'right',
                color: form.moneda === 'USD' ? 'var(--cat-viaje)' : 'var(--accent)',
              }}
            />
          </div>
        </div>

        {/* Fecha */}
        <div>
          <p className="label" style={{ marginBottom: '6px' }}>Fecha</p>
          <input
            type="date"
            value={form.fecha}
            onChange={e => set('fecha', e.target.value)}
            required
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {/* Categoría */}
        <div>
          <p className="label" style={{ marginBottom: '8px' }}>Categoría</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {CATEGORIAS.map(cat => (
              <button
                key={cat.nombre}
                type="button"
                onClick={() => set('categoria', cat.nombre)}
                style={{
                  padding: '10px 6px', borderRadius: '12px',
                  border: `2px solid ${form.categoria === cat.nombre ? cat.color : 'var(--border)'}`,
                  background: form.categoria === cat.nombre ? `${cat.color}18` : 'var(--bg-card)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '5px',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: '20px' }}>{cat.emoji}</span>
                <span style={{
                  fontSize: '10px', fontWeight: 500,
                  color: form.categoria === cat.nombre ? cat.color : 'var(--text)',
                  textAlign: 'center', lineHeight: '1.2',
                }}>
                  {cat.nombre.split('/')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <p className="label" style={{ marginBottom: '6px' }}>
            Descripción <span style={{ color: 'var(--text-muted)' }}>(opcional)</span>
          </p>
          <input
            type="text"
            placeholder="Ej: Almuerzo con compañeros"
            value={form.descripcion}
            onChange={e => set('descripcion', e.target.value)}
            maxLength={120}
          />
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              flex: 1, padding: '14px', borderRadius: '12px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text)', fontSize: '15px',
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={estado === ESTADO.loading || !form.monto || !form.categoria}
            style={{
              flex: 2, padding: '14px', borderRadius: '12px',
              border: 'none',
              background: form.monto && form.categoria ? 'var(--accent)' : 'var(--bg-surface)',
              color: form.monto && form.categoria ? '#fff' : 'var(--text-muted)',
              fontSize: '15px', fontWeight: 600, transition: 'all 0.2s',
            }}
          >
            {estado === ESTADO.loading
              ? (modoEdicion ? 'Guardando…' : 'Registrando…')
              : (modoEdicion ? 'Guardar cambios' : 'Guardar gasto')}
          </button>
        </div>
      </form>
    </div>
  )
}
