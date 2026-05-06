import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { CATEGORIAS, formatMonto, getMesLabel } from '../utils'

export default function IA() {
  const [gastos, setGastos] = useState([])
  const [loading, setLoading] = useState(true)
  const [analizando, setAnalizando] = useState(false)
  const [insights, setInsights] = useState(null)

  const hoy = new Date()

  useEffect(() => {
    fetchUltimos3Meses()
  }, [])

  async function fetchUltimos3Meses() {
    setLoading(true)
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1).toISOString().split('T')[0]
    const { data } = await supabase
      .from('Gastos')
      .select('*')
      .gte('fecha', inicio)
      .order('fecha', { ascending: false })
    setGastos(data || [])
    setLoading(false)
  }

  function analizar() {
    setAnalizando(true)
    setTimeout(() => {
      setInsights(calcularInsights(gastos, hoy))
      setAnalizando(false)
    }, 900)
  }

  if (loading) return (
    <div className="page">
      <header className="page-header"><h1>Análisis IA</h1></header>
      <div className="spinner" />
    </div>
  )

  return (
    <div className="page">
      <header className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <h1>Análisis IA</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Últimos 3 meses · {gastos.length} transacciones
        </p>
      </header>

      {!insights && (
        <div className="card" style={{ textAlign: 'center', padding: '32px 20px', marginBottom: '16px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div>
          <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Análisis inteligente</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>
            Analizo tus patrones de gasto y genero recomendaciones personalizadas basadas en tus datos reales.
          </p>
          <button
            onClick={analizar}
            disabled={analizando || gastos.length === 0}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: 600,
              opacity: gastos.length === 0 ? 0.5 : 1,
            }}
          >
            {analizando ? 'Analizando…' : gastos.length === 0 ? 'Sin datos suficientes' : 'Analizar mis gastos'}
          </button>
        </div>
      )}

      {analizando && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          Procesando tus datos…
        </div>
      )}

      {insights && <InsightsPanel insights={insights} onReset={() => setInsights(null)} />}
    </div>
  )
}

