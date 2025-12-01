import { useState, useEffect } from 'react'

function Account({ userId }) {
  const [accounts, setAccounts] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [name, setname] = useState('')
  const [type, settype] = useState('Checking')
  const [balance, setbalance] = useState('0')

  useEffect(() => {
    getAcc()
  }, [userId])

  const getAcc = async () => {
    try {
      const response = await fetch(`http://localhost:5000/accounts/${userId}`)
      const data = await response.json()
      setAccounts(data)

    } catch (error) {
      console.error('Error fetching accounts:', error)

    }
  }

  const addAcc = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5000/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          account_name: name,
          account_type: type,
          current_balance: parseFloat(balance) || 0
        })
      })
      if (response.ok) {
        setname('')
        settype('Checking')
        setbalance('0')
        setShowAddForm(false)
        getAcc()
      }
    } catch (error) {
      console.error('Error adding account:', error)
    }
  }

  const startEdit = (account) => {
    setEditingId(account[0])
    setname(account[2])
    settype(account[3])
    setbalance(account[4].toString())
  }

  const updateAccount = async (accountId) => {
    try {
      const response = await fetch(`http://localhost:5000/accounts/${accountId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_name: name,
          account_type: type,
          current_balance: parseFloat(balance)
        })
      })
      if (response.ok) {
        setEditingId(null)
        setname('')
        settype('Checking')
        setbalance('0')
        getAcc()
      }
    } catch (error) {
      console.error('Error updating account:', error)
    }
  }

  const deleteAccount = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        const response = await fetch(`http://localhost:5000/accounts/${accountId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          getAcc()
        }
      } catch (error) {
        console.error('Error deleting account:', error)
      }
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setname('')
    settype('Checking')
    setbalance('0')
  }

 

  return (
    <div>
      <div className="section-header">
        <h2>My Accounts</h2>
        <button
          onClick={()=>setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          {showAddForm?'Cancel':'+ Add Account'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={addAcc} className="form-card">
          <div className="form-group">
            <label>Account Name</label>
            <input
              type="text"
              placeholder="Account Name"
              value={name}
              onChange={(e) => setname(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Account Type</label>
            <select
              value={type}
              onChange={(e) => settype(e.target.value)}
            >
              <option value="Checking">Checking</option>
              <option value="Savings">Savings</option>
              <option value="Credit">Credit</option>
              <option value="Investment">Investment</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Initial Balance</label>
            <input
              type="number"
              placeholder="Initial Balance"
              value={balance}
              onChange={(e) => setbalance(e.target.value)}
              step="0.01"
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
          >
            Create Account
          </button>
        </form>
      )}

      {accounts.length===0? (
        <p className="empty-state">No accounts found. Add your first account above.</p>
      ) : (
        <div>
          {accounts.map((account) => (
            <div key={account[0]} className="item-card">
              {editingId === account[0] ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Account Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setname(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Type</label>
                    <select value={type} onChange={(e) => settype(e.target.value)}>
                      <option value="Checking">Checking</option>
                      <option value="Savings">Savings</option>
                      <option value="Credit">Credit</option>
                      <option value="Investment">Investment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Balance</label>
                    <input
                      type="number"
                      value={balance}
                      onChange={(e) => setbalance(e.target.value)}
                      step="0.01"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button onClick={() => updateAccount(account[0])} className="btn-primary">
                      Save
                    </button>
                    <button onClick={cancelEdit} className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="item-header">
                  <div>
                    <h3 className="item-title">{account[2]}</h3>
                    <span className={`badge badge-${account[3].toLowerCase()}`}>{account[3]}</span>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p className="item-amount">
                      ${parseFloat(account[4]).toFixed(2)}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => startEdit(account)} className="btn-small btn-primary">
                        Edit
                      </button>
                      <button onClick={() => deleteAccount(account[0])} className="btn-small btn-danger">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Account
