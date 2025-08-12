-- Create profiles table for user management
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table for team membership
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Create channels table (includes ramblings channels)
CREATE TABLE channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'ramblings' CHECK (type IN ('general', 'ramblings')),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_muted_by_default BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table for top-level posts
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'link', 'photo', 'idea', 'whatif')),
  metadata JSONB, -- For storing additional data like link previews, photo URLs, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create replies table for threaded conversations
CREATE TABLE replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_channel_settings table for mute/notification preferences
CREATE TABLE user_channel_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  is_muted BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT false,
  UNIQUE(user_id, channel_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_channel_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for teams
CREATE POLICY "Team members can view their teams" ON teams FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.team_id = teams.id 
    AND team_members.user_id = auth.uid()
  ));

-- RLS Policies for team_members
CREATE POLICY "Team members can view team membership" ON team_members FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM team_members tm 
    WHERE tm.team_id = team_members.team_id 
    AND tm.user_id = auth.uid()
  ));

-- RLS Policies for channels
CREATE POLICY "Team members can view team channels" ON channels FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.team_id = channels.team_id 
    AND team_members.user_id = auth.uid()
  ));

-- RLS Policies for messages
CREATE POLICY "Team members can view messages" ON messages FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM team_members tm
    JOIN channels c ON c.team_id = tm.team_id
    WHERE c.id = messages.channel_id 
    AND tm.user_id = auth.uid()
  ));

CREATE POLICY "Only channel owners can create top-level messages in ramblings channels" ON messages FOR INSERT 
  USING (EXISTS (
    SELECT 1 FROM channels 
    WHERE channels.id = messages.channel_id 
    AND (
      channels.type != 'ramblings' OR 
      channels.owner_id = auth.uid()
    )
  ));

-- RLS Policies for replies
CREATE POLICY "Team members can view replies" ON replies FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM messages m
    JOIN channels c ON c.id = m.channel_id
    JOIN team_members tm ON tm.team_id = c.team_id
    WHERE m.id = replies.message_id 
    AND tm.user_id = auth.uid()
  ));

CREATE POLICY "Team members can create replies" ON replies FOR INSERT 
  USING (EXISTS (
    SELECT 1 FROM messages m
    JOIN channels c ON c.id = m.channel_id
    JOIN team_members tm ON tm.team_id = c.team_id
    WHERE m.id = replies.message_id 
    AND tm.user_id = auth.uid()
  ));

-- RLS Policies for user_channel_settings
CREATE POLICY "Users can manage their own channel settings" ON user_channel_settings 
  FOR ALL USING (auth.uid() = user_id);

-- Functions and triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();