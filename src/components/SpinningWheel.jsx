import { forwardRef, useImperativeHandle, useRef, useState } from 'react'

const sliceColors = [
  '#6366f1',
  '#10b981',
  '#f43f5e',
  '#f59e0b',
  '#0ea5e9',
  '#8b5cf6',
  '#14b8a6',
  '#fb7185',
  '#84cc16',
  '#38bdf8',
  '#f472b6',
  '#a855f7',
]

const CENTER = 200
const RADIUS = 185
const LABEL_RADIUS = 108

function point(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function truncate(name, max) {
  return name.length > max ? name.slice(0, max - 1) + '…' : name
}

const SpinningWheel = forwardRef(function SpinningWheel({ items, onSpinStart, onSettle }, ref) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)

  const latest = useRef({ rotation: 0, spinning: false, items, onSpinStart, onSettle })
  latest.current.rotation = rotation
  latest.current.spinning = spinning
  latest.current.items = items
  latest.current.onSpinStart = onSpinStart
  latest.current.onSettle = onSettle

  useImperativeHandle(
    ref,
    () => ({
      spin() {
        const current = latest.current
        if (current.spinning || current.items.length < 2) return
        setSpinning(true)
        if (current.onSpinStart) current.onSpinStart()

        const count = current.items.length
        const slice = 360 / count
        const target = Math.floor(Math.random() * count)
        const deltaBase = (360 - (target + 0.5) * slice + 360) % 360
        const jitter = (Math.random() - 0.5) * (slice - 6)
        const turns = 5 + Math.floor(Math.random() * 3)

        setRotation(current.rotation + turns * 360 + deltaBase + jitter)

        window.setTimeout(() => {
          const onSettle = latest.current.onSettle
          setSpinning(false)
          if (onSettle) onSettle(latest.current.items[target])
        }, 4100)
      },
      isSpinning() {
        return latest.current.spinning
      },
    }),
    []
  )

  const count = items.length
  const slice = count > 0 ? 360 / count : 0
  const maxChars = Math.max(3, Math.floor((LABEL_RADIUS * 2 * Math.PI * slice) / 360 / 16))

  return (
    <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] mx-auto">
      <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-xl">
        {/* الإطار الخارجي */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS + 14} fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />

        {/* الفرصة الدوّارة */}
        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: '200px 200px',
            transition: spinning ? 'transform 4s cubic-bezier(0.16, 0.72, 0.17, 1)' : 'none',
          }}
        >
          {items.map((item, i) => {
            const name = String(item.name ?? item)
            const a0 = -90 + i * slice
            const a1 = a0 + slice
            const mid = a0 + slice / 2
            const p1 = point(CENTER, CENTER, RADIUS, a0)
            const p2 = point(CENTER, CENTER, RADIUS, a1)
            const label = point(CENTER, CENTER, LABEL_RADIUS, mid)
            const bigArc = slice > 180 ? 1 : 0
            return (
              <g key={item.id ?? i}>
                <path
                  d={`M ${CENTER} ${CENTER} L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${RADIUS} ${RADIUS} 0 ${bigArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`}
                  fill={sliceColors[i % sliceColors.length]}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={label.x}
                  y={label.y}
                  transform={`rotate(${mid + 90} ${label.x} ${label.y})`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="16"
                  fontWeight="700"
                  fill="#ffffff"
                  style={{ pointerEvents: 'none' }}
                >
                  {truncate(name, maxChars)}
                </text>
              </g>
            )
          })}
        </g>

        {/* المؤشر الثابت في الأعلى */}
        <polygon
          points="200,6 186,34 214,34"
          fill="#e11d48"
          stroke="#ffffff"
          strokeWidth="2"
          style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))' }}
        />

        {/* مركز العجلة */}
        <circle cx={CENTER} cy={CENTER} r={30} fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
        <circle cx={CENTER} cy={CENTER} r={18} fill="#4f46e5" />
        <text x={CENTER} y={CENTER} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="800" fill="#ffffff">
          {count}
        </text>
      </svg>
    </div>
  )
})

export default SpinningWheel