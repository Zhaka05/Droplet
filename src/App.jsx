import { useState, useEffect, createContext, useContext } from 'react'
import { useSensorStore } from './store/useSensorStore'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import GoalsPage from './pages/GoalsPage'
import DevicesPage from './pages/DevicesPage'
import ProfilePage from './pages/ProfilePage'
import BuzzerAlert from './components/BuzzerAlert'

export const SensorContext = createContext(null)
export const UserContext = createContext(null)

export default function App() {
  const [tab, setTab] = useState('home')
  const [user, setUser] = useState({ name: 'Steven Le', dailyGoal: 20 })
  const sensor = useSensorStore()
  const [clock, setClock] = useState(() =>
    new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  )
  useEffect(() => {
    const id = setInterval(() =>
      setClock(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))
    , 1000)
    return () => clearInterval(id)
  }, [])

  const pages = { home: HomePage, goals: GoalsPage, devices: DevicesPage, profile: ProfilePage }
  const Page = pages[tab]

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <SensorContext.Provider value={sensor}>
        <div style={styles.phone}>
          <div style={styles.statusBar}>
            <span style={styles.time}>{clock}</span>
            <span style={styles.icons}>▲ WiFi ▮</span>
          </div>
          <div style={styles.content}>
            <Page />
          </div>
          <NavBar active={tab} onChange={setTab} />
          {sensor.buzzerActive && <BuzzerAlert onDismiss={sensor.dismissBuzzer} />}
        </div>
      </SensorContext.Provider>
    </UserContext.Provider>
  )
}

const styles = {
  phone: {
    width: 390,
    minHeight: '100vh',
    maxHeight: '100vh',
    background: '#eaf6fb',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
    borderRadius: 40,
  },
  statusBar: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 28px 0',
    fontSize: 13,
    fontWeight: 600,
    color: '#333',
    flexShrink: 0,
  },
  time: { letterSpacing: 1 },
  icons: { fontSize: 11, opacity: 0.7 },
  content: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingBottom: 8,
    scrollbarWidth: 'none',
  },
}
