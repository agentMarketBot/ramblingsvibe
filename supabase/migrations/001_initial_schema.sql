-- Create users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create team members table
CREATE TABLE public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(team_id, user_id)
);

-- Create channels table (including personal ramblings channels)
CREATE TABLE public.channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'regular' CHECK (type IN ('regular', 'ramblings')),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- For ramblings channels
  is_muted_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create posts table (top-level messages)
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'link', 'file')),
  metadata JSONB, -- For storing additional data like link previews, file info, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create replies table (threaded responses to posts)
CREATE TABLE public.replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'link', 'file')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user channel preferences table (for muting, etc.)
CREATE TABLE public.user_channel_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
  is_muted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, channel_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_channel_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Teams: Users can see teams they're members of
CREATE POLICY "Users can view teams they belong to" ON public.teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = teams.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Team members: Users can see team memberships for teams they belong to
CREATE POLICY "Users can view team members for their teams" ON public.team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid()
    )
  );

-- Channels: Users can see channels for teams they belong to
CREATE POLICY "Users can view channels for their teams" ON public.channels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = channels.team_id AND user_id = auth.uid()
    )
  );

-- Posts: Users can see posts in channels they have access to
CREATE POLICY "Users can view posts in accessible channels" ON public.posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.channels c
      JOIN public.team_members tm ON c.team_id = tm.team_id
      WHERE c.id = posts.channel_id AND tm.user_id = auth.uid()
    )
  );

-- Only channel owners can create posts in ramblings channels
CREATE POLICY "Only owners can post in ramblings channels" ON public.posts
  FOR INSERT WITH CHECK (
    (
      SELECT type FROM public.channels WHERE id = channel_id
    ) = 'regular' OR
    (
      SELECT owner_id FROM public.channels WHERE id = channel_id
    ) = auth.uid()
  );

-- Replies: Users can see replies to posts they can see
CREATE POLICY "Users can view replies to accessible posts" ON public.replies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      JOIN public.channels c ON p.channel_id = c.id
      JOIN public.team_members tm ON c.team_id = tm.team_id
      WHERE p.id = replies.post_id AND tm.user_id = auth.uid()
    )
  );

-- Users can reply to posts they can see
CREATE POLICY "Users can reply to accessible posts" ON public.replies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts p
      JOIN public.channels c ON p.channel_id = c.id
      JOIN public.team_members tm ON c.team_id = tm.team_id
      WHERE p.id = post_id AND tm.user_id = auth.uid()
    )
  );

-- User channel preferences: Users can manage their own preferences
CREATE POLICY "Users can manage their own channel preferences" ON public.user_channel_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_channels_team_id ON public.channels(team_id);
CREATE INDEX idx_channels_owner_id ON public.channels(owner_id);
CREATE INDEX idx_posts_channel_id ON public.posts(channel_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_replies_post_id ON public.replies(post_id);
CREATE INDEX idx_replies_created_at ON public.replies(created_at);
CREATE INDEX idx_user_channel_preferences_user_channel ON public.user_channel_preferences(user_id, channel_id);

-- Create function to automatically create ramblings channel for new team members
CREATE OR REPLACE FUNCTION create_ramblings_channel()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.channels (team_id, name, description, type, owner_id, is_muted_default)
  VALUES (
    NEW.team_id,
    (SELECT display_name FROM public.profiles WHERE id = NEW.user_id) || '''s Ramblings',
    'Personal channel for ' || (SELECT display_name FROM public.profiles WHERE id = NEW.user_id),
    'ramblings',
    NEW.user_id,
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create ramblings channels
CREATE TRIGGER create_ramblings_channel_trigger
  AFTER INSERT ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION create_ramblings_channel();

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();