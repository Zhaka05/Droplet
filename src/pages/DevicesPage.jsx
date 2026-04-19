import { useContext } from 'react'
import { SensorContext } from '../App'
import { Wifi } from '../components/Icons'

const FLOW_RATES = { low: 0.5, medium: 1.5, high: 2.2 }

function ProbeButton({ active, onClick, label }) {
  return (
    <button
      style={{
        ...styles.probeBtn,
        background: active ? '#4ab8e8' : '#e8f4f8',
        color: active ? '#fff' : '#88aab8',
        boxShadow: active ? '0 4px 16px rgba(74,184,232,0.5)' : 'none',
        transform: active ? 'scale(1.05)' : 'scale(1)',
      }}
      onClick={onClick}
    >
      <span style={styles.probeCircle}>{label}</span>
    </button>
  )
}

function TriangleVisual({ activeProbes }) {
  const positions = [
    { x: 80, y: 20, label: '1' },
    { x: 140, y: 120, label: '2' },
    { x: 20, y: 120, label: '3' },
  ]
  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      {/* Cylinder outline */}
      <ellipse cx={80} cy={140} rx={60} ry={14} fill="#ddf0f8" stroke="#b8dff0" strokeWidth={2} />
      <ellipse cx={80} cy={30} rx={60} ry={14} fill="#eaf6fb" stroke="#b8dff0" strokeWidth={2} />
      <line x1={20} y1={30} x2={20} y2={140} stroke="#b8dff0" strokeWidth={2} />
      <line x1={140} y1={30} x2={140} y2={140} stroke="#b8dff0" strokeWidth={2} />

      {/* Triangle lines between probes */}
      {activeProbes >= 2 && (
        <line x1={positions[0].x} y1={positions[0].y + 80} x2={positions[1].x} y2={positions[1].y} stroke="#4ab8e8" strokeWidth={2} strokeDasharray="4 3" />
      )}
      {activeProbes >= 3 && (
        <>
          <line x1={positions[1].x} y1={positions[1].y} x2={positions[2].x} y2={positions[2].y} stroke="#4ab8e8" strokeWidth={2} strokeDasharray="4 3" />
          <line x1={positions[2].x} y1={positions[2].y} x2={positions[0].x} y2={positions[0].y + 80} stroke="#4ab8e8" strokeWidth={2} strokeDasharray="4 3" />
        </>
      )}

      {/* Probe dots */}
      {positions.map((p, i) => {
        const adj = i === 0 ? { x: p.x, y: p.y + 80 } : p
        const isActive = activeProbes > i
        return (
          <g key={i}>
            <circle cx={adj.x} cy={adj.y} r={14}
              fill={isActive ? '#4ab8e8' : '#ddf0f8'}
              stroke={isActive ? '#29b6f6' : '#b8dff0'}
              strokeWidth={2}
            />
            <text x={adj.x} y={adj.y + 5} textAnchor="middle" fontSize={12} fontWeight="bold"
              fill={isActive ? '#fff' : '#88aab8'} fontFamily="Poppins, sans-serif">
              {p.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function DevicesPage() {
  const sensor = useContext(SensorContext)

  const probeRows = [
    { count: 0, label: 'Off', sub: 'No water detected', color: '#99b8c4' },
    { count: 1, label: 'Low Flow', sub: `${FLOW_RATES.low} gal/min — 1 probe active`, color: '#81d4f7' },
    { count: 2, label: 'Medium Flow', sub: `${FLOW_RATES.medium} gal/min — 2 probes active`, color: '#29b6f6' },
    { count: 3, label: 'High Flow', sub: `${FLOW_RATES.high} gal/min — 3 probes active`, color: '#0288d1' },
  ]

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.title}>Devices</h2>
          <p style={styles.subtitle}>Manage your drain sensors</p>
        </div>
        <button style={styles.addBtn}>+ Add Device</button>
      </div>

      {/* Device card */}
      <div style={styles.deviceCard}>
        <div style={styles.deviceHeader}>
          <div>
            <p style={styles.deviceName}>Droplet Sensor #1</p>
            <p style={styles.deviceSub}>Kitchen Drain · Arduino Uno</p>
          </div>
          <div style={{
            ...styles.statusPill,
            background: sensor.wsConnected ? '#edfff2' : '#fff4e5',
          }}>
            <div style={{ ...styles.statusDot, background: sensor.wsConnected ? '#4cd964' : '#ff9800' }} />
            <span style={{ ...styles.statusText, color: sensor.wsConnected ? '#2da84f' : '#e08800' }}>
              {sensor.wsConnected ? 'Live' : 'Connecting…'}
            </span>
          </div>
        </div>
        <div style={styles.deviceStats}>
          <div style={styles.stat}>
            <Wifi size={16} color="#4ab8e8" />
            <span style={styles.statVal}>USB Serial</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Probes:</span>
            <span style={styles.statVal}>3 (triangle)</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Buzzer pin:</span>
            <span style={styles.statVal}>D8</span>
          </div>
        </div>
      </div>

      {/* Triangle visual */}
      <div style={styles.vizCard}>
        <p style={styles.vizTitle}>Probe Configuration</p>
        <p style={styles.vizSub}>3 probes arranged in triangle formation</p>
        <div style={styles.vizCenter}>
          <TriangleVisual activeProbes={sensor.activeProbes} />
        </div>
        <p style={styles.vizActive}>
          {sensor.activeProbes === 0 ? 'No probes active' : `${sensor.activeProbes} probe${sensor.activeProbes > 1 ? 's' : ''} detecting water`}
        </p>
      </div>

      {/* Simulate sensor */}
      <div style={{ ...styles.simCard, opacity: sensor.wsConnected ? 0.5 : 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
          <p style={styles.simTitle}>Simulate Sensor Input</p>
          {sensor.wsConnected && <span style={styles.lockedBadge}>🔒 Live sensor active</span>}
        </div>
        <p style={styles.simSub}>
          {sensor.wsConnected ? 'Disabled — real sensor is connected' : 'Tap to simulate probe activation levels'}
        </p>
        <div style={styles.simBtns}>
          {probeRows.map(r => (
            <button
              key={r.count}
              disabled={sensor.wsConnected}
              style={{
                ...styles.simBtn,
                background: sensor.activeProbes === r.count ? '#4ab8e8' : '#f0f9ff',
                color: sensor.activeProbes === r.count ? '#fff' : '#1a3a4a',
                border: `2px solid ${sensor.activeProbes === r.count ? '#4ab8e8' : '#d8eef6'}`,
                cursor: sensor.wsConnected ? 'not-allowed' : 'pointer',
              }}
              onClick={() => sensor.setProbes(r.count)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={styles.simBtnLabel}>{r.label}</span>
                {sensor.activeProbes === r.count && <span style={styles.activePill}>Active</span>}
              </div>
              <p style={{ fontSize: 11, opacity: 0.7, marginTop: 3 }}>{r.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Flow rate reference */}
      <div style={styles.refCard}>
        <p style={styles.refTitle}>Flow Rate Reference</p>
        {probeRows.slice(1).map(r => (
          <div key={r.count} style={styles.refRow}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {[...Array(r.count)].map((_, i) => (
                <div key={i} style={{ ...styles.miniDot, background: r.color }} />
              ))}
            </div>
            <span style={styles.refLabel}>{r.label}</span>
            <span style={{ ...styles.refRate, color: r.color }}>{FLOW_RATES[['low', 'medium', 'high'][r.count - 1]]} gal/min</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '16px 20px 24px' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700, color: '#1a3a4a', marginBottom: 2 },
  subtitle: { fontSize: 13, color: '#88aab8' },
  addBtn: {
    background: 'linear-gradient(135deg,#4ab8e8,#29b6f6)',
    color: '#fff', border: 'none', borderRadius: 20,
    padding: '8px 16px', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
    boxShadow: '0 4px 12px rgba(74,184,232,0.4)',
    whiteSpace: 'nowrap',
  },
  deviceCard: { background: '#fff', borderRadius: 20, padding: '18px', marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  deviceHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  deviceName: { fontSize: 16, fontWeight: 600, color: '#1a3a4a' },
  deviceSub: { fontSize: 12, color: '#88aab8' },
  statusPill: { display: 'flex', alignItems: 'center', gap: 6, background: '#edfff2', borderRadius: 20, padding: '4px 12px' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: 600, color: '#2da84f' },
  deviceStats: { display: 'flex', gap: 16 },
  stat: { display: 'flex', alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 11, color: '#99b8c4' },
  statVal: { fontSize: 12, fontWeight: 500, color: '#4a7a8a' },
  vizCard: { background: '#fff', borderRadius: 20, padding: '18px', marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  vizTitle: { fontSize: 15, fontWeight: 600, color: '#1a3a4a', marginBottom: 3 },
  vizSub: { fontSize: 12, color: '#88aab8', marginBottom: 14 },
  vizCenter: { display: 'flex', justifyContent: 'center', marginBottom: 10 },
  vizActive: { textAlign: 'center', fontSize: 13, fontWeight: 500, color: '#4ab8e8' },
  simCard: { background: '#fff', borderRadius: 20, padding: '18px', marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  simTitle: { fontSize: 15, fontWeight: 600, color: '#1a3a4a' },
  lockedBadge: { fontSize: 10, background: '#fff4e5', color: '#e08800', borderRadius: 10, padding: '3px 8px', fontWeight: 600 },
  simSub: { fontSize: 12, color: '#88aab8', marginBottom: 14 },
  simBtns: { display: 'flex', flexDirection: 'column', gap: 8 },
  simBtn: {
    borderRadius: 14, padding: '12px 16px', cursor: 'pointer',
    textAlign: 'left', fontFamily: 'Poppins, sans-serif', transition: 'all 0.15s',
  },
  simBtnLabel: { fontSize: 14, fontWeight: 600 },
  activePill: { fontSize: 10, background: 'rgba(255,255,255,0.3)', borderRadius: 10, padding: '2px 8px', fontWeight: 600 },
  probeBtn: { borderRadius: 12, padding: '10px 14px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Poppins, sans-serif' },
  probeCircle: { fontSize: 13, fontWeight: 700 },
  refCard: { background: '#fff', borderRadius: 20, padding: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  refTitle: { fontSize: 15, fontWeight: 600, color: '#1a3a4a', marginBottom: 14 },
  refRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  miniDot: { width: 10, height: 10, borderRadius: 5 },
  refLabel: { flex: 1, fontSize: 13, color: '#4a6a7a', fontWeight: 500 },
  refRate: { fontSize: 13, fontWeight: 700 },
}
