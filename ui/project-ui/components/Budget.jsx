import { useState, useEffect } from 'react'

function Budget({ userId }) {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    category_id: '',
    amount_limit: '',
    budget_month: new Date().getMonth() + 1,
    budget_year: new Date().getFullYear()
  })

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    try {
      const [budgetsRes, categoriesRes] = await Promise.all([
        fetch(`http://localhost:5000/budgets/${userId}`),
        fetch('http://localhost:5000/categories')
      ])
      const budgetsData = await budgetsRes.json()
      const categoriesData = await categoriesRes.json()
      setBudgets(budgetsData)
      setCategories(categoriesData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const handleAddBudget = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5000/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          category_id: formData.category_id,
          amount_limit: parseFloat(formData.amount_limit),
          budget_month: parseInt(formData.budget_month),
          budget_year: parseInt(formData.budget_year)
        })
      })
      if (response.ok) {
        setFormData({
          category_id: '',
          amount_limit: '',
          budget_month: new Date().getMonth() + 1,
          budget_year: new Date().getFullYear()
        })
        setShowAddForm(false)
        fetchData()
      }
    } catch (error) {
      console.error('Error adding budget:', error)
    }
  }

  const startEdit = (budget) => {
    setEditingId(budget[0])
    setFormData({
      category_id: budget[2].toString(),
      amount_limit: budget[3].toString(),
      budget_month: budget[4],
      budget_year: budget[5]
    })
  }

  const handleUpdateBudget = async (budgetId) => {
    try {
      const response = await fetch(`http://localhost:5000/budgets/${budgetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: formData.category_id,
          amount_limit: parseFloat(formData.amount_limit),
          budget_month: parseInt(formData.budget_month),
          budget_year: parseInt(formData.budget_year)
        })
      })
      if (response.ok) {
        setEditingId(null)
        setFormData({
          category_id: '',
          amount_limit: '',
          budget_month: new Date().getMonth() + 1,
          budget_year: new Date().getFullYear()
        })
        fetchData()
      }
    } catch (error) {
      console.error('Error updating budget:', error)
    }
  }

  const deleteBudget = async (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        const response = await fetch(`http://localhost:5000/budgets/${budgetId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          fetchData()
        }
      } catch (error) {
        console.error('Error deleting budget:', error)
      }
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({
      category_id: '',
      amount_limit: '',
      budget_month: new Date().getMonth() + 1,
      budget_year: new Date().getFullYear()
    })
  }

  if (loading) {
    return <div>Loading budgets...</div>
  }

  return (
    <div>
      <div className="section-header">
        <h2>My Budgets</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          {showAddForm ? 'Cancel' : '+ Add Budget'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddBudget} className="form-card">
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
            <label>Amount Limit</label>
            <input
              type="number"
              placeholder="Amount Limit"
              value={formData.amount_limit}
              onChange={(e) => setFormData({ ...formData, amount_limit: e.target.value })}
              step="0.01"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Month</label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.budget_month}
                onChange={(e) => setFormData({ ...formData, budget_month: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                min="2020"
                max="2100"
                value={formData.budget_year}
                onChange={(e) => setFormData({ ...formData, budget_year: e.target.value })}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn-primary"
          >
            Create Budget
          </button>
        </form>
      )}

      {budgets.length===0? (
        <p className="empty-state">No budgets found. Add your first budget above.</p>
      ) : (
        <div>
          {budgets.map((budget) => {
            const category = categories.find(c => c[0] === budget[2])
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            return (
              <div
                key={budget[0]}
                className="item-card"
              >
                {editingId === budget[0] ? (
                  <div className="edit-form">
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat[0]} value={cat[0]}>
                            {cat[1]} ({cat[2]})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Amount Limit</label>
                      <input
                        type="number"
                        value={formData.amount_limit}
                        onChange={(e) => setFormData({ ...formData, amount_limit: e.target.value })}
                        step="0.01"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Month</label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={formData.budget_month}
                          onChange={(e) => setFormData({ ...formData, budget_month: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Year</label>
                        <input
                          type="number"
                          min="2020"
                          max="2100"
                          value={formData.budget_year}
                          onChange={(e) => setFormData({ ...formData, budget_year: e.target.value })}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button onClick={() => handleUpdateBudget(budget[0])} className="btn-primary">
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
                      <h3 className="item-title">
                        {category ? category[1] : 'Unknown Category'}
                      </h3>
                      <p className="item-subtitle">
                        {monthNames[budget[4] - 1]} {budget[5]}
                      </p>
                    </div>
                    <div style={{ textAlign:'right'}}>
                      <p className="item-amount">
                        ${parseFloat(budget[3]).toFixed(2)}
                      </p>
                      <p className="item-label">Limit</p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => startEdit(budget)} className="btn-small btn-primary">
                          Edit
                        </button>
                        <button onClick={() => deleteBudget(budget[0])} className="btn-small btn-danger">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Budget
