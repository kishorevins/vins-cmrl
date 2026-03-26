import { getDailyRidership } from '../utils/dataTransforms'

// Shows top-5 weekday and top-5 weekend stations by total ridership.
// Only visible for the weekday/weekend layer, hidden in compare mode.
export default function StationRankingPanel({ stations, weekdayData, weekendData, activeLayer, mode }) {
  if (activeLayer !== 'weekdayWeekend') return null
  if (mode === 'compare') return null

  const rank = (data) =>
    stations
      .map(s => ({ name: s.properties.name, total: getDailyRidership(data, s.properties.id).total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

  const topWeekday = rank(weekdayData)
  const topWeekend = rank(weekendData)

  return (
    <div
      className="absolute top-20 left-4 z-10 px-4 py-3 rounded-2xl border border-white/10 w-64"
      style={{ backdropFilter: 'blur(14px)', background: 'rgba(0,0,0,0.50)' }}
    >
      <div className="grid grid-cols-2 gap-3">
        {/* Weekday column */}
        <div>
          <div className="text-blue-300/70 text-xs uppercase tracking-wider mb-2 font-semibold">
            Weekday Top 5
          </div>
          {topWeekday.map((s, i) => (
            <div key={i} className="flex justify-between items-baseline gap-1 mb-1">
              <span className="text-white/30 text-xs tabular-nums w-3">{i + 1}</span>
              <span className="text-white/70 text-xs truncate flex-1">{s.name}</span>
              <span className="text-blue-300 text-xs tabular-nums">{fmt(s.total)}</span>
            </div>
          ))}
        </div>

        {/* Weekend column */}
        <div>
          <div className="text-purple-300/70 text-xs uppercase tracking-wider mb-2 font-semibold">
            Weekend Top 5
          </div>
          {topWeekend.map((s, i) => (
            <div key={i} className="flex justify-between items-baseline gap-1 mb-1">
              <span className="text-white/30 text-xs tabular-nums w-3">{i + 1}</span>
              <span className="text-white/70 text-xs truncate flex-1">{s.name}</span>
              <span className="text-purple-300 text-xs tabular-nums">{fmt(s.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function fmt(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
