import { useContext, useState } from 'react'
import { UserContext } from '../App'
import { SensorContext } from '../App'
import { CheckCircle } from '../components/Icons'

const templates = [
  { label: 'Average Household', icon: '🏠', value: 80 },
  { label: 'Eco Warrior', icon: '🌿', value: 20 },
  { label: 'Short Showers', icon: '🚿', value: 15 },
  { label: 'Family of 4', icon: '👨‍👩‍👧‍👦', value: 120 },
  { label: 'Apartment', icon: '🏢', value: 40 },
  { label: 'Minimalist', icon: '✨', value: 10 },
]

export default function GoalsPage() {
  const { user, setUser } = useContext(UserContext)
  const sensor = useContext(SensorContext)
  const [inputVal, setInputVal] = useState(String(user.dailyGoal))
  const [saved, setSaved] = useState(false)

  const used = sensor.todayGallons
  const pct = Math.min(100, (used / user.dailyGoal) * 100)
  const status = pct >= 100 ? 'exceeded' : pct >= 80 ? 'warning' : 'good'

  const saveGoal = (val) => {
    const n = parseFloat(val)
    if (!isNaN(n) && n > 0) {
      setUser(u => ({ ...u, dailyGoal: n }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Set Your Goal</h2>
      <p style={styles.subtitle}>Track your daily water waste limit</p>

      {/* Goal input */}
      <div style={styles.inputCard}>
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            type="number"
            value={inputVal}
            onChange={e => { setInputVal(e.target.value); setSaved(false) }}
            min="1"
          />
          <span style={styles.unitLabel}>gallons / day</span>
        </div>
        <div style={styles.divider} />
        <p style={styles.templateLabel}>Water Goal Templates</p>
        <p style={styles.templateSub}>We prepared common goals for you!</p>
        <div style={styles.templateGrid}>
          {templates.map(t => (
            <button
              key={t.label}
              style={{
                ...styles.templateBtn,
                border: parseFloat(inputVal) === t.value ? '2px solid #4ab8e8' : '2px solid transparent',
                background: parseFloat(inputVal) === t.value ? '#e8f7fd' : '#f5fbff',
              }}
              onClick={() => { setInputVal(String(t.value)); setSaved(false) }}
            >
              <span style={styles.templateIcon}>{t.icon}</span>
              <span style={styles.templateName}>{t.label}</span>
              <span style={styles.templateVal}>{t.value} gal</span>
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      <button
        style={{ ...styles.saveBtn, background: saved ? '#4cd964' : 'linear-gradient(135deg,#4ab8e8,#29b6f6)' }}
        onClick={() => saveGoal(inputVal)}
      >
        {saved ? '✓ Saved!' : 'Save Goal'}
      </button>

      {/* Today's progress */}
      <div style={styles.progressCard}>
        <div style={styles.progressHeader}>
          <p style={styles.progressTitle}>Today's Progress</p>
          <CheckCircle size={20} color={status === 'good' ? '#4cd964' : status === 'warning' ? '#ffb300' : '#e05252'} />
        </div>
        <div style={styles.bigBar}>
          <div style={{
            ...styles.bigFill,
            width: `${pct}%`,
            background: status === 'good' ? 'linear-gradient(90deg,#4ab8e8,#29b6f6)'
              : status === 'warning' ? 'linear-gradient(90deg,#ffb300,#ff8f00)'
              : 'linear-gradient(90deg,#e05252,#ef5350)',
          }} />
        </div>
        <div style={styles.progressStats}>
          <p style={styles.statText}>{used.toFixed(2)} gal used</p>
          <p style={styles.statText}>{user.dailyGoal} gal goal</p>
        </div>
        <p style={{
          ...styles.statusMsg,
          color: status === 'good' ? '#4ab8e8' : status === 'warning' ? '#e08800' : '#e05252'
        }}>
          {status === 'exceeded'
            ? `⚠ You've exceeded your goal by ${(used - user.dailyGoal).toFixed(2)} gal`
            : status === 'warning'
            ? `You're at ${pct.toFixed(0)}% of your goal — be mindful!`
            : `Great! You're at ${pct.toFixed(0)}% of your daily limit.`}
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '16px 20px 24px' },
  title: { fontSize: 22, fontWeight: 700, color: '#1a3a4a', marginBottom: 2 },
  subtitle: { fontSize: 13, color: '#88aab8', marginBottom: 20 },
  inputCard: { background: '#fff', borderRadius: 20, padding: '20px 18px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  inputRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18 },
  input: {
    width: 90, fontSize: 36, fontWeight: 700, color: '#1a3a4a',
    textAlign: 'center', border: 'none', outline: 'none',
    borderBottom: '2px solid #4ab8e8', fontFamily: 'Poppins, sans-serif',
    background: 'none',
  },
  unitLabel: { fontSize: 14, color: '#88aab8', fontWeight: 500 },
  divider: { height: 1, background: '#edf5f8', margin: '4px 0 16px' },
  templateLabel: { fontSize: 15, fontWeight: 600, color: '#1a3a4a', marginBottom: 3 },
  templateSub: { fontSize: 12, color: '#88aab8', marginBottom: 14 },
  templateGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  templateBtn: {
    borderRadius: 14, padding: '12px 10px',
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
    cursor: 'pointer', transition: 'all 0.15s',
    fontFamily: 'Poppins, sans-serif',
  },
  templateIcon: { fontSize: 22, marginBottom: 4 },
  templateName: { fontSize: 11, color: '#88aab8', fontWeight: 500 },
  templateVal: { fontSize: 16, fontWeight: 700, color: '#1a3a4a' },
  saveBtn: {
    width: '100%', padding: '15px', borderRadius: 30,
    border: 'none', color: '#fff', fontSize: 16, fontWeight: 600,
    cursor: 'pointer', marginBottom: 16, fontFamily: 'Poppins, sans-serif',
    boxShadow: '0 4px 16px rgba(74,184,232,0.4)', transition: 'background 0.3s',
  },
  progressCard: { background: '#fff', borderRadius: 20, padding: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  progressTitle: { fontSize: 15, fontWeight: 600, color: '#1a3a4a' },
  bigBar: { height: 14, background: '#edf5f8', borderRadius: 7, overflow: 'hidden', marginBottom: 8 },
  bigFill: { height: '100%', borderRadius: 7, transition: 'width 0.5s, background 0.5s' },
  progressStats: { display: 'flex', justifyContent: 'space-between' },
  statText: { fontSize: 12, color: '#88aab8' },
  statusMsg: { fontSize: 13, fontWeight: 500, marginTop: 12, textAlign: 'center' },
}
