import { useState, useEffect } from 'react';
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
  const [supabaseError, setSupabaseError] = useState(null);
  const [supabase, setSupabase] = useState(null);

  useEffect(() => {
    // Initialize Supabase with error handling
    const initSupabase = async () => {
      try {
        const { supabase: supabaseClient } = await import('./lib/supabase');
        setSupabase(supabaseClient);
        
        // Get initial session
        const { data: { session } } = await supabaseClient.auth.getSession();
        setUser(session?.user ?? null);
        setLoading(false);

        // Listen for auth changes
        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
          async (event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
              loadUserData(session.user, supabaseClient);
            }
          }
        );

        return subscription;
      } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        setSupabaseError(error.message);
        setLoading(false);
        return null;
      }
    };

    let subscription = null;
    initSupabase().then(sub => {
      subscription = sub;
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const loadUserData = async (user, supabaseClient) => {
    try {
      // Load teams and channels for the user
      const { data: teamData } = await supabaseClient
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
          const { data: channelData } = await supabaseClient
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

  if (supabaseError) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>Configuration Error</h2>
          <p>{supabaseError}</p>
          <div className="error-instructions">
            <h3>To fix this issue:</h3>
            <ol>
              <li>Copy <code>.env.example</code> to <code>.env</code></li>
              <li>Add your Supabase project URL and anon key to <code>.env</code></li>
              <li>Get your credentials from <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">Supabase Dashboard</a></li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading Ramblings...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthModal supabase={supabase} />;
  }

  return (
    <div className="app">
      <Sidebar
        channels={channels}
        selectedChannel={selectedChannel}
        onChannelSelect={setSelectedChannel}
        user={user}
        supabase={supabase}
      />
      <ChatInterface
        channel={selectedChannel}
        user={user}
        supabase={supabase}
      />
    </div>
  );
}

export default App;
