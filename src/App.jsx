import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import AuthModal from './components/AuthModal';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [teams, setTeams] = useState([]);
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadUserData(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (user) => {
    try {
      // Load teams and channels for the user
      const { data: teamData } = await supabase
        .from('team_members')
        .select(`
          team_id,
          teams (
            id,
            name,
            description
          )
        `)
        .eq('user_id', user.id);

      if (teamData) {
        const userTeams = teamData.map(tm => tm.teams);
        setTeams(userTeams);

        // Load channels for all teams
        const teamIds = userTeams.map(t => t.id);
        if (teamIds.length > 0) {
          const { data: channelData } = await supabase
            .from('channels')
            .select(`
              *,
              profiles!channels_owner_id_fkey (
                display_name
              )
            `)
            .in('team_id', teamIds)
            .order('type', { ascending: true })
            .order('name', { ascending: true });

          setChannels(channelData || []);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading Ramblings...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="app">
      <Sidebar
        channels={channels}
        selectedChannel={selectedChannel}
        onChannelSelect={setSelectedChannel}
        user={user}
      />
      <ChatInterface
        channel={selectedChannel}
        user={user}
      />
    </div>
  );
}

export default App;
