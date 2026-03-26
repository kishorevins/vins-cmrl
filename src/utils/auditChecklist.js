/**
 * Audit checklist for the Chennai Metro Intelligence Map.
 *
 * This is a living compliance document — not test code.
 * Statuses: 'implemented' | 'partial' | 'not-implemented'
 *
 * Update `status` and add notes as features are built or verified.
 */

export const AUDIT_CHECKS = [
  // ─────────────────────────────────────────────────
  // 1. Viewport & Scaling
  // ─────────────────────────────────────────────────
  {
    id: 'VP-01',
    category: 'Viewport & Scaling',
    description: 'Viewport meta includes width=device-width, initial-scale=1.0, viewport-fit=cover',
    howToVerify: 'Inspect <head> in DevTools → Elements; look for <meta name="viewport">',
    expectedBehavior: 'No horizontal scroll on any device width ≥320px',
    status: 'implemented',
  },
  {
    id: 'VP-02',
    category: 'Viewport & Scaling',
    description: 'Root app element fills the full viewport height without causing scroll',
    howToVerify: 'Open DevTools → toggle device toolbar → verify no vertical/horizontal overflow at 320px width',
    expectedBehavior: 'App occupies exactly 100dvh / 100vh; no body scroll',
    status: 'implemented',
  },
  {
    id: 'VP-03',
    category: 'Viewport & Scaling',
    description: 'Safe-area insets applied to fixed UI elements (top tabs, bottom attribution, left/right panels)',
    howToVerify: 'Simulate iPhone with notch in DevTools; check that no UI is clipped under the notch or home indicator',
    expectedBehavior: 'All tappable controls and text remain within the safe area on notched devices',
    status: 'implemented',
  },
  {
    id: 'VP-04',
    category: 'Viewport & Scaling',
    description: 'Text does not scale unexpectedly on browser zoom (up to 200%)',
    howToVerify: 'Use browser zoom to 200%; confirm layout does not break and text stays readable',
    expectedBehavior: 'Layout reflows gracefully; no overlapping elements or hidden content',
    status: 'partial',
  },

  // ─────────────────────────────────────────────────
  // 2. Map Display
  // ─────────────────────────────────────────────────
  {
    id: 'MD-01',
    category: 'Map Display',
    description: 'Map tiles load and render within 3 seconds on a fast connection',
    howToVerify: 'Open DevTools → Network tab → reload; filter for tile requests and check timing',
    expectedBehavior: 'Map is visually usable within 3s; no blank grey tiles after load',
    status: 'implemented',
  },
  {
    id: 'MD-02',
    category: 'Map Display',
    description: 'Map basemap switches correctly between light (positron) and dark themes',
    howToVerify: 'Click the theme toggle button; verify tile style URL changes and map re-renders',
    expectedBehavior: 'Seamless style swap; deck.gl layers remain visible on both themes',
    status: 'implemented',
  },
  {
    id: 'MD-03',
    category: 'Map Display',
    description: 'deck.gl layers (volume circles, OD arcs, coverage rings) render without z-fighting or disappearing at zoom extremes',
    howToVerify: 'Zoom in to max (station level) and out to city level; confirm all active layers are visible',
    expectedBehavior: 'Layers scale appropriately with zoom; no flickering or missing geometry',
    status: 'implemented',
  },
  {
    id: 'MD-04',
    category: 'Map Display',
    description: 'Map attribution / copyright notices are visible and not obscured by UI chrome',
    howToVerify: 'Look at bottom-right corner of the map on mobile and desktop',
    expectedBehavior: 'Maplibre attribution badge is always visible',
    status: 'partial',
  },

  // ─────────────────────────────────────────────────
  // 3. Panel Layout
  // ─────────────────────────────────────────────────
  {
    id: 'PL-01',
    category: 'Panel Layout',
    description: 'On desktop (≥768px), StationPanel renders as a 360px side pane alongside the map in a flex row',
    howToVerify: 'Click a station on desktop; verify the map shrinks and the panel appears to the right without overlapping',
    expectedBehavior: 'Map takes flex:1 remaining width; panel is 360px fixed; no overlap',
    status: 'implemented',
  },
  {
    id: 'PL-02',
    category: 'Panel Layout',
    description: 'On mobile (<768px), StationPanel overlays the map as a drawer (does not cause layout shift)',
    howToVerify: 'Click a station on mobile viewport; verify map stays full width behind the overlay panel',
    expectedBehavior: 'Panel slides over the map; map does not shrink',
    status: 'implemented',
  },
  {
    id: 'PL-03',
    category: 'Panel Layout',
    description: 'DataTable panel opens and closes without causing map re-mount or tile flicker',
    howToVerify: 'Toggle DataTable open/close several times; watch the map for tile reloads',
    expectedBehavior: 'Map stays mounted; no visual flash during panel transitions',
    status: 'implemented',
  },
  {
    id: 'PL-04',
    category: 'Panel Layout',
    description: 'Closing a panel (X button or Escape key) returns focus to the triggering element or the map',
    howToVerify: 'Open panel via keyboard; press Escape; verify focus moves back correctly',
    expectedBehavior: 'Focus is not lost to body after panel close',
    status: 'partial',
  },
  {
    id: 'PL-05',
    category: 'Panel Layout',
    description: 'Side panel content is scrollable when it overflows the viewport height',
    howToVerify: 'Select a station with many data rows on a short viewport; scroll the panel',
    expectedBehavior: 'Panel scrolls independently; page body does not scroll',
    status: 'implemented',
  },

  // ─────────────────────────────────────────────────
  // 4. Breakpoints & Content
  // ─────────────────────────────────────────────────
  {
    id: 'BP-01',
    category: 'Breakpoints & Content',
    description: 'useBreakpoint hook correctly classifies xs (<480), sm (480-767), md (768-1023), lg (≥1024)',
    howToVerify: 'Add a temporary breakpoint debug label; resize window across all thresholds',
    expectedBehavior: 'isMobile is true for xs and sm; isDesktop is true only for lg',
    status: 'implemented',
  },
  {
    id: 'BP-02',
    category: 'Breakpoints & Content',
    description: 'Layer tabs are fully visible and tappable on a 320px wide mobile viewport',
    howToVerify: 'Set DevTools to 320px width; verify all tabs are accessible (may scroll horizontally)',
    expectedBehavior: 'No tab is clipped or unreachable; horizontal scroll on the tab bar is acceptable',
    status: 'partial',
  },
  {
    id: 'BP-03',
    category: 'Breakpoints & Content',
    description: 'Time slider and control sliders have adequate touch target size (≥44×44px) on mobile',
    howToVerify: 'Inspect slider thumb size in DevTools; measure computed height/width',
    expectedBehavior: 'Touch targets meet WCAG 2.5.5 AAA (44px) or at minimum WCAG 2.5.8 AA (24px)',
    status: 'partial',
  },
  {
    id: 'BP-04',
    category: 'Breakpoints & Content',
    description: 'Legend and watermark text are legible at all breakpoints without overlapping map controls',
    howToVerify: 'Check all 4 breakpoints in DevTools; look for overlap with LayerTabs or TimeSlider',
    expectedBehavior: 'No UI element overlaps another; legend is always readable',
    status: 'implemented',
  },

  // ─────────────────────────────────────────────────
  // 5. Touch & Interaction
  // ─────────────────────────────────────────────────
  {
    id: 'TI-01',
    category: 'Touch & Interaction',
    description: 'Map supports pinch-to-zoom and two-finger pan on touch devices',
    howToVerify: 'Open on a real iOS/Android device or DevTools touch simulation; pinch and pan the map',
    expectedBehavior: 'Standard map gestures work without triggering page scroll',
    status: 'implemented',
  },
  {
    id: 'TI-02',
    category: 'Touch & Interaction',
    description: 'Station dots are tappable on mobile with a reasonable hit area',
    howToVerify: 'Tap small stations on mobile; confirm StationPanel opens consistently',
    expectedBehavior: 'All stations can be selected without requiring pixel-perfect taps',
    status: 'partial',
  },
  {
    id: 'TI-03',
    category: 'Touch & Interaction',
    description: 'Hover tooltip does not appear on touch devices (no hover state)',
    howToVerify: 'On a touch device, tap a station — verify no tooltip flicker before StationPanel opens',
    expectedBehavior: 'Tooltip is only shown on pointer:fine (mouse) devices',
    status: 'partial',
  },
  {
    id: 'TI-04',
    category: 'Touch & Interaction',
    description: 'Play/pause button for the time animation is keyboard-operable (Space / Enter)',
    howToVerify: 'Tab to the play button; press Space — animation should start/stop',
    expectedBehavior: 'Button responds to keyboard activation; focus ring is visible',
    status: 'implemented',
  },
  {
    id: 'TI-05',
    category: 'Touch & Interaction',
    description: 'All interactive controls (sliders, toggles, tabs) have visible focus indicators',
    howToVerify: 'Tab through all controls; verify a visible focus ring appears on each',
    expectedBehavior: 'Focus ring meets WCAG 2.4.11 (AA) — visible with sufficient contrast',
    status: 'partial',
  },

  // ─────────────────────────────────────────────────
  // 6. Performance
  // ─────────────────────────────────────────────────
  {
    id: 'PF-01',
    category: 'Performance',
    description: 'Tier-1 data (stations.geojson, metro_lines.json) loads first so the map renders before analytics data arrives',
    howToVerify: 'Open DevTools → Network tab; confirm stations and lines responses complete before ridership/OD fetches resolve',
    expectedBehavior: 'Map is interactive within ~1s on fast connection; partialLoad is true while tier-2 loads',
    status: 'implemented',
  },
  {
    id: 'PF-02',
    category: 'Performance',
    description: 'Tier-2 data (ridership, OD flows, population grid) loads in the background without blocking map interaction',
    howToVerify: 'Throttle network to Slow 3G in DevTools; confirm map is pannable/zoomable while analytics data is still loading',
    expectedBehavior: 'No UI freeze during tier-2 fetch; analytics layers activate once data arrives',
    status: 'implemented',
  },
  {
    id: 'PF-03',
    category: 'Performance',
    description: 'Coverage population calculation (coveragePct) is memoized and does not re-run on every render',
    howToVerify: 'Add a console.log inside the useMemo callback; verify it only logs when catchmentRadius or stations change',
    expectedBehavior: 'coveragePct recalculates only when its dependencies change, not on every re-render',
    status: 'implemented',
  },

  // ─────────────────────────────────────────────────
  // 7. Accessibility
  // ─────────────────────────────────────────────────
  {
    id: 'AC-01',
    category: 'Accessibility',
    description: 'Root app div has role="application" and aria-label="Chennai Metro Intelligence Map"',
    howToVerify: 'Inspect the outermost <div> in DevTools → Accessibility panel',
    expectedBehavior: 'Screen readers announce the app name; role signals an interactive widget',
    status: 'implemented',
  },
  {
    id: 'AC-02',
    category: 'Accessibility',
    description: 'Loading overlay has role="status", aria-live="polite", and aria-label="Loading metro data"',
    howToVerify: 'Throttle network; use a screen reader and reload — confirm the loading announcement is spoken',
    expectedBehavior: 'Screen reader announces "Loading metro data" when the overlay appears',
    status: 'implemented',
  },
  {
    id: 'AC-03',
    category: 'Accessibility',
    description: 'Skip-navigation link is present and routes keyboard users to #map-canvas',
    howToVerify: 'Press Tab on page load; first focusable element should be "Skip to map"; press Enter and confirm focus moves to the map container',
    expectedBehavior: 'Skip link is visually hidden until focused; jumps focus to #map-canvas on activation',
    status: 'implemented',
  },
  {
    id: 'AC-04',
    category: 'Accessibility',
    description: 'Error state uses role="alert" so screen readers immediately announce the failure',
    howToVerify: 'Simulate a fetch error (block data files in DevTools); verify screen reader announces the error message',
    expectedBehavior: 'Error message is announced without requiring user interaction; not just visually displayed',
    status: 'implemented',
  },
]
