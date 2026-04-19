import { useContext } from 'react'
import { SensorContext, UserContext } from '../App'
import WaterFill from '../components/WaterFill'
import { Droplet } from '../components/Icons'

function fmt(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const FLOW_COLORS = { Off: '#b0cdd6', Low: '#81d4f7', Medium: '#29b6f6', High: '#0288d1' }

export default function HomePage() {
  const { user } = useContext(UserContext)
  const sensor = useContext(SensorContext)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const progressPct = Math.min(100, (sensor.todayGallons / user.dailyGoal) * 100)

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <p style={styles.greet}>{greeting},</p>
          <h1 style={styles.name}>{user.name}</h1>
        </div>
        <div style={styles.dropIcon}>
          <Droplet size={32} color="#4ab8e8" />
          {sensor.activeProbes > 0 && <span style={styles.activeDot} />}
        </div>
      </div>

      {/* Total household waste card */}
      <div style={styles.sessionCard}>
        <p style={styles.sessionSub}>Total Household Waste Today</p>
        <p style={styles.gallonsBig}>{sensor.todayGallons.toFixed(3)} <span style={styles.unit}>gal</span></p>
      </div>

      {/* Today summary */}
      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <p style={styles.summaryVal}>{sensor.todayGallons.toFixed(2)}</p>
          <p style={styles.summarySub}>Gallons today</p>
        </div>
        <div style={styles.summaryCard}>
          <p style={styles.summaryVal}>{sensor.sessions.length}</p>
          <p style={styles.summarySub}>Sessions today</p>
        </div>
        <div style={styles.summaryCard}>
          <p style={{ ...styles.summaryVal, color: FLOW_COLORS[sensor.flowLabel] }}>{sensor.flowLabel}</p>
          <p style={styles.summarySub}>Flow rate</p>
        </div>
      </div>

      {/* Goal progress */}
      <div style={styles.goalCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <WaterFill percent={progressPct} size={120} />
          <div>
            <p style={styles.goalTitle}>Daily Goal</p>
            <p style={styles.goalSub}>Used {sensor.todayGallons.toFixed(2)} of {user.dailyGoal} gal</p>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
            </div>
            <p style={{ ...styles.goalSub, marginTop: 6 }}>
              {progressPct >= 100
                ? '⚠ Goal exceeded!'
                : `${(user.dailyGoal - sensor.todayGallons).toFixed(2)} gal remaining`}
            </p>
          </div>
        </div>
      </div>

      {/* Recent sessions */}
      {sensor.sessions.length > 0 && (
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Recent Sessions</p>
          {sensor.sessions.slice(0, 4).map(s => (
            <div key={s.id} style={styles.sessionRow}>
              <div style={{ ...styles.flowBadge, background: FLOW_COLORS[s.flowLabel] + '22', color: FLOW_COLORS[s.flowLabel] }}>
                {s.flowLabel}
              </div>
              <div style={{ flex: 1 }}>
                <p style={styles.rowTime}>{s.time}</p>
                <p style={styles.rowSub}>{fmt(s.seconds)} duration</p>
              </div>
              <p style={styles.rowGallons}>{s.gallons.toFixed(3)} gal</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { padding: '16px 20px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greet: { fontSize: 13, color: '#7aabb8', fontWeight: 400 },
  name: { fontSize: 22, fontWeight: 700, color: '#1a3a4a' },
  dropIcon: { position: 'relative' },
  activeDot: {
    position: 'absolute', top: -2, right: -2,
    width: 10, height: 10, borderRadius: 5,
    background: '#4cd964', border: '2px solid #eaf6fb',
  },
  sessionCard: {
    borderRadius: 20,
    padding: '20px 22px',
    marginBottom: 16,
    color: '#fff',
    background: 'linear-gradient(135deg,#6ecef5,#9eddf7)',
    boxShadow: '0 8px 24px rgba(74,184,232,0.35)',
  },
  sessionTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  sessionTime: { fontSize: 32, fontWeight: 700, letterSpacing: 2, lineHeight: 1 },
  sessionSub: { fontSize: 12, opacity: 0.8, marginTop: 3 },
  probeIndicator: { textAlign: 'center' },
  probeDot: { width: 12, height: 12, borderRadius: 6, display: 'inline-block', margin: '0 3px', marginBottom: 4 },
  flowLabel: { fontSize: 12, fontWeight: 600, opacity: 0.9 },
  sessionBottom: {},
  gallonsBig: { fontSize: 28, fontWeight: 700 },
  unit: { fontSize: 16, fontWeight: 400, opacity: 0.85 },
  warnBanner: {
    marginTop: 12, background: 'rgba(255,200,0,0.25)',
    borderRadius: 10, padding: '6px 12px',
    fontSize: 12, fontWeight: 600, color: '#fff5c0',
  },
  summaryRow: { display: 'flex', gap: 10, marginBottom: 16 },
  summaryCard: {
    flex: 1, background: '#fff', borderRadius: 16,
    padding: '14px 10px', textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  summaryVal: { fontSize: 18, fontWeight: 700, color: '#1a3a4a' },
  summarySub: { fontSize: 10, color: '#99b8c4', marginTop: 2 },
  goalCard: {
    background: '#fff', borderRadius: 20,
    padding: '18px 20px', marginBottom: 16,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  goalTitle: { fontSize: 15, fontWeight: 600, color: '#1a3a4a', marginBottom: 4 },
  goalSub: { fontSize: 12, color: '#88aab8' },
  progressBar: { height: 6, background: '#e8f4f8', borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg,#4ab8e8,#29b6f6)', borderRadius: 3, transition: 'width 0.5s' },
  section: { background: '#fff', borderRadius: 20, padding: '16px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a4a', marginBottom: 12 },
  sessionRow: { display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid #f0f7fa' },
  flowBadge: { borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600 },
  rowTime: { fontSize: 13, fontWeight: 600, color: '#1a3a4a' },
  rowSub: { fontSize: 11, color: '#99b8c4' },
  rowGallons: { fontSize: 14, fontWeight: 700, color: '#4ab8e8' },
}
