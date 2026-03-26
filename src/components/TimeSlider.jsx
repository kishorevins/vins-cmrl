import { formatHour, timePhase } from '../utils/dataTransforms'
import { useIsMobile } from '../hooks/useIsMobile'

const IOS_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif"

export default function TimeSlider({ hour, playing, togglePlay, setHourManual, activeLayer }) {
  const isMobile = useIsMobile()
  const hourlyLayers = ['volume', 'entryExit']
  if (!hourlyLayers.includes(activeLayer)) return null

  const phase = timePhase(hour)

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center gap-6"
      style={{
        bottom: isMobile ? 'calc(72px + env(safe-area-inset-bottom, 0px))' : 32,
        width: isMobile ? 'calc(100vw - 32px)' : 'auto',
        minHeight: isMobile ? 48 : undefined,
        padding: isMobile ? '10px 16px' : '16px 28px',
        borderRadius: 32,
        backdropFilter: 'blur(28px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
        background: 'var(--panel-bg)',
        boxShadow: 'var(--panel-shadow)',
        fontFamily: IOS_FONT,
      }}
    >
      {/* Play / Pause — always visible, 44px touch target */}
      <button
        onClick={togglePlay}
        className="transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
        style={{ width: 44, height: 44, color: playing ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        title={playing ? 'Pause' : 'Play'}
      >
        {playing ? (
          <svg viewBox="0 0 24 24" fill="currentColor" width={30} height={30}>
            <rect x="6" y="4" width="4" height="16" rx="1.5" />
            <rect x="14" y="4" width="4" height="16" rx="1.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" width={30} height={30}>
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      {/* Label — hidden on mobile to save space */}
      {!isMobile && (
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-label)', flexShrink: 0 }}>
          time
        </span>
      )}

      {/* Hour value + time phase label stacked */}
      <div className="flex flex-col items-end flex-shrink-0" style={{ width: 90 }}>
        <span
          className="tabular-nums select-none"
          style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, letterSpacing: '-0.03em', color: 'rgba(251,146,60,0.95)', lineHeight: 1 }}
        >
          {formatHour(hour)}
        </span>
        {/* Phase label — muted, not competing with the time */}
        <span
          style={{
            fontSize: isMobile ? 9 : 10,
            color: 'var(--text-muted)',
            letterSpacing: '0.01em',
            lineHeight: 1.2,
            marginTop: 2,
            textAlign: 'right',
            // Truncate on very narrow displays
            maxWidth: 90,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {phase.label}
        </span>
      </div>

      {/* Slider — flex:1 on mobile so it fills available space */}
      <input
        type="range"
        min={0}
        max={23}
        value={hour}
        onChange={e => setHourManual(e.target.value)}
        className="accent-orange-400 cursor-pointer"
        style={{ flex: 1, minWidth: 0, height: 44, width: isMobile ? undefined : 300 }}
      />

      {/* Min / Max labels — hidden on mobile to give slider more room */}
      {!isMobile && (
        <div className="flex gap-3 flex-shrink-0">
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>12am</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>11pm</span>
        </div>
      )}
    </div>
  )
}
