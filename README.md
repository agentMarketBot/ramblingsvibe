# Ramblings App

A team chat application focused on reducing interruptions while maintaining team connection through personal "Ramblings" channels.

## Features

### Core Functionality
- **Personal Ramblings Channels**: Each team member gets their own channel where only they can post top-level messages
- **Thread-based Replies**: Anyone can reply in threaded conversations to ramblings posts
- **Muted by Default**: Ramblings channels are muted by default to reduce interruptions
- **Multiple Content Types**: Support for text updates, project ideas, photos, links, and "what if" suggestions
- **Clean, Minimalist Design**: Focused on reducing noise while keeping teams connected

### Channel System
- **Channel Sidebar**: Organized with general channels and a dedicated "Ramblings" section
- **Permission System**: Only channel owners can create top-level posts in their ramblings channels
- **Visual Indicators**: Muted channels show visual indicators, owned channels have special styling
- **Responsive Design**: Optimized for remote teams of 2-10 people

### Technical Features
- **Real-time Updates**: Live messaging with Supabase real-time subscriptions
- **User Authentication**: Secure authentication with Google/GitHub via Supabase Auth
- **Database Integration**: Full Supabase integration with Row Level Security (RLS)
- **Mobile Responsive**: Works seamlessly across desktop and mobile devices

## Getting Started

### Prerequisites
- Node.js 18+ (recommended 20+)
- A Supabase project
- Google/GitHub OAuth app (for authentication)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ramblings-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
   - Run the migration files in `supabase/migrations/` in your Supabase SQL editor
   - Enable Row Level Security (RLS) policies as defined in the migration

5. Configure authentication:
   - Set up Google/GitHub OAuth in your Supabase Auth settings
   - Add your domain to the allowed redirect URLs

6. Start the development server:
```bash
npm run dev
```

## Database Schema

The app uses Supabase with the following main tables:
- `profiles`: User profiles and metadata
- `teams`: Team information
- `team_members`: Team membership with roles
- `channels`: Channels including ramblings channels
- `messages`: Top-level posts (restricted by channel ownership for ramblings)
- `replies`: Threaded replies to messages
- `user_channel_settings`: Individual channel preferences (mute/notification settings)

## Usage

### Creating Teams
1. Sign in with Google or GitHub
2. Join an existing team or create a new one
3. Ramblings channels are automatically created for each team member

### Using Ramblings Channels
1. Navigate to your own ramblings channel to post thoughts, ideas, or updates
2. Choose content types: Text, Ideas, "What if" scenarios, Links, or Photos
3. Team members can reply in threads to engage with your posts
4. Channels are muted by default to reduce interruptions

### Team Collaboration
- Browse other team members' ramblings for insights and inspiration
- Reply in threads to provide feedback or ask questions
- Adjust notification settings per channel as needed
- Use general channels for team-wide discussions

## Contributing

This project follows modern React patterns with:
- Functional components and hooks
- Context for state management
- Clean component architecture
- Responsive CSS design
- Real-time database integration

## Tech Stack

- **Frontend**: React 18, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Custom CSS with mobile-first responsive design
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Routing**: React Router DOM

## License

This project is part of the Ramblings concept by Steph Ango (stephango.com/ramblings).