function InsightsPanel({ insights, onReset }) {
  const { mesActual, mesAnterior, topCat, diasActivo, catMasAlta, recomendaciones, tendencia } = insights

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Resumen rápido */}
      <div className="card">
        <p className="label" style={{ marginBottom: '12px' }}>📅 Este mes vs. el anterior</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Este mes</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent)', marginTop: '4px' }}>
              Bs. {formatMonto(mesActual)}
            </p>
          </div>
          <div style={{
            width: '1px',
            background: 'var(--border)',
            margin: '0 4px',
          }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mes anterior</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-h)', marginTop: '4px' }}>
              Bs. {formatMonto(mesAnterior)}
            </p>
          </div>
          <div style={{
            width: '1px',
            background: 'var(--border)',
            margin: '0 4px',
          }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Variación</p>
            <p style={{
              fontSize: '18px',
              fontWeight: 700,
              color: tendencia <= 0 ? 'var(--success)' : 'var(--danger)',
              marginTop: '4px',
            }}>
              {tendencia > 0 ? '+' : ''}{tendencia.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Categoría más alta */}
      {catMasAlta && (
        <div className="card" style={{
          borderColor: catMasAlta.color,
          background: `${catMasAlta.color}0a`,
        }}>
          <p className="label" style={{ marginBottom: '8px' }}>🔥 Mayor gasto este mes</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>{catMasAlta.emoji}</span>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: '15px' }}>
                {catMasAlta.nombre.split('/')[0]}
              </p>
              <p style={{ color: catMasAlta.color, fontWeight: 600, fontSize: '14px', marginTop: '2px' }}>
                Bs. {formatMonto(catMasAlta.monto)} · {catMasAlta.pct.toFixed(1)}% del total
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top categorías */}
      {topCat.length > 0 && (
        <div className="card">
          <p className="label" style={{ marginBottom: '12px' }}>📊 Distribución (3 meses)</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topCat.map((cat, i) => (
              <div key={cat.nombre}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '16px' }}>{cat.emoji}</span>
                    <span style={{ color: 'var(--text-h)', fontWeight: 500 }}>{cat.nombre.split('/')[0]}</span>
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: cat.color }}>
                    Bs. {formatMonto(cat.total)} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({cat.pct.toFixed(0)}%)</span>
                  </span>
                </div>
                <div style={{ height: '4px', borderRadius: '4px', background: 'var(--border)' }}>
                  <div style={{
                    height: '100%',
                    borderRadius: '4px',
                    background: cat.color,
                    width: `${cat.pct}%`,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Días activos */}
      <div className="card">
        <p className="label" style={{ marginBottom: '8px' }}>📆 Actividad</p>
        <div style={{ display: 'flex', gap: '0' }}>
          {[0, 1, 2, 3, 4, 5, 6].map(d => {
            const nombre = ['L', 'M', 'X', 'J', 'V', 'S', 'D'][d]
            const count = diasActivo[d] || 0
            const max = Math.max(...Object.values(diasActivo), 1)
            const pct = count / max
            return (
              <div key={d} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  margin: '0 auto 4px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: pct > 0 ? `rgba(192,132,252,${0.15 + pct * 0.7})` : 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: pct > 0.5 ? '#fff' : 'var(--text)',
                }}>
                  {count || ''}
                </div>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{nombre}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="card">
        <p className="label" style={{ marginBottom: '12px' }}>💡 Recomendaciones</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {recomendaciones.map((r, i) => (
            <div key={i} style={{
              padding: '12px',
              borderRadius: '10px',
              background: 'var(--bg-surface)',
              display: 'flex',
              gap: '10px',
            }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{r.icon}</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '2px' }}>
                  {r.titulo}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {r.detalle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onReset}
        style={{
          background: 'none',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '12px',
          color: 'var(--text-muted)',
          fontSize: '13px',
          marginBottom: '8px',
        }}
      >
        Actualizar análisis
      </button>
    </div>
  )
}

function calcularInsights(gastos, hoy) {
  const mesActualNum = hoy.getMonth()
  const anioActual = hoy.getFullYear()
  const mesAnteriorNum = mesActualNum === 0 ? 11 : mesActualNum - 1
  const anioAnterior = mesActualNum === 0 ? anioActual - 1 : anioActual

  const gastosBs = gastos.filter(g => g.moneda === 'Bs')

  const delMesActual = gastosBs.filter(g => {
    const f = new Date(g.fecha + 'T00:00:00')
    return f.getMonth() === mesActualNum && f.getFullYear() === anioActual
  })
  const delMesAnterior = gastosBs.filter(g => {
    const f = new Date(g.fecha + 'T00:00:00')
    return f.getMonth() === mesAnteriorNum && f.getFullYear() === anioAnterior
  })

  const mesActual = delMesActual.reduce((s, g) => s + Number(g.monto), 0)
  const mesAnterior = delMesAnterior.reduce((s, g) => s + Number(g.monto), 0)
  const tendencia = mesAnterior > 0 ? ((mesActual - mesAnterior) / mesAnterior) * 100 : 0

  // Top categorías (3 meses)
  const totalGlobal = gastosBs.reduce((s, g) => s + Number(g.monto), 0)
  const porCat = CATEGORIAS.map(cat => {
    const total = gastosBs.filter(g => g.categoria === cat.nombre).reduce((s, g) => s + Number(g.monto), 0)
    return { ...cat, total, pct: totalGlobal > 0 ? (total / totalGlobal) * 100 : 0 }
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  const topCat = porCat.slice(0, 5)

  // Categoría más alta este mes
  const totalMesActual = delMesActual.reduce((s, g) => s + Number(g.monto), 0)
  const porCatMes = CATEGORIAS.map(cat => {
    const monto = delMesActual.filter(g => g.categoria === cat.nombre).reduce((s, g) => s + Number(g.monto), 0)
    return { ...cat, monto, pct: totalMesActual > 0 ? (monto / totalMesActual) * 100 : 0 }
  }).filter(c => c.monto > 0).sort((a, b) => b.monto - a.monto)
  const catMasAlta = porCatMes[0] || null

  // Días de la semana (0=Lunes…6=Domingo)
  const diasActivo = {}
  gastosBs.forEach(g => {
    const d = new Date(g.fecha + 'T00:00:00').getDay()
    const lun = d === 0 ? 6 : d - 1
    diasActivo[lun] = (diasActivo[lun] || 0) + 1
  })

  // Recomendaciones
  const recomendaciones = []

  if (tendencia > 15) {
    recomendaciones.push({
      icon: '📈',
      titulo: 'Gasto en aumento',
      detalle: `Este mes gastaste ${tendencia.toFixed(0)}% más que el anterior. Revisá en qué categorías subió.`,
    })
  } else if (tendencia < -10) {
    recomendaciones.push({
      icon: '🎯',
      titulo: '¡Buen control!',
      detalle: `Redujiste tus gastos un ${Math.abs(tendencia).toFixed(0)}% respecto al mes pasado. Seguí así.`,
    })
  }

  if (catMasAlta && catMasAlta.pct > 40) {
    recomendaciones.push({
      icon: '⚖️',
      titulo: 'Concentración alta',
      detalle: `${catMasAlta.nombre.split('/')[0]} representa el ${catMasAlta.pct.toFixed(0)}% de tus gastos este mes.`,
    })
  }

  const diasTop = Object.entries(diasActivo).sort((a, b) => b[1] - a[1])
  if (diasTop.length > 0) {
    const diaLabels = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
    recomendaciones.push({
      icon: '📅',
      titulo: 'Día con más gastos',
      detalle: `Gastás más los ${diaLabels[+diasTop[0][0]]}. Planificar compras puede ayudarte a reducirlo.`,
    })
  }

  if (porCat.length >= 2 && porCat[0].pct > 50) {
    recomendaciones.push({
      icon: '🗂️',
      titulo: 'Diversificá tus categorías',
      detalle: `La mitad de tus gastos van a ${porCat[0].nombre.split('/')[0]}. ¿Hay algo ahí que puedas optimizar?`,
    })
  }

  if (gastos.length >= 10 && recomendaciones.length < 3) {
    const promDiario = mesActual / hoy.getDate()
    recomendaciones.push({
      icon: '💰',
      titulo: 'Promedio diario',
      detalle: `Estás gastando aprox. Bs. ${formatMonto(promDiario)} por día este mes.`,
    })
  }

  if (recomendaciones.length === 0) {
    recomendaciones.push({
      icon: '📊',
      titulo: 'Seguí registrando',
      detalle: 'Con más datos podré darte recomendaciones más precisas sobre tus hábitos de gasto.',
    })
  }

  return { mesActual, mesAnterior, topCat, diasActivo, catMasAlta, recomendaciones, tendencia }
}
