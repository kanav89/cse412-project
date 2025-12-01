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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Personal Finance Tracker</h1>
        <button onClick={logoutfunction} className="btn-danger">Logout</button>
      </div>

      <div className="tab-navigation">
        {['dashboard','account','transaction','budget'].map(view => (
          <button
            key={view}
            className={`tab-button ${currVeiw === view ? 'active' : ''}`}
            onClick={() => setcurrVeiw(view)}
          >
            {view.charAt(0).toUpperCase()+view.slice(1)}
          </button>
        ))}
      </div>

      <div className="content-card">
        {currVeiw === 'dashboard' && (
          <div>
            <h2>Welcome, {user[1]} {user[2]}!</h2>
            <p style={{ color: '#718096', marginTop: '1rem' }}>
              Use the tabs above to manage your accounts, transactions, and budgets.
            </p>
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
