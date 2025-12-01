import { useState, useEffect } from 'react'

function Transaction({ userId }) {
  const [transactions, setTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    account_id: '',
    category_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    amount: '',
    description: ''
  })

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    try {
      const [transRes, accountsRes, categoriesRes] = await Promise.all([
        fetch(`http://localhost:5000/transactions/${userId}`),
        fetch(`http://localhost:5000/accounts/${userId}`),
        fetch('http://localhost:5000/categories')
      ])
      const transData = await transRes.json()
      const accountsData = await accountsRes.json()
      const categoriesData = await categoriesRes.json()
      setTransactions(transData)
      setAccounts(accountsData)
      setCategories(categoriesData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const handleAddTransaction = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5000/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })
      if (response.ok) {
        setFormData({
          account_id: '',
          category_id: '',
          transaction_date: new Date().toISOString().split('T')[0],
          amount: '',
          description: ''
        })
        setShowAddForm(false)
        fetchData()
      }
    } catch (error) {
      console.error('Error adding transaction:', error)
    }
  }

  if (loading) {
    return <div>Loading transactions...</div>
  }

  return (
    <div>
      <div className="section-header">
        <h2>My Transactions</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          {showAddForm ? 'Cancel' : '+ Add Transaction'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddTransaction} className="form-card">
          <div className="form-group">
            <label>Account</label>
            <select
              value={formData.account_id}
              onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
              required
            >
              <option value="">Select Account</option>
              {accounts.map((account) => (
                <option key={account[0]} value={account[0]}>
                  {account[2]} ({account[3]})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category[0]} value={category[0]}>
                  {category[1]} ({category[2]})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Transaction Date</label>
            <input
              type="date"
              value={formData.transaction_date}
              onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <input
              type="text"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
          >
            Add Transaction
          </button>
        </form>
      )}

      {transactions.length === 0 ? (
        <p className="empty-state">No transactions found. Add your first transaction above.</p>
      ) : (
        <div>
          {transactions.map((transaction) => {
            const account = accounts.find(a => a[0] === transaction[2])
            const category = categories.find(c => c[0] === transaction[3])
            return (
              <div
                key={transaction[0]}
                className="item-card"
              >
                <div className="item-header">
                  <div>
                    <h3 className="item-title">
                      {category ? category[1] : 'Unknown'}
                    </h3>
                    <p className="item-subtitle">
                      {account ? account[2] :'Unknown Account'} • {new Date(transaction[4]).toLocaleDateString()}
                    </p>
                    {transaction[6] && (
                      <p className="item-subtitle" style={{ marginTop: '0.25rem' }}>
                        {transaction[6]}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="item-amount">
                      ${parseFloat(transaction[5]).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Transaction
