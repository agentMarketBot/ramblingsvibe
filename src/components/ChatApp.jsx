import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Sidebar from './Sidebar'
import ChatInterface from './ChatInterface'
import { UserProvider } from '../contexts/UserContext'
import { TeamProvider } from '../contexts/TeamContext'

export default function ChatApp() {
  const [user, setUser] = useState(null)
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  async function fetchUser() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (!profile) {
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: authUser.id,
              username: authUser.email.split('@')[0],
              full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
              avatar_url: authUser.user_metadata?.avatar_url
            })
            .select()
            .single()
          
          setUser(newProfile)
        } else {
          setUser(profile)
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="chat-app-loading">
        <div className="loading-spinner">Loading your workspace...</div>
      </div>
    )
  }

  return (
    <UserProvider value={user}>
      <TeamProvider>
        <div className="chat-app">
          <Sidebar 
            selectedChannel={selectedChannel}
            onChannelSelect={setSelectedChannel}
          />
          <ChatInterface 
            selectedChannel={selectedChannel}
            currentUser={user}
          />
        </div>
      </TeamProvider>
    </UserProvider>
  )
}