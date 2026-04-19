import { Home, Target, Cpu, User } from './Icons'

const tabs = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'goals', label: 'Limit', Icon: Target },
  { id: 'devices', label: 'Devices', Icon: Cpu },
  { id: 'profile', label: 'Profile', Icon: User },
]

export default function NavBar({ active, onChange }) {
  return (
    <nav style={styles.nav}>
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button key={id} style={styles.tab} onClick={() => onChange(id)}>
            <Icon size={22} color={isActive ? '#4ab8e8' : '#aac4d0'} />
            <span style={{ ...styles.label, color: isActive ? '#4ab8e8' : '#aac4d0' }}>
              {label}
            </span>
            {isActive && <div style={styles.dot} />}
          </button>
        )
      })}
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    background: '#fff',
    borderTop: '1px solid #e0eef4',
    padding: '10px 0 18px',
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    padding: '4px 0',
  },
  label: {
    fontSize: 10,
    fontFamily: 'Poppins, sans-serif',
    fontWeight: 500,
  },
  dot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    background: '#4ab8e8',
  },
}
