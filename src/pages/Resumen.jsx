import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { CATEGORIAS, formatMonto, getMesLabel } from '../utils'

export default function Resumen() {
  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [gastos, setGastos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGastos()
  }, [mes, anio])

  async function fetchGastos() {
    setLoading(true)
    const inicio = new Date(anio, mes, 1).toISOString().split('T')[0]
    const fin = new Date(anio, mes + 1, 0).toISOString().split('T')[0]
    const { data } = await supabase
      .from('Gastos')
      .select('*')
      .gte('fecha', inicio)
      .lte('fecha', fin)
    setGastos(data || [])
    setLoading(false)
  }

  function cambiarMes(dir) {
    let nuevoMes = mes + dir
    let nuevoAnio = anio
    if (nuevoMes < 0) { nuevoMes = 11; nuevoAnio-- }
    if (nuevoMes > 11) { nuevoMes = 0; nuevoAnio++ }
    setMes(nuevoMes)
    setAnio(nuevoAnio)
  }

  const gastosBs = gastos.filter(g => g.moneda === 'Bs')
  const gastosUSD = gastos.filter(g => g.moneda === 'USD')
  const totalBs = gastosBs.reduce((s, g) => s + Number(g.monto), 0)
  const totalUSD = gastosUSD.reduce((s, g) => s + Number(g.monto), 0)

  const porCategoria = CATEGORIAS.map(cat => {
    const subtotal = gastosBs.filter(g => g.categoria === cat.nombre).reduce((s, g) => s + Number(g.monto), 0)
    const subtotalUSD = gastosUSD.filter(g => g.categoria === cat.nombre).reduce((s, g) => s + Number(g.monto), 0)
    const count = gastos.filter(g => g.categoria === cat.nombre).length
    return { ...cat, subtotal, subtotalUSD, count }
  }).filter(c => c.subtotal > 0 || c.subtotalUSD > 0)
    .sort((a, b) => b.subtotal - a.subtotal)

  const maxMonto = porCategoria[0]?.subtotal || 1

  return (
    <div className="page">
      <header className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
        <h1>Resumen</h1>
        {/* Selector de mes */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '8px 14px',
          width: '100%',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={() => cambiarMes(-1)}
            style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '18px', padding: '0 4px' }}
          >
            ‹
          </button>
          <span style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: '15px' }}>
            {getMesLabel(mes, anio)}
          </span>
          <button
            onClick={() => cambiarMes(1)}
            disabled={mes === hoy.getMonth() && anio === hoy.getFullYear()}
            style={{
              background: 'none',
              border: 'none',
              color: (mes === hoy.getMonth() && anio === hoy.getFullYear()) ? 'var(--border)' : 'var(--text)',
              fontSize: '18px',
              padding: '0 4px',
            }}
          >
            ›
          </button>
        </div>
      </header>

      {/* Totales */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <p className="label">Total Bs.</p>
          {loading ? <div style={{ height: '32px' }} /> : (
            <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent)', marginTop: '4px' }}>
              {formatMonto(totalBs)}
            </p>
          )}
        </div>
        {totalUSD > 0 && (
          <div className="card" style={{ flex: 1, textAlign: 'center' }}>
            <p className="label">Total USD</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--cat-viaje)', marginTop: '4px' }}>
              {formatMonto(totalUSD)}
            </p>
          </div>
        )}
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <p className="label">Gastos</p>
          {loading ? <div style={{ height: '32px' }} /> : (
            <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-h)', marginTop: '4px' }}>
              {gastos.length}
            </p>
          )}
        </div>
      </div>

      {/* Barras por categoría */}
      <p className="label" style={{ marginBottom: '10px' }}>Por categoría</p>

      {loading ? (
        <div className="spinner" />
      ) : porCategoria.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>📊</div>
          <p>Sin gastos en {getMesLabel(mes, anio)}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {porCategoria.map(cat => {
            const pct = totalBs > 0 ? (cat.subtotal / totalBs) * 100 : 0
            const barPct = maxMonto > 0 ? (cat.subtotal / maxMonto) * 100 : 0
            return (
              <div key={cat.nombre} className="card" style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: `${cat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '17px',
                    flexShrink: 0,
                  }}>
                    {cat.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-h)' }}>
                      {cat.nombre.split('/')[0]}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {cat.count} {cat.count === 1 ? 'transacción' : 'transacciones'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {cat.subtotal > 0 && (
                      <p style={{ fontSize: '14px', fontWeight: 700, color: cat.color }}>
                        Bs. {formatMonto(cat.subtotal)}
                      </p>
                    )}
                    {cat.subtotalUSD > 0 && (
                      <p style={{ fontSize: '12px', color: 'var(--cat-viaje)' }}>
                        USD {formatMonto(cat.subtotalUSD)}
                      </p>
                    )}
                    {cat.subtotal > 0 && totalBs > 0 && (
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {pct.toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
                {cat.subtotal > 0 && (
                  <div style={{ height: '5px', borderRadius: '5px', background: 'var(--border)' }}>
                    <div style={{
                      height: '100%',
                      borderRadius: '5px',
                      background: cat.color,
                      width: `${barPct}%`,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Detalle promedio diario */}
      {!loading && gastos.length > 0 && (
        <div className="card" style={{ marginTop: '16px', padding: '16px' }}>
          <p className="label" style={{ marginBottom: '8px' }}>Estadísticas del mes</p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Promedio por gasto</p>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>
                Bs. {formatMonto(totalBs / (gastosBs.length || 1))}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Categorías activas</p>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>
                {porCategoria.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
