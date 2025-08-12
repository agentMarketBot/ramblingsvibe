import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import ChatApp from './components/ChatApp'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Welcome to Ramblings</h1>
          <p>Sign in to join your team's conversations</p>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#404040',
                    brandAccent: '#52525b',
                  },
                },
              },
            }}
            providers={['google', 'github']}
          />
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/app" element={<ChatApp />} />
        <Route path="/" element={<Navigate to="/app" replace />} />
      </Routes>
    </Router>
  )
}

export default App
