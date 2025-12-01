import { useState, useEffect } from 'react'
import Account from './Account'
import Transaction from './Transaction'
import Budget from './Budget'

function Dashboard() {
  const [user, setUser] = useState(null)
  const [currVeiw, setcurrVeiw] = useState('dashboard')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      window.location.href = '/'
    }
  }, [])

  const logoutfunction = () => {
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  if (!user) return <div>Loading...</div>

  const tabStyle = {
    padding: '0.75rem 1.5rem',
    border: 'none',

    cursor: 'pointer',
    background: 'transparent',
    color: '#418C8A',
  }

  const activeTabStyle = {
    ...tabStyle,
    background: '#418C8A',
    color: 'white',
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1>Personal Finance Tracker</h1>
        <button onClick={logoutfunction}>Logout</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e0e0e0' }}>
        {['dashboard','account','transaction','budget'].map(view => (
          <button
            key={view}
            style={currVeiw===view?activeTabStyle:tabStyle}
            onClick={() => setcurrVeiw(view)}
          >
            {view.charAt(0).toUpperCase()+view.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px' }}>
        {currVeiw === 'dashboard' && (
          <div>
            <h2>Welcome, {user[1]} {user[2]}!</h2>
          </div>
        )}
        {currVeiw==='account' && <Account userId={user[0]} />}
        {currVeiw==='transaction' && <Transaction userId={user[0]} />}
        {currVeiw === 'budget' && <Budget userId={user[0]} />}
      </div>
    </div>
  )
}

export default Dashboard
