import { useState, useEffect, useRef, useCallback } from 'react'

// Flow rates from circuit diagram (GPM)
export const FLOW_RATES = { low: 0.5, medium: 1.5, high: 2.2 }
export const BUZZER_THRESHOLD = 60

const WS_URL = 'ws://localhost:8000/ws'

function capitalize(s) {
  if (!s || s === 'none') return 'Off'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function useSensorStore() {
  // Live sensor state (driven by WebSocket when connected)
  const [wsConnected, setWsConnected] = useState(false)
  const [activeProbes, setActiveProbes] = useState(0)
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const [sessionGallons, setSessionGallons] = useState(0)
  const [todayGallons, setTodayGallons] = useState(0)
  const [buzzerActive, setBuzzerActive] = useState(false)
  const [flowLabel, setFlowLabel] = useState('Off')
  const [flowRate, setFlowRate] = useState(0)
  const [sessions, setSessions] = useState([])

  // Local simulation state (used only when WS not connected)
  const localIntervalRef = useRef(null)
  const localSecondsRef = useRef(0)
  const localGallonsRef = useRef(0)
  const localFlowRateRef = useRef(0)
  const wsRef = useRef(null)
  const isInitialMsg = useRef(true)

  // ── WebSocket ──────────────────────────────────────────────────────────────
  const handleWsEvent = useCallback((data) => {
    const type = data.event_type
    const initial = isInitialMsg.current
    isInitialMsg.current = false

    if (type === 'FLOW_STARTED') {
      setSessionSeconds(0)
      setSessionGallons(0)
      setBuzzerActive(false)
    }

    if (type === 'FLOW_UPDATE') {
      setActiveProbes(data.probes_active ?? 0)
      setSessionSeconds(data.duration_seconds ?? 0)
      setSessionGallons(+(data.gallons ?? 0))
      setFlowLabel(capitalize(data.flow_level))
      setFlowRate(data.flow_rate_gpm ?? 0)
      if ((data.duration_seconds ?? 0) >= BUZZER_THRESHOLD) setBuzzerActive(true)
    }

    if (type === 'FLOW_STOPPED') {
      const gallons = +(data.gallons ?? 0)
      const seconds = data.duration_seconds ?? 0
      if (seconds > 0 && !initial) {
        setSessions(prev => [{
          id: Date.now(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          gallons,
          seconds,
          flowLabel: capitalize(data.flow_level),
        }, ...prev.slice(0, 19)])
        setTodayGallons(prev => +(prev + gallons).toFixed(4))
      }
      setActiveProbes(0)
      setSessionSeconds(0)
      setSessionGallons(0)
      setFlowLabel('Off')
      setFlowRate(0)
      setBuzzerActive(false)
    }

    if (type === 'IDLE') {
      setActiveProbes(data.probes_active ?? 0)
      setSessionSeconds(data.duration_seconds ?? 0)
      setSessionGallons(+(data.gallons ?? 0))
      setFlowLabel(capitalize(data.flow_level))
      setFlowRate(data.flow_rate_gpm ?? 0)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const connect = () => {
      if (cancelled) return
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => { if (!cancelled) { isInitialMsg.current = true; setWsConnected(true) } }

      ws.onmessage = (e) => {
        try { handleWsEvent(JSON.parse(e.data)) } catch (_) {}
      }

      ws.onclose = () => {
        if (!cancelled) {
          setWsConnected(false)
          setTimeout(connect, 3000)
        }
      }

      ws.onerror = () => ws.close()
    }

    connect()

    // Keep-alive ping every 20s
    const ping = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send('ping')
      }
    }, 20000)

    return () => {
      cancelled = true
      clearInterval(ping)
      wsRef.current?.close()
    }
  }, [handleWsEvent])

  // ── Local simulation (only active when WS is not connected) ───────────────
  const startLocal = useCallback((probes) => {
    if (localIntervalRef.current) clearInterval(localIntervalRef.current)
    localSecondsRef.current = 0
    localGallonsRef.current = 0
    const rate = probes === 1 ? FLOW_RATES.low : probes === 2 ? FLOW_RATES.medium : FLOW_RATES.high
    localFlowRateRef.current = rate
    setSessionSeconds(0)
    setSessionGallons(0)
    setBuzzerActive(false)

    localIntervalRef.current = setInterval(() => {
      localSecondsRef.current += 1
      localGallonsRef.current = +(localGallonsRef.current + rate / 60).toFixed(4)
      setSessionSeconds(localSecondsRef.current)
      setSessionGallons(localGallonsRef.current)
      if (localSecondsRef.current >= BUZZER_THRESHOLD) setBuzzerActive(true)
    }, 1000)
  }, [])

  const stopLocal = useCallback(() => {
    if (!localIntervalRef.current) return
    clearInterval(localIntervalRef.current)
    localIntervalRef.current = null
    const gallons = localGallonsRef.current
    const seconds = localSecondsRef.current
    if (seconds > 0) {
      setSessions(prev => [{
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        gallons, seconds,
        flowLabel: flowLabel,
      }, ...prev.slice(0, 19)])
      setTodayGallons(prev => +(prev + gallons).toFixed(4))
    }
    setSessionSeconds(0)
    setSessionGallons(0)
    setBuzzerActive(false)
  }, [flowLabel])

  const setProbes = useCallback((count) => {
    if (wsConnected) return  // Real sensor has control when connected
    setActiveProbes(count)
    const label = count === 0 ? 'Off' : count === 1 ? 'Low' : count === 2 ? 'Medium' : 'High'
    const rate = count === 0 ? 0 : count === 1 ? FLOW_RATES.low : count === 2 ? FLOW_RATES.medium : FLOW_RATES.high
    setFlowLabel(label)
    setFlowRate(rate)
    if (count > 0) startLocal(count)
    else stopLocal()
  }, [wsConnected, startLocal, stopLocal])

  const dismissBuzzer = useCallback(() => {
    setBuzzerActive(false)
    if (!wsConnected) {
      stopLocal()
      setActiveProbes(0)
      setFlowLabel('Off')
      setFlowRate(0)
    }
  }, [wsConnected, stopLocal])

  return {
    wsConnected,
    activeProbes, setProbes,
    sessionSeconds, sessionGallons,
    todayGallons, buzzerActive,
    flowRate, flowLabel, sessions,
    dismissBuzzer,
    FLOW_RATES, BUZZER_THRESHOLD,
  }
}
