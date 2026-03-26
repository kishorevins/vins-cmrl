import { useState, useEffect, useRef, useCallback } from 'react'

export function useTimeSlider(initialHour = 8) {
  const [hour, setHour] = useState(initialHour)
  const [playing, setPlaying] = useState(false)
  const intervalRef = useRef(null)

  const tick = useCallback(() => {
    setHour(h => (h + 1) % 24)
  }, [])

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(tick, 300)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing, tick])

  const togglePlay = useCallback(() => setPlaying(p => !p), [])

  const setHourManual = useCallback((h) => {
    setPlaying(false)
    setHour(Number(h))
  }, [])

  return { hour, playing, togglePlay, setHourManual }
}
