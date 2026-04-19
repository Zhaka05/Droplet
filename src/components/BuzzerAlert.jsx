export default function BuzzerAlert({ onDismiss }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <span style={styles.icon}>🚨</span>
        </div>
        <h2 style={styles.title}>Water Waste Alert!</h2>
        <p style={styles.sub}>Water has been running for over 60 seconds.</p>
        <p style={styles.msg}>
          Turn off the tap to save water and protect the environment.
        </p>
        <button style={styles.btn} onClick={onDismiss}>
          Stop Session
        </button>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    backdropFilter: 'blur(4px)',
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    padding: '32px 28px',
    textAlign: 'center',
    width: 300,
    animation: 'pulse 1s infinite alternate',
  },
  iconWrap: {
    fontSize: 56,
    marginBottom: 12,
  },
  icon: {},
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#e05252',
    marginBottom: 8,
  },
  sub: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
  },
  msg: {
    fontSize: 14,
    color: '#555',
    lineHeight: 1.5,
    marginBottom: 24,
  },
  btn: {
    background: 'linear-gradient(135deg, #e05252, #f08080)',
    color: '#fff',
    border: 'none',
    borderRadius: 30,
    padding: '14px 32px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Poppins, sans-serif',
    width: '100%',
  },
}
