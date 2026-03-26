import { ScatterplotLayer } from '@deck.gl/layers'
import { easeCubicInOut } from 'd3-ease'
import { getRidershipAtHour } from '../utils/dataTransforms'
import { entryExitColor } from '../utils/colorScales'

// maxTotal: the highest single-hour total ridership across all stations (used to normalise radius).
// Pass findMaxRidership(stations) from the call site so the scale is consistent across hours.
export function buildEntryExitLayer(stations, hour, isActive, maxTotal = 1) {
  return new ScatterplotLayer({
    id: 'entry-exit',
    data: stations,
    opacity: isActive ? 0.8 : 0,
    transitions: {
      opacity: { duration: 600 },
      getFillColor: { duration: 700, easing: easeCubicInOut },
      getRadius: { duration: 400, easing: easeCubicInOut },
    },
    getPosition: d => d.geometry.coordinates,
    // Scale circle area by volume: sqrt-normalised so large stations don't visually dominate.
    // Range: 200m (tiny station, near-zero riders) → 900m (busiest hub at peak hour).
    getRadius: d => {
      const { total } = getRidershipAtHour(d, hour)
      const norm = Math.sqrt(total / maxTotal)
      return 200 + norm * 700
    },
    getFillColor: d => {
      const { entries, exits, total } = getRidershipAtHour(d, hour)
      // Avoid division by zero; neutral color if no data
      if (entries + exits === 0) return [100, 100, 100, 60]
      const ratio = exits / Math.max(entries, 1)
      const [r, g, b] = entryExitColor(ratio)
      // Dim stations with very few riders — the ratio is unreliable with small samples.
      // Full opacity at 200+ total riders; scales down linearly below that.
      const reliabilityAlpha = Math.min(1, total / 200)
      return [r, g, b, Math.round(200 * reliabilityAlpha)]
    },
    radiusUnits: 'meters',
    pickable: true,
    stroked: false,
    updateTriggers: {
      getFillColor: [hour],
      getRadius: [hour, maxTotal],
    },
  })
}
