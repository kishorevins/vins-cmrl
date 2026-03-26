import { ScatterplotLayer, TextLayer } from '@deck.gl/layers'
import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import { populationColorRange } from '../utils/colorScales'

// Haversine distance in metres
function haverDist([lng1, lat1], [lng2, lat2]) {
  const R = 6371000
  const toRad = d => d * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Hardcoded fallback labels for known Chennai gap zones (used when dynamic clustering
// doesn't find a better name for a cluster centroid near these coordinates)
const KNOWN_LABELS = [
  { position: [80.220, 13.082], text: 'North Chennai gap:\nhigh density, sparse coverage', align: 'left' },
  { position: [80.278, 13.010], text: 'South Chennai gap:\nhigh density, sparse coverage', align: 'left' },
  { position: [80.250, 12.950], text: 'IT Corridor:\nno metro coverage', align: 'left' },
]

// Find the nearest known label within ~1.5km of a centroid; returns label text or null
function nearestKnownLabel(centroid) {
  for (const label of KNOWN_LABELS) {
    if (haverDist(label.position, centroid) < 1500) return label
  }
  return null
}

// Cluster gap cells into groups ~1km apart (greedy) and return top N by total severity weight
function topGapClusters(gapCells, n = 3, clusterRadius = 1000) {
  // Sort cells by their individual severity weight descending so we seed clusters on peaks
  const sorted = [...gapCells].sort((a, b) => b.severityWeight - a.severityWeight)
  const clusters = []

  for (const cell of sorted) {
    // Check if this cell already belongs to an existing cluster
    const existing = clusters.find(c => haverDist(c.centroid, cell.position) <= clusterRadius)
    if (existing) {
      existing.totalWeight += cell.severityWeight
      existing.cells.push(cell)
      // Recompute weighted centroid incrementally
      const w = existing.totalWeight
      existing.centroid = [
        existing.centroid[0] + (cell.position[0] - existing.centroid[0]) * (cell.severityWeight / w),
        existing.centroid[1] + (cell.position[1] - existing.centroid[1]) * (cell.severityWeight / w),
      ]
    } else {
      clusters.push({ centroid: cell.position, totalWeight: cell.severityWeight, cells: [cell] })
    }
  }

  // Return top N clusters by accumulated severity weight
  return clusters
    .sort((a, b) => b.totalWeight - a.totalWeight)
    .slice(0, n)
}

export function buildCoverageGapLayers(stations, populationGrid, isActive, catchmentRadius = 500, isMobile = false) {
  if (!populationGrid) return []
  // Slightly thicker catchment ring strokes on mobile for legibility on high-DPI screens
  const mobileScale = isMobile ? 1.5 : 1
  const stationPositions = stations.map(s => s.geometry.coordinates)

  // Graduated coverage: instead of binary covered/gap, compute how far each cell
  // is from its nearest station as a fraction of the catchment radius.
  const DENSITY_THRESHOLD = 0.12  // ignore very sparse cells
  const gapCells = []
  const coveredCells = []

  for (const cell of populationGrid) {
    if (cell.weight < DENSITY_THRESHOLD) continue

    // Distance to nearest station
    const minDist = Math.min(...stationPositions.map(pos => haverDist(pos, cell.position)))

    // coverageScore: 1.0 = directly at a station, 0 = far outside catchment
    const coverageScore = Math.max(0, 1 - (minDist / catchmentRadius) ** 1.5)
    const gapSeverity = 1 - coverageScore  // 0 = no gap, 1 = full gap

    // Skip cells that are barely outside coverage — removes the sharp binary edge
    if (gapSeverity <= 0.15) {
      coveredCells.push(cell)
      continue
    }

    // Attach severity so downstream code can weight heatmap and cluster annotations
    gapCells.push({ ...cell, gapSeverity, severityWeight: cell.weight * gapSeverity })
  }

  // Gap heatmap — smooth red gradient over uncovered high-density areas.
  // Uses severityWeight (population × gap severity) so cells barely outside the
  // catchment radius contribute much less heat than cells far from any station.
  const gapLayer = new HeatmapLayer({
    id: 'coverage-gap-heatmap',
    data: gapCells,
    opacity: isActive ? 0.72 : 0,
    transitions: { opacity: { duration: 600 } },
    getPosition: d => d.position,
    getWeight: d => d.severityWeight,
    radiusPixels: 45,
    intensity: 1.4,
    threshold: 0.04,
    colorRange: [
      [254, 235, 200, 0],
      [253, 174, 107, 180],
      [240,  59,  32, 210],
      [165,  15,  21, 240],
    ],
    updateTriggers: { getWeight: [catchmentRadius] },
  })

  // Station catchment rings — prominent green outlines
  const catchmentLayer = new ScatterplotLayer({
    id: 'coverage-catchment',
    data: stations,
    opacity: isActive ? 0.85 : 0,
    transitions: { opacity: { duration: 600 }, getRadius: { duration: 400 } },
    getPosition: d => d.geometry.coordinates,
    getRadius: catchmentRadius,
    updateTriggers: { getRadius: [catchmentRadius] },
    getFillColor: [0, 200, 100, 18],
    getLineColor: [0, 220, 110, 200],
    stroked: true,
    filled: true,
    radiusUnits: 'meters',
    lineWidthMinPixels: 1.5 * mobileScale,
    pickable: false,
  })

  // Dynamic annotation callouts — find top-3 highest-severity gap clusters and label them.
  // Falls back to known neighborhood names when a cluster centroid is near a hardcoded label.
  const topClusters = topGapClusters(gapCells, 3, 1000)
  const dynamicAnnotations = topClusters.map(cluster => {
    const known = nearestKnownLabel(cluster.centroid)
    return {
      position: cluster.centroid,
      text: known ? known.text : 'High Gap Zone',
      align: known ? known.align : 'left',
    }
  })

  const annotationLayer = new TextLayer({
    id: 'coverage-annotations',
    data: dynamicAnnotations,
    opacity: isActive ? 1 : 0,
    transitions: { opacity: { duration: 600 } },
    getPosition: d => d.position,
    getText: d => d.text,
    getSize: 12,
    getColor: [255, 255, 255, 220],
    getTextAnchor: d => d.align === 'right' ? 'end' : 'start',
    getAlignmentBaseline: 'center',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
    fontWeight: 600,
    outlineWidth: 3,
    outlineColor: [0, 0, 0, 200],
    sizeUnits: 'pixels',
    pickable: false,
    parameters: { depthTest: false },
    lineHeight: 1.4,
    updateTriggers: { getText: [catchmentRadius], getPosition: [catchmentRadius] },
  })

  return [gapLayer, catchmentLayer, annotationLayer]
}
