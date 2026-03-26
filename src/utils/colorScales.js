import { scaleLinear, scaleDiverging, scaleSequential, scalePow } from 'd3-scale'
import { interpolateRdBu, interpolateYlOrRd } from 'd3-scale-chromatic'

// Convert a d3 rgb string like "rgb(255, 100, 0)" → [255, 100, 0]
export function d3ColorToRgb(colorStr) {
  const m = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!m) return [255, 255, 255]
  return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])]
}

// Quantile-based 4-tier color scale for volume layer.
// Divides stations into ghost / regular / busy / packed quartiles so that
// mid-range stations are visually distinct from low-traffic ones.
// Returns a step function: (ridership) => [r, g, b, a]
export function makeVolumeColorScale(maxRidership) {
  // Tier thresholds as fractions of peak ridership
  const t25 = maxRidership * 0.25
  const t50 = maxRidership * 0.50
  const t75 = maxRidership * 0.75

  return function(ridership) {
    if (ridership < t25) {
      // ghost: low-traffic stations — visible but clearly quieter than active ones
      return [150, 110, 70, 90]
    } else if (ridership < t50) {
      // regular: muted amber-brown — clearly present but not loud
      return [160, 90, 25, 140]
    } else if (ridership < t75) {
      // busy: warm amber — noticeably active
      return [210, 130, 30, 170]
    } else {
      // packed: bright gold-amber — unmistakably high traffic
      return [255, 185, 40, 240]
    }
  }
}

// sqrt radius scale: large range gives clear visual hierarchy without overplotting
export function makeRadiusScale(maxVolume) {
  return scalePow().exponent(0.5).domain([0, maxVolume]).range([80, 900]).clamp(true)
}

// Diverging RdBu scale for entry/exit ratio
// ratio > 1 = more exits = job hub = warm (red end)
// ratio < 1 = more entries = residential = cool (blue end)
// minRatio/maxRatio are data-driven; defaults match historical observed range
export function entryExitColor(ratio, minRatio = 0.3, maxRatio = 3.0) {
  const scale = scaleDiverging(interpolateRdBu).domain([minRatio, 1.0, maxRatio])
  return d3ColorToRgb(scale(ratio))
}

// Sequential for heatmap reference
export const populationColorRange = [
  [255, 255, 178, 0],
  [254, 217, 118, 100],
  [254, 178, 76, 160],
  [253, 141, 60, 200],
  [240, 59, 32, 230],
  [189, 0, 38, 255],
]

// Layer legend configs
export const LAYER_LEGENDS = {
  volume: {
    label: 'Station ridership',
    gradient: 'linear-gradient(to right, rgba(255,140,0,0.2), rgba(255,140,0,1))',
    minLabel: 'Low',
    maxLabel: 'High',
  },
  entryExit: {
    label: 'Entry / Exit ratio',
    gradient: 'linear-gradient(to right, #4575b4, #ffffbf, #d73027)',
    minLabel: 'Residential origin',
    maxLabel: 'Job hub',
  },
  odFlow: {
    label: 'Passenger flow volume',
    gradient: 'linear-gradient(to right, rgba(255,100,20,0.3), rgba(160,40,255,0.8))',
    minLabel: 'Low flow',
    maxLabel: 'High flow',
  },
  weekdayWeekend: {
    label: 'Ridership intensity',
    gradient: 'linear-gradient(to right, rgba(30,100,220,0.2), rgba(30,100,220,1))',
    minLabel: 'Low',
    maxLabel: 'High',
    weekendGradient: 'linear-gradient(to right, rgba(180,30,200,0.2), rgba(180,30,200,1))',
    // Delta mode: blue = weekday dominant, purple = weekend dominant
    deltaGradient: 'linear-gradient(to right, rgba(30,100,220,0.9), rgba(255,255,255,0.3), rgba(180,30,200,0.9))',
  },
  coverageGap: {
    label: 'Population density',
    gradient: 'linear-gradient(to right, rgba(255,255,178,0.3), #bd0026)',
    minLabel: 'low density',
    maxLabel: 'high density',
    note: 'Green rings = 500m metro catchment',
  },
}
