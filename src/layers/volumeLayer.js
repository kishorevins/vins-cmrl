import { ScatterplotLayer } from '@deck.gl/layers'
import { easeCubicInOut } from 'd3-ease'
import { getRidershipAtHour } from '../utils/dataTransforms'
import { makeRadiusScale, makeVolumeColorScale } from '../utils/colorScales'

// Returns [glowLayer, mainLayer]
export function buildVolumeLayers(stations, hour, isActive, maxRidership, isMobile = false) {
  // Thicker station outlines on mobile to remain visible on high-DPI screens
  const mobileScale = isMobile ? 1.5 : 1
  const radiusScale  = makeRadiusScale(maxRidership)
  const opacityScale = makeVolumeColorScale(maxRidership)

  // Identify top-5 busiest stations at current hour for glow effect
  const top5Ids = new Set(
    [...stations]
      .map(d => ({ id: d.properties.id, total: getRidershipAtHour(d, hour).total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(x => x.id)
  )

  // Soft ambient glow behind the top-5 busiest hubs.
  // Glow hue reflects station role: orange-red for job hubs, blue for residential.
  const glowLayer = new ScatterplotLayer({
    id: 'volume-glow',
    data: stations.filter(d => top5Ids.has(d.properties.id)),
    opacity: isActive ? 0.4 : 0,
    transitions: {
      opacity: { duration: 600 },
      getRadius: { duration: 700, easing: easeCubicInOut },
    },
    getPosition: d => d.geometry.coordinates,
    getRadius: d => radiusScale(getRidershipAtHour(d, hour).total) * 2.0,
    getFillColor: d => {
      const { entries, exits } = getRidershipAtHour(d, hour)
      if (exits > entries * 1.4) return [255, 100, 50, 15]   // job hub → orange-red
      if (entries > exits * 1.4) return [100, 150, 255, 15]  // residential → blue
      return [255, 150, 30, 12]                              // balanced → amber
    },
    radiusUnits: 'meters',
    pickable: false,
    stroked: false,
    updateTriggers: { getRadius: [hour], getFillColor: [hour] },
  })

  // Main station circles — sqrt-scaled, thin outline for visual separation.
  // Fill color encodes TWO dimensions:
  //   1. Tier (brightness/opacity) via quantile-based scale — ghost/regular/busy/packed
  //   2. Station role (hue shift) — job hub → orange-red, residential → blue-gold
  const mainLayer = new ScatterplotLayer({
    id: 'volume',
    data: stations,
    opacity: isActive ? 0.75 : 0,
    transitions: {
      opacity: { duration: 600 },
      getRadius: { duration: 700, easing: easeCubicInOut },
      getFillColor: { duration: 700, easing: easeCubicInOut },
    },
    getPosition: d => d.geometry.coordinates,
    getRadius: d => radiusScale(getRidershipAtHour(d, hour).total),
    getFillColor: d => {
      const { entries, exits, total } = getRidershipAtHour(d, hour)
      // Step 1: get tier base color [r, g, b, a]
      const [r, g, b, a] = opacityScale(total)
      // Step 2: apply hue shift based on station role
      if (exits > entries * 1.4) {
        // Job hub (more exits): shift toward orange-red
        return [Math.min(255, r + 20), Math.max(0, g - 30), Math.max(0, b - 10), a]
      }
      if (entries > exits * 1.4) {
        // Residential origin (more entries): shift toward blue-gold
        return [Math.max(0, r - 20), Math.min(255, g + 10), Math.min(255, b + 30), a]
      }
      // Balanced/interchange: keep base amber tier color unchanged
      return [r, g, b, a]
    },
    stroked: true,
    getLineColor: d => {
      const { entries, exits } = getRidershipAtHour(d, hour)
      if (exits > entries * 1.4) return [220, 100, 60, 80]   // job hub → red outline
      if (entries > exits * 1.4) return [100, 160, 220, 80]  // residential → blue outline
      return [255, 200, 80, 50]                              // balanced → gold outline
    },
    lineWidthMinPixels: 0.5 * mobileScale,
    radiusUnits: 'meters',
    pickable: true,
    updateTriggers: {
      getRadius: [hour],
      getFillColor: [hour],
      getLineColor: [hour],
    },
  })

  return [glowLayer, mainLayer]
}
