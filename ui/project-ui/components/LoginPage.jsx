import { useState } from 'react'


function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [error, setError] = useState('')
  
    const handleSubmit = async (e) => {
      e.preventDefault()
      setError('')
  
      try {
        if (isLogin) {
          const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })
          const data = await response.json()
          if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.user))
            window.location.href = '/dashboard'
          } else {
            setError(data.message || 'Login failed')
          }
        } else {
          const response = await fetch('http://localhost:5000/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
          })
          if (response.ok) {
            setIsLogin(true)
            setError('')
            alert('Account created! Please login.')
          } else {
            setError('Failed to create account')
          }
        }
      } catch (err) {
        setError('An error occurred. Please try again.')
      }
    }
  
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {isLogin ? 'Login' : 'Create Account'}
          </h2>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom:'1rem' }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div>{error}</div>}
            <button
              type="submit"
            >
              {isLogin ? 'Login':'Create Account'}
            </button>
          </form>
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    )
  }

export default LoginPage;
  