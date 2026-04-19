import { useContext, useState } from 'react'
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

const MODELS = ['Uno', 'Dos', 'Tres']

function AddDeviceModal({ onSave, onClose }) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [model, setModel] = useState('Tres')

  const canSave = name.trim() && location.trim()

  return (
    <div style={modal.overlay} onClick={onClose}>
      <div style={modal.card} onClick={e => e.stopPropagation()}>
        <p style={modal.title}>Add Device</p>
        <label style={modal.label}>Device Name</label>
        <input style={modal.input} placeholder="e.g. Droplet Sensor #2" value={name} onChange={e => setName(e.target.value)} />
        <label style={modal.label}>Location</label>
        <input style={modal.input} placeholder="e.g. Bathroom Drain" value={location} onChange={e => setLocation(e.target.value)} />
        <label style={modal.label}>Model</label>
        <select style={modal.select} value={model} onChange={e => setModel(e.target.value)}>
          {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <button
          style={{ ...modal.saveBtn, opacity: canSave ? 1 : 0.5, cursor: canSave ? 'pointer' : 'not-allowed' }}
          disabled={!canSave}
          onClick={() => onSave({ name: name.trim(), location: location.trim(), model })}
        >
          Add Device
        </button>
        <button style={modal.cancelBtnFull} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

function EditModal({ device, onSave, onDelete, onClose }) {
  const [name, setName] = useState(device.name)
  const [location, setLocation] = useState(device.location)
  const [confirming, setConfirming] = useState(false)

  return (
    <div style={modal.overlay} onClick={onClose}>
      <div style={modal.card} onClick={e => e.stopPropagation()}>
        {confirming ? (
          <>
            <p style={modal.title}>Delete Device?</p>
            <p style={modal.sub}>This will remove <strong>{device.name}</strong> permanently.</p>
            <div style={modal.btnRow}>
              <button style={modal.cancelBtn} onClick={() => setConfirming(false)}>Cancel</button>
              <button style={modal.deleteConfirmBtn} onClick={onDelete}>Yes, Delete</button>
            </div>
          </>
        ) : (
          <>
            <p style={modal.title}>Edit Device</p>
            <label style={modal.label}>Name</label>
            <input style={modal.input} value={name} onChange={e => setName(e.target.value)} />
            <label style={modal.label}>Location</label>
            <input style={modal.input} value={location} onChange={e => setLocation(e.target.value)} />
            <button style={modal.saveBtn} onClick={() => onSave(name, location)}>Save Changes</button>
            <button style={modal.deleteBtn} onClick={() => setConfirming(true)}>Delete Device</button>
          </>
        )}
      </div>
    </div>
  )
}

export default function DevicesPage() {
  const sensor = useContext(SensorContext)
  const [addingDevice, setAddingDevice] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [devices, setDevices] = useState([
    { id: 1, name: 'Droplet Sensor #1', location: 'Kitchen Drain', model: 'Tres', buzzerOn: true },
  ])

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
        <button style={styles.addBtn} onClick={() => setAddingDevice(true)}>+ Add Device</button>
      </div>

      {/* Device cards */}
      {devices.map((device, idx) => (
        <div key={device.id} style={styles.deviceCard}>
          <div style={styles.deviceHeader}>
            <div>
              <p style={styles.deviceName}>{device.name}</p>
              <p style={styles.deviceSub}>{device.location}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                ...styles.statusPill,
                background: idx === 0 && sensor.wsConnected ? '#edfff2' : '#fff4e5',
              }}>
                <div style={{ ...styles.statusDot, background: idx === 0 && sensor.wsConnected ? '#4cd964' : '#ff9800' }} />
                <span style={{ ...styles.statusText, color: idx === 0 && sensor.wsConnected ? '#2da84f' : '#e08800' }}>
                  {idx === 0 && sensor.wsConnected ? 'Live' : 'Connecting…'}
                </span>
              </div>
              <button style={styles.editIconBtn} onClick={() => setEditingId(device.id)}>✏️</button>
            </div>
          </div>
          <div style={styles.deviceStats}>
            <div style={styles.stat}>
              <Wifi size={16} color="#4ab8e8" />
              <span style={styles.statVal}>WiFi</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statLabel}>Model:</span>
              <span style={styles.statVal}>{device.model}</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statLabel}>Buzzer:</span>
              <div
                style={{ ...styles.toggleTrack, background: device.buzzerOn ? '#4ab8e8' : '#dde8ee' }}
                onClick={() => setDevices(ds => ds.map(d => d.id === device.id ? { ...d, buzzerOn: !d.buzzerOn } : d))}
              >
                <div style={{ ...styles.toggleKnob, transform: device.buzzerOn ? 'translateX(18px)' : 'translateX(2px)' }} />
              </div>
            </div>
          </div>
        </div>
      ))}

      {editingId !== null && (
        <EditModal
          device={devices.find(d => d.id === editingId)}
          onSave={(name, location) => {
            setDevices(ds => ds.map(d => d.id === editingId ? { ...d, name, location } : d))
            setEditingId(null)
          }}
          onDelete={() => {
            setDevices(ds => ds.filter(d => d.id !== editingId))
            setEditingId(null)
          }}
          onClose={() => setEditingId(null)}
        />
      )}
      {addingDevice && (
        <AddDeviceModal
          onSave={(d) => {
            setDevices(ds => [...ds, { ...d, id: Date.now(), buzzerOn: true }])
            setAddingDevice(false)
          }}
          onClose={() => setAddingDevice(false)}
        />
      )}

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
      <div style={styles.simCard}>
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
  editIconBtn: {
    background: '#f0f9ff', border: 'none', borderRadius: 10,
    padding: '5px 8px', cursor: 'pointer', fontSize: 14,
  },
  deviceStats: { display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between' },
  stat: { display: 'flex', alignItems: 'center', gap: 4, lineHeight: 1 },
  statLabel: { fontSize: 11, color: '#99b8c4', lineHeight: 1 },
  statVal: { fontSize: 12, fontWeight: 500, color: '#4a7a8a', lineHeight: 1 },
  toggleTrack: {
    width: 38, height: 22, borderRadius: 11, cursor: 'pointer',
    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
  },
  toggleKnob: {
    position: 'absolute', top: 3, width: 16, height: 16,
    borderRadius: 8, background: '#fff', transition: 'transform 0.2s',
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
  },
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

const modal = {
  overlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.45)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 100, backdropFilter: 'blur(4px)',
  },
  card: {
    background: '#fff', borderRadius: 24,
    padding: '28px 24px', width: 300,
    display: 'flex', flexDirection: 'column', gap: 10,
    boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
  },
  title: { fontSize: 18, fontWeight: 700, color: '#1a3a4a', marginBottom: 4 },
  sub: { fontSize: 13, color: '#88aab8', lineHeight: 1.5 },
  label: { fontSize: 12, color: '#99b8c4', fontWeight: 500 },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: 12,
    border: '1.5px solid #d8eef6', fontSize: 14, color: '#1a3a4a',
    fontFamily: 'Poppins, sans-serif', outline: 'none',
    marginBottom: 4,
  },
  saveBtn: {
    background: 'linear-gradient(135deg,#4ab8e8,#29b6f6)',
    color: '#fff', border: 'none', borderRadius: 20,
    padding: '12px', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
    marginTop: 4,
  },
  deleteBtn: {
    background: '#fff0f0', color: '#e05252', border: '1.5px solid #ffd0d0',
    borderRadius: 20, padding: '12px', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
  },
  btnRow: { display: 'flex', gap: 10, marginTop: 8 },
  select: {
    width: '100%', padding: '10px 14px', borderRadius: 12,
    border: '1.5px solid #d8eef6', fontSize: 14, color: '#1a3a4a',
    fontFamily: 'Poppins, sans-serif', outline: 'none',
    background: '#fff', marginBottom: 4, cursor: 'pointer',
  },
  cancelBtn: {
    flex: 1, background: '#f0f9ff', color: '#4a7a8a', border: 'none',
    borderRadius: 20, padding: '12px', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
  },
  cancelBtnFull: {
    width: '100%', background: '#f0f9ff', color: '#4a7a8a', border: 'none',
    borderRadius: 20, padding: '12px', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
  },
  deleteConfirmBtn: {
    flex: 1, background: 'linear-gradient(135deg,#e05252,#ef5350)',
    color: '#fff', border: 'none', borderRadius: 20,
    padding: '12px', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
  },
}
