import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { CATEGORIAS, formatMonto, getMesLabel } from '../utils'

export default function Home() {
  const [gastos, setGastos] = useState([])
  const [loading, setLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  const ahora = new Date()

  useEffect(() => {
    fetchGastos()
  }, [])

  async function fetchGastos() {
    setLoading(true)
    const desde = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const { data } = await supabase
      .from('Gastos')
      .select('*')
      .gte('fecha', desde)
      .order('fecha', { ascending: false })
    setGastos(data || [])
    setLoading(false)
  }

  async function handleDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    const { error } = await supabase
      .from('Gastos')
      .delete()
      .eq('id', pendingDelete.id)
    if (error) {
      console.error('Error al eliminar gasto:', error)
      setDeleting(false)
      return
    }
    setPendingDelete(null)
    setDeleting(false)
    await fetchGastos()
  }

  const totalBs = gastos.filter(g => g.moneda === 'Bs').reduce((s, g) => s + Number(g.monto), 0)
  const totalUSD = gastos.filter(g => g.moneda === 'USD').reduce((s, g) => s + Number(g.monto), 0)
  const ultimos = gastos.slice(0, 8)

  const categoriasTop = Object.entries(
    gastos.filter(g => g.moneda === 'Bs').reduce((acc, g) => {
      acc[g.categoria] = (acc[g.categoria] || 0) + Number(g.monto)
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 3)

  return (
    <div className="page">
      <header className="page-header" style={{ justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {getMesLabel(ahora.getMonth(), ahora.getFullYear())}
          </p>
          <h1 style={{ fontSize: '22px', marginTop: '2px' }}>
            <span style={{ color: 'var(--text-h)' }}>my.</span>
            <span style={{ color: 'var(--accent)' }}>budget</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={async () => { await supabase.auth.signOut() }}
            title="Cerrar sesión"
            style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer',
            }}
          >
            <LogoutIcon />
          </button>
          <button
            onClick={() => navigate('/registro')}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            +
          </button>
        </div>
      </header>

      {/* Total del mes */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <p className="label">Gastos del mes</p>
        {loading ? (
          <div className="spinner" style={{ margin: '12px auto' }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="amount-big amount-bs">
              Bs. {formatMonto(totalBs)}
            </div>
            {totalUSD > 0 && (
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--cat-viaje)' }}>
                + USD {formatMonto(totalUSD)}
              </div>
            )}
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {gastos.length} {gastos.length === 1 ? 'transacción' : 'transacciones'}
            </p>
          </div>
        )}
      </div>

      {/* Top categorías */}
      {!loading && categoriasTop.length > 0 && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <p className="label" style={{ marginBottom: '12px' }}>Top categorías</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {categoriasTop.map(([cat, monto]) => {
              const info = CATEGORIAS.find(c => c.nombre === cat) || CATEGORIAS.at(-1)
              const pct = totalBs > 0 ? (monto / totalBs) * 100 : 0
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{info.emoji}</span>
                      <span style={{ color: 'var(--text-h)' }}>{cat.split('/')[0]}</span>
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: info.color }}>
                      Bs. {formatMonto(monto)}
                    </span>
                  </div>
                  <div style={{ height: '4px', borderRadius: '4px', background: 'var(--border)' }}>
                    <div style={{
                      height: '100%',
                      borderRadius: '4px',
                      background: info.color,
                      width: `${pct}%`,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Últimos gastos */}
      <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p className="label">Últimos 7 días</p>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>← deslizá para editar</p>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : ultimos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>💸</div>
          <p>Sin gastos en los últimos 7 días</p>
          <button
            onClick={() => navigate('/registro')}
            style={{
              marginTop: '16px',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontSize: '14px',
            }}
          >
            Registrar primer gasto
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {ultimos.map(gasto => (
            <GastoItem
              key={gasto.id}
              gasto={gasto}
              onEdit={g => navigate('/registro', { state: { gasto: g } })}
              onDelete={g => setPendingDelete(g)}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        paddingTop: '32px',
        paddingBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '14px', color: '#ffffff' }}>
          Made Myself
        </p>
        <p style={{ fontSize: '12px', color: '#6B7B6F' }}>
          Powered by EAL 🇧🇴
        </p>
        <p style={{ fontSize: '12px', color: '#34D399', fontStyle: 'italic' }}>
          Limitless by choice
        </p>
      </div>

      {/* Modal confirmar eliminar */}
      {pendingDelete && (
        <ModalEliminar
          gasto={pendingDelete}
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}

// ─── Swipe + long-press item ────────────────────────────────────────────────

function GastoItem({ gasto, onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const [offsetX, setOffsetX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const touchRef = useRef(null)
  const longTimer = useRef(null)
  const REVEAL = 132

  const info = CATEGORIAS.find(c => c.nombre === gasto.categoria) || CATEGORIAS.at(-1)

  function handleTouchStart(e) {
    const { clientX, clientY } = e.touches[0]
    touchRef.current = { x: clientX, y: clientY, moved: false }
    longTimer.current = setTimeout(() => {
      if (touchRef.current && !touchRef.current.moved) {
        setOpen(true)
      }
    }, 480)
  }

  function handleTouchMove(e) {
    if (!touchRef.current) return
    const dx = e.touches[0].clientX - touchRef.current.x
    const dy = e.touches[0].clientY - touchRef.current.y

    if (!touchRef.current.moved && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
      clearTimeout(longTimer.current)
      touchRef.current = null
      return
    }

    if (Math.abs(dx) > 6) {
      touchRef.current.moved = true
      clearTimeout(longTimer.current)
      setDragging(true)
      const base = open ? -REVEAL : 0
      setOffsetX(Math.max(-REVEAL, Math.min(0, base + dx)))
    }
  }

  function handleTouchEnd() {
    clearTimeout(longTimer.current)
    if (dragging) {
      setOpen(offsetX < -(REVEAL / 2))
      setOffsetX(0)
      setDragging(false)
    } else if (open && touchRef.current && !touchRef.current.moved) {
      setOpen(false)
    }
    touchRef.current = null
  }

  const translateX = dragging ? offsetX : (open ? -REVEAL : 0)

  return (
    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
      {/* Botones de acción */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0,
        width: REVEAL, display: 'flex',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <button
          onClick={() => { setOpen(false); onEdit(gasto) }}
          style={{
            flex: 1, border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '4px', fontSize: '11px', fontWeight: 600,
          }}
        >
          <EditIcon />
          Editar
        </button>
        <button
          onClick={() => { setOpen(false); onDelete(gasto) }}
          style={{
            flex: 1, border: 'none',
            background: 'var(--danger)',
            color: '#fff',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '4px', fontSize: '11px', fontWeight: 600,
          }}
        >
          <TrashIcon />
          Eliminar
        </button>
      </div>

      {/* Card deslizable */}
      <div
        className="card"
        style={{
          padding: '14px 16px',
          transform: `translateX(${translateX}px)`,
          transition: dragging ? 'none' : 'transform 0.22s ease',
          position: 'relative', zIndex: 1,
          touchAction: 'pan-y',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '12px',
            background: `${info.color}20`,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px', flexShrink: 0,
          }}>
            {info.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              color: 'var(--text-h)', fontSize: '14px', fontWeight: 500,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {gasto.descripcion || gasto.categoria.split('/')[0]}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>
              {gasto.categoria.split('/')[0]} · {formatFecha(gasto.fecha)}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontWeight: 700, color: info.color, fontSize: '15px' }}>
              {gasto.moneda === 'USD' ? 'USD' : 'Bs.'} {formatMonto(gasto.monto)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Modal eliminar ──────────────────────────────────────────────────────────

function ModalEliminar({ gasto, deleting, onConfirm, onCancel }) {
  const info = CATEGORIAS.find(c => c.nombre === gasto.categoria) || CATEGORIAS.at(-1)
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        zIndex: 300,
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: '100%', maxWidth: '480px',
          background: 'var(--bg-surface)',
          borderRadius: '20px 20px 0 0',
          padding: '24px 20px',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          width: '48px', height: '48px',
          borderRadius: '14px',
          background: 'rgba(239,68,68,0.15)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '14px',
        }}>
          <TrashIcon size={22} color="var(--danger)" />
        </div>
        <h3 style={{ fontSize: '17px', marginBottom: '6px' }}>¿Eliminar este gasto?</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          {info.emoji} {gasto.descripcion || gasto.categoria.split('/')[0]}
          {' · '}
          <span style={{ color: info.color, fontWeight: 600 }}>
            {gasto.moneda === 'USD' ? 'USD' : 'Bs.'} {formatMonto(gasto.monto)}
          </span>
          {' · '}{formatFecha(gasto.fecha)}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Esta acción no se puede deshacer.
        </p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '13px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text)', fontSize: '15px',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              flex: 1, padding: '13px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--danger)',
              color: '#fff', fontSize: '15px', fontWeight: 600,
            }}
          >
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function EditIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function LogoutIcon({ size = 15, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function TrashIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  )
}

function formatFecha(fecha) {
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}
