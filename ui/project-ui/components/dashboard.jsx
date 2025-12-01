import { useState, useEffect } from 'react'
import Account from './Account'
import Transaction from './Transaction'
import Budget from './Budget'

function DashboardSummary({ userId, userName }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
  }, [userId])

  const fetchSummary = async () => {
    try {
      const response = await fetch(`http://localhost:5000/dashboard/${userId}`)
      const data = await response.json()
      setSummary(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard summary:', error)
      setLoading(false)
    }
  }

  if (loading) return <div>Loading dashboard...</div>
  if (!summary) return <div>Unable to load dashboard</div>

  return (
    <div>
      <h2>Welcome, {userName}!</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
        <div className="summary-card">
          <p className="summary-label">Total Balance</p>
          <p className="summary-value">${summary.total_balance.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Accounts</p>
          <p className="summary-value">{summary.account_count}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">This Month's Transactions</p>
          <p className="summary-value">{summary.transaction_count}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Active Budgets</p>
          <p className="summary-value">{summary.budget_count}</p>
        </div>
      </div>

      {summary.recent_transactions && summary.recent_transactions.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Recent Transactions</h3>
          {summary.recent_transactions.map((transaction) => (
            <div key={transaction[0]} className="item-card">
              <div className="item-header">
                <div>
                  <h3 className="item-title">{transaction[8]}</h3>
                  <p className="item-subtitle">
                    {transaction[7]} • {new Date(transaction[4]).toLocaleDateString()}
                  </p>
                  {transaction[6] && (
                    <p className="item-subtitle" style={{ marginTop: '0.25rem' }}>
                      {transaction[6]}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="item-amount">${parseFloat(transaction[5]).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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
        {currVeiw === 'dashboard' && <DashboardSummary userId={user[0]} userName={`${user[1]} ${user[2]}`} />}
        {currVeiw==='account' && <Account userId={user[0]} />}
        {currVeiw==='transaction' && <Transaction userId={user[0]} />}
        {currVeiw === 'budget' && <Budget userId={user[0]} />}
      </div>
    </div>
  )
}

export default Dashboard
