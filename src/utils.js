export const CATEGORIAS = [
  { nombre: 'Alimentación/Restaurantes', emoji: '🍽️', color: 'var(--cat-alimentacion)' },
  { nombre: 'Transporte/Combustible',    emoji: '🚗', color: 'var(--cat-transporte)' },
  { nombre: 'Entretenimiento/Salidas',   emoji: '🎉', color: 'var(--cat-entretenimiento)' },
  { nombre: 'Salud/Farmacia',            emoji: '💊', color: 'var(--cat-salud)' },
  { nombre: 'Ropa/Accesorios',           emoji: '👗', color: 'var(--cat-ropa)' },
  { nombre: 'Casa/Servicios',            emoji: '🏠', color: 'var(--cat-casa)' },
  { nombre: 'Viaje',                     emoji: '✈️', color: 'var(--cat-viaje)' },
  { nombre: 'Membresías/Deportes',       emoji: '💪', color: 'var(--cat-membresias)' },
  { nombre: 'Otros',                     emoji: '📦', color: 'var(--cat-otros)' },
]

export function formatMonto(num) {
  const n = Number(num)
  if (isNaN(n)) return '0'
  return n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function getMesLabel(month, year) {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]
  return `${meses[month]} ${year}`
}

export function getFechaHoy() {
  return new Date().toISOString().split('T')[0]
}
