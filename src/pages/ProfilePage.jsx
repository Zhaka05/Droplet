import { useContext, useState } from 'react'
import { UserContext } from '../App'
import { SensorContext } from '../App'

const AVATARS = ['🧑', '👩', '👨', '🧒', '👴', '👵']

export default function ProfilePage() {
  const { user, setUser } = useContext(UserContext)
  const sensor = useContext(SensorContext)
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(user.name)
  const [avatar, setAvatar] = useState(0)

  const totalSessions = sensor.sessions.length
  const totalGallons = sensor.sessions.reduce((a, s) => a + s.gallons, 0)
  const avgPerSession = totalSessions ? totalGallons / totalSessions : 0
  const longestSession = sensor.sessions.reduce((m, s) => Math.max(m, s.seconds), 0)

  const save = () => {
    if (nameInput.trim()) setUser(u => ({ ...u, name: nameInput.trim() }))
    setEditing(false)
  }

  return (
    <div style={styles.page}>
      {/* Profile header */}
      <div style={styles.profileCard}>
        <div style={styles.avatarWrap}>
          <div style={styles.avatar}>{AVATARS[avatar]}</div>
          <div style={styles.avatarRow}>
            {AVATARS.map((a, i) => (
              <button key={i} style={{ ...styles.avatarBtn, background: i === avatar ? '#4ab8e8' : '#e8f4f8' }}
                onClick={() => setAvatar(i)}>
                {a}
              </button>
            ))}
          </div>
        </div>
        {editing ? (
          <div style={styles.editRow}>
            <input
              style={styles.nameInput}
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              autoFocus
            />
            <button style={styles.saveSmall} onClick={save}>Save</button>
          </div>
        ) : (
          <div style={styles.nameRow}>
            <h2 style={styles.name}>{user.name}</h2>
            <button style={styles.editBtn} onClick={() => setEditing(true)}>Edit</button>
          </div>
        )}
        <p style={styles.goal}>Daily limit: {user.dailyGoal} gal/day</p>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Total Sessions', val: totalSessions, unit: '' },
          { label: 'Total Wasted', val: totalGallons.toFixed(2), unit: 'gal' },
          { label: 'Avg / Session', val: avgPerSession.toFixed(3), unit: 'gal' },
          { label: 'Longest Session', val: longestSession, unit: 's' },
        ].map(s => (
          <div key={s.label} style={styles.statCard}>
            <p style={styles.statVal}>{s.val}<span style={styles.statUnit}>{s.unit}</span></p>
            <p style={styles.statLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div style={styles.settingsCard}>
        <p style={styles.sectionTitle}>Settings</p>
        {[
          { icon: '🔔', label: 'Buzzer Notifications', sub: 'Alert at 60s continuous use', toggle: true, val: true },
          { icon: '🎯', label: 'Limit Reminders', sub: 'Daily progress nudges', toggle: true, val: false },
          { icon: '📊', label: 'Weekly Report', sub: 'Sunday summary email', toggle: true, val: true },
        ].map((item, i) => (
          <div key={i} style={styles.settingRow}>
            <span style={styles.settingIcon}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={styles.settingLabel}>{item.label}</p>
              <p style={styles.settingSub}>{item.sub}</p>
            </div>
            {item.toggle && (
              <div style={{ ...styles.toggle, background: item.val ? '#4ab8e8' : '#dde8ee' }}>
                <div style={{ ...styles.toggleKnob, transform: item.val ? 'translateX(18px)' : 'translateX(2px)' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* About */}
      <div style={styles.aboutCard}>
        <p style={styles.sectionTitle}>About Droplet</p>
        <p style={styles.aboutText}>
          Droplet uses a cylindrical drain sensor with 3 conductivity probes arranged in a triangle.
          Water completing the circuit activates probes, triggering flow rate estimation and waste tracking.
        </p>
        <div style={styles.aboutRow}>
          <span style={styles.aboutLabel}>Sensor Model</span>
          <span style={styles.aboutVal}>Droplet v1.0</span>
        </div>
        <div style={styles.aboutRow}>
          <span style={styles.aboutLabel}>App Version</span>
          <span style={styles.aboutVal}>1.0.0</span>
        </div>
        <div style={styles.aboutRow}>
          <span style={styles.aboutLabel}>Buzzer Threshold</span>
          <span style={styles.aboutVal}>60 seconds</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '16px 20px 24px' },
  profileCard: {
    background: 'linear-gradient(135deg, #4ab8e8, #29b6f6)',
    borderRadius: 20, padding: '24px 18px', marginBottom: 16,
    textAlign: 'center', color: '#fff',
  },
  avatarWrap: { marginBottom: 14 },
  avatar: { fontSize: 56, lineHeight: 1, marginBottom: 10 },
  avatarRow: { display: 'flex', justifyContent: 'center', gap: 8 },
  avatarBtn: {
    border: 'none', borderRadius: 10, padding: '4px 8px',
    fontSize: 18, cursor: 'pointer', transition: 'background 0.15s',
  },
  nameRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  name: { fontSize: 20, fontWeight: 700 },
  editBtn: {
    background: 'rgba(255,255,255,0.25)', border: 'none',
    borderRadius: 10, color: '#fff', fontSize: 12,
    padding: '4px 12px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
  },
  editRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  nameInput: {
    fontSize: 18, fontWeight: 600, background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.4)', borderRadius: 10,
    color: '#fff', padding: '6px 12px', fontFamily: 'Poppins, sans-serif', outline: 'none',
  },
  saveSmall: {
    background: '#fff', color: '#4ab8e8', border: 'none',
    borderRadius: 10, padding: '6px 14px', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
  },
  goal: { fontSize: 13, opacity: 0.85, marginTop: 6 },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 },
  statCard: {
    background: '#fff', borderRadius: 16, padding: '14px 16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  statVal: { fontSize: 20, fontWeight: 700, color: '#1a3a4a' },
  statUnit: { fontSize: 12, fontWeight: 400, color: '#99b8c4', marginLeft: 2 },
  statLabel: { fontSize: 11, color: '#99b8c4', marginTop: 2 },
  settingsCard: { background: '#fff', borderRadius: 20, padding: '18px', marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: '#1a3a4a', marginBottom: 14 },
  settingRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  settingIcon: { fontSize: 22 },
  settingLabel: { fontSize: 13, fontWeight: 500, color: '#1a3a4a' },
  settingSub: { fontSize: 11, color: '#99b8c4' },
  toggle: { width: 40, height: 22, borderRadius: 11, position: 'relative', flexShrink: 0, cursor: 'pointer' },
  toggleKnob: { position: 'absolute', top: 3, width: 16, height: 16, borderRadius: 8, background: '#fff', transition: 'transform 0.2s' },
  aboutCard: { background: '#fff', borderRadius: 20, padding: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  aboutText: { fontSize: 12, color: '#6a8a9a', lineHeight: 1.6, marginBottom: 14 },
  aboutRow: { display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f0f7fa', marginBottom: 10 },
  aboutLabel: { fontSize: 13, color: '#88aab8' },
  aboutVal: { fontSize: 13, fontWeight: 600, color: '#1a3a4a' },
}
